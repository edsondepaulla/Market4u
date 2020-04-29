var Payment = {
    ATUALIZAR: true,
    QTDE_PRODUTOS: [],
    PRODUTOS_COMPRAS: [],
    CARRINHO_COMPRAS: [],
    timeoutBanner: [],
    clear: function (cancelar, status) {
        if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            Factory.$rootScope.VOUCHER = 0;
            Factory.$rootScope.transacaoId = 0;
            Factory.$rootScope.transacaoIdCarrinho = false;

            // Redirect
            if (!parseInt(cancelar) && status == 'success') {
                Payment.ATUALIZAR = true;
                Factory.$rootScope.location('#!/');
            }
        }
    },
    cancel: function () {
        if (Factory.$rootScope.transacaoId && !Factory.$rootScope.transacaoIdCarrinho) {
            Factory.ajax(
                {
                    action: 'payment/cancel',
                    data: {
                        TRANSACAO_ID: Factory.$rootScope.transacaoId
                    }
                }
            );
        }
    }
};

app.controller('Index', function($scope, $rootScope, $routeParams, deviceDetector) {
    if(parseInt(Login.getData().ID)) {
        $rootScope.LOCAIS = $routeParams.STEP == 'LOCAIS' ? 1 : 0;
        $rootScope.TOUR = $routeParams.STEP == 'TOUR' ? 1 : 0;
        $rootScope.ESCANEAR = $routeParams.STEP == 'ESCANEAR' ? 1 : 0;
        $rootScope.CARRINHO = $routeParams.STEP == 'CARRINHO' ? 1 : 0;
        $rootScope.PROD_DETALHES = false;
        if ($rootScope.TOUR && !parseInt($rootScope.usuario.TOUR)) {
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                Factory.ajax(
                    {
                        action: 'cadastro/tour'
                    }
                );
            }, 1000);
        }
        $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS;
        $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS;
        $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS;
        $rootScope.STEP = parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1;

        $scope.naoEncontrou = function () {
            if (!$('#sugestao').val())
                $('#sugestao').focus();
            else {
                Factory.ajax(
                    {
                        action: 'cadastro/sugestao',
                        data: {
                            DESCRICAO: $('#sugestao').val()
                        }
                    },
                    function (data) {
                        if (data.status == 1)
                            $('#sugestao').val('');
                    }
                );
            }
        };

        $rootScope.scrollLiberado = true;
        $rootScope.LOCAL = $rootScope.LOCAL ? $rootScope.LOCAL : [];
        $scope.scrollLeft = function () {
            setTimeout(function () {
                var width = 0;
                var active = 0;
                $('ul#boxCategorias li').each(function () {
                    if (!active) {
                        active = $(this).hasClass('active') ? 1 : 0;
                        if (!active)
                            width += $(this).innerWidth();
                    }
                });
                $("#boxCategorias").animate({scrollLeft: width}, 500);
                $("#boxProdutos").animate({scrollTop: 0}, 500);
                setTimeout(function () {
                    $rootScope.scrollLiberado = true;
                }, 500);
            }, 500);
        };
        $scope.banner = function (TYPE, TIME) {
            if ($('.banners[type="' + TYPE + '"] > li').length > 1) {
                clearTimeout(Payment.timeoutBanner[TYPE]);
                Payment.timeoutBanner[TYPE] = setTimeout(function () {
                    var banner = $('.banners[type="' + TYPE + '"] > li.active');
                    if (banner.length) {
                        if($('.banners[type="' + TYPE + '"]').visible()) {
                            if (banner.next('li').length)
                                banner.next('li').addClass('active');
                            else
                                $('.banners[type="' + TYPE + '"] > li:first-child').addClass('active');
                            banner.removeClass('active');
                        }
                        $scope.banner(TYPE, TIME);
                    }
                }, TIME);
            }
        };
        $rootScope.BANNERS_MODAL = $rootScope.BANNERS_MODAL ? $rootScope.BANNERS_MODAL : [];
        $scope.getCompras = function (CAT) {
            if (!parseInt(CAT.ACTIVE)) {
                clearTimeout(Payment.timeoutBanner['COMPRAS']);
                $rootScope.scrollLiberado = false;
                Factory.ajax(
                    {
                        action: 'payment/compras',
                        data: {
                            ID: parseInt(CAT.ID),
                            PRODUTO: parseInt(CAT.PRODUTO) || 0,
                            LOADER_CARREGANDO: $('#boxPago:visible').length ? false : true
                        }
                    },
                    function (data) {
                        $('body').attr('scroll', 0);
                        if (data.LOCAL)
                            $rootScope.LOCAL = data.LOCAL;
                        if (data.COMPRAS) {
                            $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS = data.COMPRAS;
                            $rootScope.BANNERS_MODAL = data.COMPRAS.BANNERS_MODAL;
                            if (data.COMPRAS.BANNERS.length) {
                                setTimeout(function () {
                                    $scope.banner('COMPRAS', data.COMPRAS.BANNERS_TIME);
                                }, 1000);
                            }
                        }
                        $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                        $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data.CARRINHO;
                        $scope.scrollLeft();
                    }
                );
            }
        };

        $rootScope.scroll = function (TYPE) {
            switch (TYPE) {
                case 'produtos':
                    Payment.PRODUTOS_COMPRAS.SCROLL['OFFSET'] += parseInt(Payment.PRODUTOS_COMPRAS.SCROLL['LIMIT']);
                    Factory.ajax(
                        {
                            action: 'payment/compras',
                            data: {
                                ID: parseInt(Payment.PRODUTOS_COMPRAS.CATEGORIA),
                                SCROLL: Payment.PRODUTOS_COMPRAS.SCROLL,
                                LOADER_CARREGANDO: false
                            }
                        },
                        function (data) {
                            $rootScope.scrollLiberado = true;
                            if (data.COMPRAS ? data.COMPRAS.SUBCATEGORIAS[0] : false) {
                                $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                $rootScope.PRODUTOS_COMPRAS.SCROLL.ATIVO = parseInt(data.COMPRAS.SCROLL.ATIVO || 0);
                                $.each(data.COMPRAS.SUBCATEGORIAS[0]['ITENS'], function (idx, item) {
                                    Payment.PRODUTOS_COMPRAS.SUBCATEGORIAS[0]['ITENS'].push(item);
                                });
                                $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS;
                            } else
                                $rootScope.PRODUTOS_COMPRAS.SCROLL.ATIVO = 0;
                        }, function () {
                            $rootScope.scrollLiberado = true;
                        }
                    );
                    break;
                case 'produtos_categorias_busca':
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL['OFFSET'] += parseInt($rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL['LIMIT']);
                    var data = null;
                    if ($rootScope.PRODUTOS_CATEGORIAS_BUSCA.BUSCA) {
                        data = {
                            BUSCA: 1,
                            PESQUISA: $rootScope.PESQUISA,
                            SCROLL: $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL,
                            LOADER_CARREGANDO: false
                        };
                    } else {
                        data = {
                            ID: parseInt($rootScope.PRODUTOS_CATEGORIAS_BUSCA.CATEGORIA),
                            SUBCATEGORIA: parseInt($rootScope.PRODUTOS_CATEGORIAS_BUSCA.SUBCATEGORIA),
                            SCROLL: $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL,
                            LOADER_CARREGANDO: false
                        };
                    }
                    Factory.ajax(
                        {
                            action: 'payment/compras',
                            data: data
                        },
                        function (data) {
                            $rootScope.scrollLiberado = true;
                            if (data.COMPRAS ? data.COMPRAS.SUBCATEGORIAS[0] : false) {
                                $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = parseInt(data.COMPRAS.SCROLL.ATIVO || 0);
                                $.each(data.COMPRAS.SUBCATEGORIAS[0]['ITENS'], function (idx, item) {
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA['ITENS'].push(item);
                                });
                            } else
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = 0;
                        }, function () {
                            $rootScope.scrollLiberado = true;
                        }
                    );
                    break;
            }
        };

        $('body').attr('scroll', 0);
        $rootScope.BTN_CARRINHO_BOTTOM = false;
        $rootScope.clickItem = function (ORIGEM, VALS) {
            switch (ORIGEM) {
                case 'locaisVoltar':
                    $rootScope.toolbar = $rootScope.CARRINHO ? false : true;
                    $rootScope.MenuBottom = true;
                    $('.boxPopup[box="locais"]').hide();
                    break;
                case 'naoEncontrou':
                    $rootScope.toolbar = false;
                    $rootScope.MenuBottom = false;
                    $rootScope.NAO_ENCONTROU = true;
                    break;
                case 'naoEncontrouVoltar':
                    $rootScope.toolbar = $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO ? false : true;
                    $rootScope.MenuBottom = $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO ? false : true;
                    $rootScope.NAO_ENCONTROU = false;
                    break;
                case 'produtoVoltar':
                    $rootScope.PESQUISA = '';
                    $rootScope.BTN_CARRINHO_BOTTOM = false;
                    if ($rootScope.PROD_DETALHES.ORIGEM == 'BUSCA_CATEGORIAS') {
                        $rootScope.toolbar = false;
                        $rootScope.MenuBottom = false;
                        $rootScope.BTN_CARRINHO_BOTTOM = true;
                    } else {
                        $rootScope.MenuBottom = true;
                        $rootScope.toolbar = $rootScope.PROD_DETALHES.ORIGEM == 'COMPRAS' ? true : false;
                    }
                    $rootScope.PROD_DETALHES = false;
                    break;
                case 'voltaLocais':
                    $('.boxPopup[box="locais"]').hide();
                    break;
                case 'busca_locais':
                    var show = true;
                    if (VALS.VERIFICA)
                        show = parseInt(Login.getData().SHOW_MAQUINAS) ? true : false;
                    if (show)
                        $('.boxPopup[box="locais"]').show();
                    break;
                case 'verProdutos':
                case 'busca':
                    $('body').attr('scroll', 0);
                    $rootScope.toolbar = false;
                    $rootScope.BTN_CARRINHO_BOTTOM = true;
                    $rootScope.MenuBottom = false;
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO = true;
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = [];
                    if (ORIGEM == 'verProdutos') {
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BUSCA = false;
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.PLACEHOLDER = VALS.CAT_DESCRICAO + VALS.DESCRICAO;
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.CATEGORIA = parseInt(VALS.CATEGORIA);
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SUBCATEGORIA = parseInt(VALS.SUBCATEGORIA);
                        Factory.ajax(
                            {
                                action: 'payment/compras',
                                data: {
                                    ID: parseInt(VALS.CATEGORIA),
                                    SUBCATEGORIA: parseInt(VALS.SUBCATEGORIA)
                                }
                            },
                            function (data) {
                                if (data.COMPRAS.SUBCATEGORIAS[0]) {
                                    $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = data.COMPRAS.SCROLL;
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = data.COMPRAS.SUBCATEGORIAS[0]['ITENS'];
                                } else {
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = 0;
                                }
                            }
                        );
                    } else {
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BUSCA = true;
                        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.PLACEHOLDER = 'Digite o que você procura';
                        $scope.buscaProdutos();
                    }
                    break;
                case 'index':
                    $rootScope.PESQUISA = '';
                    $rootScope.toolbar = true;
                    $rootScope.MenuBottom = true;
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
                    $('.boxPopup[box="locais"]').hide();
                    $rootScope.BTN_CARRINHO_BOTTOM = false;
                    break;
                case 'carrinho':
                    $rootScope.PESQUISA = '';
                    $rootScope.CARRINHO = false;
                    $rootScope.toolbar = true;
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
                    break;
                case 'carrinho2':
                    $('body').attr('scroll', 0);
                    $rootScope.MenuBottom = true;
                    $rootScope.toolbar = false;
                    $rootScope.CARRINHO = true;
                    $rootScope.PROD_DETALHES = false;
                    break;
                case 'produto':
                    $('body').attr('scroll', 0);
                    $rootScope.toolbar = false;
                    $rootScope.MenuBottom = true;
                    $rootScope.PROD_DETALHES = VALS;
                    $rootScope.BTN_CARRINHO_BOTTOM = false;
                    break;
            }
        };

        // Get produtos
        if(parseInt(Login.getData().CHECK_MAQUINAS) || true){
            if (!parseInt(Payment.PRODUTOS_COMPRAS['CATEGORIA']) || Payment.ATUALIZAR) {
                Payment.ATUALIZAR = false;
                $scope.getCompras({ID: parseInt($('ul#boxCategorias li.active').data('id')) || 0});
            } else
                $scope.scrollLeft();
        }else{

        }

        $rootScope.TIPO_PG = 'COMPRAR';
        $rootScope.MenuBottom = 1;
        $rootScope.top_0 = 0;
        switch ($rootScope.STEP) {
            case 1:
            case 2:
            case 4:
                $rootScope.MenuBottom = 1;
                break;
            case 3:
                $rootScope.top_0 = 1;
                $rootScope.MenuBottom = 0;
                $rootScope.toolbar = 0;
                break;
        }
        if ($rootScope.STEP > 1)
            $rootScope.TIPO_PG = 'PAGAMENTO';
        if ($rootScope.CARRINHO)
            $rootScope.toolbar = false;

        $scope.verCarrinho = function () {
            if ($rootScope.transacaoIdCarrinho)
                $rootScope.location('#!/index/CARRINHO');
            else
                $('#Produtos').show();
        };

        $rootScope.clickBanner = function (BANNER) {
            $rootScope.BANNERS_MODAL = [];
            switch (BANNER.TYPE) {
                case 'PRODUTO':
                    $rootScope.toolbar = false;
                    $rootScope.MenuBottom = true;
                    $rootScope.PROD_DETALHES = BANNER.VALUE;
                    break;
                case 'CATEGORIA':
                    $rootScope.clickItem('index');
                    $scope.getCompras({ID: parseInt(BANNER.VALUE)});
                    break;
                case 'BUSCA_PRODUTOS':
                    $rootScope.STEP = 1;
                    $rootScope.TIPO_PG = 'COMPRAR';
                    $rootScope.clickItem('busca');
                    $rootScope.PESQUISA = BANNER.VALUE;
                    break;
                case 'REDIRECT':
                    $rootScope.location(BANNER.VALUE, BANNER.EXTERNAL ? 1 : 0, 1);
                    break;
            }
            Factory.ajax(
                {
                    action: 'payment/bannercount',
                    data: {
                        ID: BANNER.ID
                    }
                }
            );
        };

        $rootScope.PESQUISA = '';
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
        $scope.buscaProdutos = function (PESQUISA) {
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.PLACEHOLDER = 'Digite o que você procura';
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.CATEGORIA = 0;
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SUBCATEGORIA = 0;
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BANNERS = [];
                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = [];
                clearTimeout(Payment.timeoutBanner['BUSCA']);
                Factory.ajax(
                    {
                        action: 'payment/compras',
                        data: {
                            BUSCA: 1,
                            PESQUISA: $rootScope.PESQUISA
                        }
                    },
                    function (data) {
                        if (data.COMPRAS) {
                            if (data.COMPRAS.SUBCATEGORIAS[0]) {
                                $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BANNERS = data.COMPRAS.BANNERS;
                                $rootScope.BANNERS_MODAL = data.COMPRAS.BANNERS_MODAL;
                                if (data.COMPRAS.BANNERS.length) {
                                    setTimeout(function () {
                                        $scope.banner('BUSCA', data.COMPRAS.BANNERS_TIME);
                                    }, 1000);
                                }
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = data.COMPRAS.SCROLL;
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = data.COMPRAS.SUBCATEGORIAS[0]['ITENS'];
                            } else {
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = 0;
                            }
                        }
                    }
                );
            }, PESQUISA ? 1000 : 0);
        };

        $scope.fecharCompra = function () {
            Factory.ajax(
                {
                    action: 'options/token',
                    data: {
                        TOKEN: 'fecharcompra'
                    }
                }, function (data) {
                    $rootScope.transacaoIdCarrinho = true;
                    $rootScope.transacaoId = parseInt(data.TRANSACAO_ID);
                    if (data.url)
                        $rootScope.location(data.url);
                }
            );
        };

        $scope.clearPesquisa = function () {
            $rootScope.PESQUISA = '';
            $scope.buscaProdutos();
        };

        $rootScope.setLocal = function (ITEM) {
            $rootScope.LOCAL.TEXTO = ITEM.NOME_ABV;
            $rootScope.clickItem('locaisVoltar');
            //$scope.getCompras({ID: 0});
        };

        $rootScope.SetAddRemoveQtdeProd = function (PROD, QTDE, LOADER_CARREGANDO) {
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                Factory.ajax(
                    {
                        action: 'payment/addremoveqtde',
                        data: {
                            LOADER_CARREGANDO: LOADER_CARREGANDO ? true : false,
                            ID: PROD == -1 ? -1 : PROD.PROD_ID,
                            TRANSACAO_PRODUTO: parseInt(PROD.TRANSACAO_PRODUTO) || 0,
                            UNIDADE_MEDIDA: PROD.UNIDADE_MEDIDA,
                            QTDE: QTDE
                        }
                    },
                    function (data) {
                        if (!QTDE && parseInt(PROD.PROD_ID)) {
                            PROD.QTDE = 0;
                            $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                        } else if (PROD == -1)
                            $rootScope.QTDE_PRODUTOS = [];
                        $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data;
                    }
                );
            }, PROD == -1 ? 0 : 500);
        };

        $rootScope.limparCarrinho = function () {
            var msg = 'Tem certeza que deseja limpar sua lista de compra?';
            try {
                navigator.notification.confirm(
                    msg,
                    function (buttonIndex) {
                        if (buttonIndex == 2)
                            $rootScope.SetAddRemoveQtdeProd(-1, 0, true);
                    },
                    'Confirmar',
                    'Não,Sim'
                );
            } catch (e) {
                if (confirm(msg))
                    $rootScope.SetAddRemoveQtdeProd(-1, 0, true);
            }
        };

        $rootScope.addRemoveQtdeProd = function (PROD, type, LOADER_CARREGANDO) {
            if (!PROD.QTDE_ORIGINAL)
                PROD.QTDE_ORIGINAL = parseFloat($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0);

            switch (type) {
                case '+':
                    PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0) + 1;
                    $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                    $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE, LOADER_CARREGANDO);
                    break;
                case '-':
                    if (parseFloat(PROD.QTDE)) {
                        if (parseInt(PROD.QTDE) == 1 || PROD.UNIDADE_MEDIDA == 'KG') {
                            try {
                                navigator.notification.confirm(
                                    'Tem certeza que deseja remover este item da sua lista de compra?',
                                    function (buttonIndex) {
                                        if (buttonIndex == 2)
                                            $rootScope.SetAddRemoveQtdeProd(PROD, 0, LOADER_CARREGANDO);
                                        else {
                                            PROD.QTDE = PROD.QTDE_ORIGINAL;
                                            $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                                        }
                                    },
                                    'Confirmar',
                                    'Não,Sim'
                                );
                            } catch (e) {
                                if (confirm('Tem certeza que deseja remover este item da sua lista de compra?'))
                                    $rootScope.SetAddRemoveQtdeProd(PROD, 0, LOADER_CARREGANDO);
                            }
                        } else {
                            PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID]) - 1;
                            $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                            $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE, LOADER_CARREGANDO);
                        }
                    }
                    break;
            }
        };

        $rootScope.REDIRECT = '';
        $rootScope.BTN_TYPE = 'NEXT';
        $rootScope.NO_WHATSAPP = false;
        $rootScope.TEXTO_BTN = '';
        $rootScope.TOTAL_DE = '';
        $rootScope.TOTAL_POR = '';
        $rootScope.TOTAL_DESCONTO = '';
        $rootScope.PRODUTOS = [];
        $rootScope.FORMAS_PG = [];
        $rootScope.VALOR_PG = 0;
        $rootScope.VALOR_CASHBACK = 0;
        $rootScope.CASHBACK_TEXTO = '';
        $rootScope.PAGO = 0;
        $rootScope.ACTIVE_SALDO = 1;
        $rootScope.BTN_HOME = $rootScope.STEP == 1 ? true : false;
        $rootScope.STEPS =
            [
                {
                    'STEP': 3,
                    'STEP_TEXTO': 2,
                    'TEXTO': 'Modo de pagamento'
                }
            ];

        $scope.step = function (step) {
            if (step != 4)
                $rootScope.STEP = step;
            switch (step) {
                case 3:
                case 4:
                    if (!parseInt($rootScope.transacaoId)) {
                        clearTimeout(Factory.timeout);
                        Factory.timeout = setTimeout(function () {
                            $rootScope.location('#!/');
                        }, 500);
                        return;
                    }
                    break;
            }
            switch (step) {
                case 1:
                    $rootScope.BTN_HOME = true;
                    $rootScope.transacaoId = 0;
                    $rootScope.transacaoIdCarrinho = false;
                    $rootScope.TEXTO_BTN = 'Comprar';
                    break;
                case 2:
                    $rootScope.BTN_HOME = false;
                    $rootScope.transacaoId = 0;
                    $rootScope.transacaoIdCarrinho = false;
                    BarCodeScanner.scan('qrcode');
                    break;
                case 3:
                    $rootScope.BTN_HOME = true;
                    $rootScope.BTN_TYPE = 'CANCEL';
                    $rootScope.TEXTO_BTN = 'Cancelar <i class="mdi mdi-navigation-cancel"></i>';
                    $rootScope.STATUS_TEXTO = 'Aguarde por favor, carregando...';
                    break;
                case 4:
                    $rootScope.confirmPayment('compra');
                    break;
                default:
                    clearTimeout(Factory.timeout);
                    Factory.timeout = setTimeout(function () {
                        $rootScope.location('#!/');
                    }, 500);
                    break;
            }
        };
        $scope.step($rootScope.STEP);

        $rootScope.clickBtnHome = function (swipe, type) {
            if (swipe && $rootScope.STEP != 1)
                return;

            switch ($rootScope.BTN_TYPE) {
                case 'INICIO':
                case 'CANCEL':
                    Payment.clear(1);
                    clearTimeout(Factory.timeout);
                    Factory.timeout = setTimeout(function () {
                        $rootScope.location('#!/');
                    }, 500);
                    break;
                default:
                    $scope.step($rootScope.STEP + 1);
                    break;
            }
        };

        $scope.selectVoucher = function (ITENS, V) {
            if (V.ACTIVE) {
                V.ACTIVE = 0;
                $rootScope.VOUCHER = 0;
            } else {
                $.each(ITENS, function (idx, item_each) {
                    item_each.ACTIVE = 0;
                });
                V.ACTIVE = 1;
                $rootScope.VOUCHER = V.ID;
                $rootScope.VOUCHER_VALOR = V.VALOR_FORMAT;
                $rootScope.VOUCHER_SOBRE_PROMOCAO = parseInt(V.SOBRE_PROMOCAO);
            }
            $rootScope.verifyLimitFormasPg();
        };

        $scope.activeVoucher = function () {
            if ($rootScope.FORMAS_PG['VOUCHER']) {
                $.each($rootScope.FORMAS_PG['VOUCHER']['ITENS'], function (idx, voucher) {
                    if (voucher.ACTIVE) {
                        $rootScope.VOUCHER = voucher.ID;
                        $rootScope.VOUCHER_VALOR = voucher.VALOR_FORMAT;
                        $rootScope.VOUCHER_SOBRE_PROMOCAO = parseInt(voucher.SOBRE_PROMOCAO);
                    }
                });
            }
        };

        $scope.addVoucher = function () {
            if ($rootScope.ADD_VOUCHER || '') {
                Factory.ajax(
                    {
                        action: 'cadastro/addvoucher',
                        data: {
                            TRANSACAO_ID: parseInt($rootScope.transacaoId),
                            ADD_VOUCHER: $rootScope.ADD_VOUCHER
                        }
                    },
                    function (data) {
                        $rootScope.ADD_VOUCHER = '';
                        if (data.ITENS) {
                            $rootScope.FORMAS_PG['VOUCHER']['ITENS'] = data.ITENS;
                            $scope.activeVoucher();
                        }
                        $rootScope.verifyLimitFormasPg();
                    }
                );
            } else
                $('#ADD_VOUCHER').focus();
        };

        $rootScope.cancel = function () {
            Payment.cancel();
        };

        if ($rootScope.STEP == 3) {
            var verify_paymento = null;
            $rootScope.verify = function (time) {
                if (verify_paymento)
                    clearTimeout(verify_paymento);

                verify_paymento = setTimeout(function () {
                    if (parseInt($rootScope.transacaoId)) {
                        Factory.ajax(
                            {
                                action: 'payment/verify',
                                data: {
                                    TRANSACAO_ID: parseInt($rootScope.transacaoId)
                                }
                            },
                            function (data) {
                                if (parseInt($rootScope.transacaoId)) {
                                    if (data.STATUS) {
                                        if (typeof data.STATUS_TEXTO !== 'undefined')
                                            $rootScope.STATUS_TEXTO = data.STATUS_TEXTO;
                                        if (typeof data.BTN_HOME !== 'undefined')
                                            $rootScope.BTN_HOME = data.BTN_HOME;
                                        if (typeof data.BTN_TYPE !== 'undefined')
                                            $rootScope.BTN_TYPE = data.BTN_TYPE;
                                        if (typeof data.TEXTO_BTN !== 'undefined')
                                            $rootScope.TEXTO_BTN = data.TEXTO_BTN;
                                        if (typeof data.FORMAS_PG !== 'undefined')
                                            $rootScope.FORMAS_PG = data.FORMAS_PG;
                                        if (typeof data.PRODUTOS !== 'undefined')
                                            $rootScope.PRODUTOS = data.PRODUTOS;
                                        if (typeof data.STEP !== 'undefined')
                                            $rootScope.STEP = data.STEP;
                                        if (typeof data.STEPS !== 'undefined')
                                            $rootScope.STEPS = data.STEPS;

                                        switch (data.STATUS) {
                                            case 'authorized':
                                            case 'pg_autorizado':
                                                if (!$rootScope.PAGO) {
                                                    $rootScope.PAGO = 1;
                                                    $('#boxPago').css('opacity', 1).show();
                                                    var audio = new Audio('audio/song.mp4');
                                                    audio.play();
                                                    setTimeout(function () {
                                                        $('#boxPago').css('opacity', 0).hide();
                                                    }, 3000);
                                                }
                                                break;
                                            case 'waiting_authorization':
                                                $scope.activeVoucher();

                                                // PagSeguro
                                                $.each(data.FORMAS_PG, function (idx, f_pg) {
                                                    if (f_pg.GATEWAY == 'PAGSEGURO')
                                                        $rootScope.pagseguro(0, null, 1000);
                                                });

                                                // Verify limit formas pg
                                                $rootScope.verifyLimitFormasPg();
                                                break;
                                        }

                                        if (parseInt(data.CLEAR))
                                            Payment.clear(0, data.STATUS);
                                        else
                                            $rootScope.verify(1000);
                                    } else
                                        $rootScope.verify(1000);
                                }
                            }, function () {
                                $rootScope.verify(1000);
                            }
                        );
                    }
                }, time ? time : 100);
            };
            $rootScope.verify();
        }
    }else
        $rootScope.location('#!/conecte-se');
});