var Payment = {
    ATUALIZAR: true,
    QTDE_PRODUTOS: [],
    PRODUTOS_COMPRAS: [],
    CARRINHO_COMPRAS: [],
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

app.controller('Index', function($scope, $rootScope, $routeParams) {
    $rootScope.TOUR = $routeParams.STEP == 'TOUR' ? 1 : 0;
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
    $scope.getCompras = function (CAT, COORDS) {
        if (!parseInt(CAT.ACTIVE)) {
            $rootScope.scrollLiberado = false;
            Factory.ajax(
                {
                    action: 'payment/compras',
                    data: {
                        ID: parseInt(CAT.ID),
                        COORDS: COORDS ? COORDS : null,
                        LOADER_CARREGANDO: $('#boxPago:visible').length ? false : true
                    }
                },
                function (data) {
                    if (data.LOCAL)
                        $rootScope.LOCAL = data.LOCAL;
                    $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS = data.COMPRAS;
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
                        if (data.COMPRAS.SUBCATEGORIAS[0]) {
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
                        if (data.COMPRAS.SUBCATEGORIAS[0]) {
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

    if (!parseInt(Payment.PRODUTOS_COMPRAS['CATEGORIA']) || Payment.ATUALIZAR) {
        Payment.ATUALIZAR = false;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    $scope.getCompras({ID: parseInt($('ul#boxCategorias li.active').data('id') || 0)}, position.coords ? position.coords : -1);
                },
                function(){
                    $scope.getCompras({ID: parseInt($('ul#boxCategorias li.active').data('id') || 0)}, -1);
                }
            );
        } else
            $scope.getCompras({ID: parseInt($('ul#boxCategorias li.active').data('id') || 0)}, -1);
    } else
        $scope.scrollLeft();

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

    $rootScope.PESQUISA = '';
    $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
    $scope.buscaProdutos = function (PESQUISA) {
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.PLACEHOLDER = 'Digite o que você procura';
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.CATEGORIA = 0;
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SUBCATEGORIA = 0;
        clearTimeout(Factory.timeout);
        Factory.timeout = setTimeout(function () {
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = [];
            Factory.ajax(
                {
                    action: 'payment/compras',
                    data: {
                        BUSCA: 1,
                        PESQUISA: $rootScope.PESQUISA
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
        }, PESQUISA ? 1000 : 0);
    };

    $scope.fecharCompra = function () {
        var msg = "Local de compra: " + $rootScope.LOCAL.TEXTO;
        try {
            navigator.notification.confirm(
                msg,
                function (buttonIndex) {
                    if (buttonIndex == 1)
                        location('#!/token/fecharcompra', 0, 1);
                    else
                        $rootScope.clickItem('busca_locais');
                },
                'Confirmar',
                'Sim,Não'
            );
        } catch (e) {
            if (confirm(msg))
                location('#!/token/fecharcompra', 0, 1);
            else
                $rootScope.clickItem('busca_locais');
        }
    };

    $scope.clearPesquisa = function () {
        $rootScope.PESQUISA = '';
        $scope.buscaProdutos();
    };

    $rootScope.clickItem = function (ORIGEM, VALS) {
        switch (ORIGEM) {
            case 'locaisVoltar':
                $rootScope.toolbar = $rootScope.CARRINHO?false:true;
                $rootScope.MenuBottom = true;
                $rootScope.LOCAL.ATIVO = false;
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
                if ($rootScope.PROD_DETALHES.ORIGEM == 'BUSCA_CATEGORIAS') {
                    $rootScope.toolbar = false;
                    $rootScope.MenuBottom = false;
                } else {
                    $rootScope.MenuBottom = true;
                    $rootScope.toolbar = $rootScope.PROD_DETALHES.ORIGEM == 'COMPRAS' ? true : false;
                }
                $rootScope.PROD_DETALHES = false;
                break;
            case 'busca_locais':
                $rootScope.toolbar = false;
                $rootScope.MenuBottom = true;
                $rootScope.LOCAL.ATIVO = true;
                break;
            case 'verProdutos':
            case 'busca':
                $rootScope.toolbar = false;
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
                $rootScope.LOCAL.ATIVO = false;
                break;
            case 'carrinho':
                $rootScope.PESQUISA = '';
                $rootScope.CARRINHO = false;
                $rootScope.toolbar = true;
                $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
                break;
        }
    };

    $scope.setLocal = function (ITEM) {
        $rootScope.LOCAL.TEXTO = ITEM.NOME_ABV;
        $rootScope.clickItem('locaisVoltar');
        $scope.getCompras({ID: 0}, parseInt(ITEM.ID));
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
                    if (buttonIndex == 1)
                        $rootScope.SetAddRemoveQtdeProd(-1, 0, true);
                },
                'Confirmar',
                'Sim,Não'
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
                                    if (buttonIndex == 1)
                                        $rootScope.SetAddRemoveQtdeProd(PROD, 0, LOADER_CARREGANDO);
                                    else {
                                        PROD.QTDE = PROD.QTDE_ORIGINAL;
                                        $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                                    }
                                },
                                'Confirmar',
                                'Sim,Não'
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
});