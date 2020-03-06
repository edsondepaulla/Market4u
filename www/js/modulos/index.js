var Payment = {
    QTDE_PRODUTOS: [],
    PRODUTOS_COMPRAS: [],
    CARRINHO_COMPRAS: [],
    clear: function (cancelar, status) {
        if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            Factory.$rootScope.transacaoId = 0;
            Factory.$rootScope.transacaoIdCarrinho = false;

            // Redirect
            if (!parseInt(cancelar) && status == 'success')
                Factory.$rootScope.location('#!/');
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

    $scope.getCompras = function (CAT) {
        if(!parseInt(CAT.ACTIVE)) {
            Factory.ajax(
                {
                    action: 'payment/compras',
                    data: {
                        ID: parseInt(CAT.ID)
                    }
                },
                function (data) {
                    $('#boxProdutos').scrollTop(0);
                    $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS = data.COMPRAS;
                    $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                    $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data.CARRINHO;
                }
            );
        }
    };

    $rootScope.scroll = function(ID) {
        Payment.PRODUTOS_COMPRAS.SCROLL['OFFSET'] += parseInt(Payment.PRODUTOS_COMPRAS.SCROLL['LIMIT']);
        Factory.ajax(
            {
                action: 'payment/compras',
                data: {
                    ID: parseInt(Payment.PRODUTOS_COMPRAS.CATEGORIA),
                    SCROLL: Payment.PRODUTOS_COMPRAS.SCROLL
                }
            },
            function (data) {
                $.each(data.COMPRAS.SUBCATEGORIAS[0]['ITENS'], function (idx, item) {
                    Payment.PRODUTOS_COMPRAS.SUBCATEGORIAS[0]['ITENS'].push(item);
                });
                $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS;
            }
        );
    };

    if ($rootScope.usuario.COMPRAR)
        $scope.getCompras({ID: 0});

    if (($rootScope.usuario.COMPRAR && $rootScope.usuario.AUTOATENDIMENTO) || $rootScope.usuario.COMPRAR || $rootScope.CARRINHO) {
        $rootScope.TIPO_PG = 'COMPRAR';
        $rootScope.MenuBottom = 1;
    }else if ($rootScope.usuario.AUTOATENDIMENTO)
        $rootScope.TIPO_PG = 'PAGAMENTO';
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
        if($rootScope.transacaoIdCarrinho)
            $rootScope.location('#!/index/CARRINHO');
        else
            $('#Produtos').show();
    };

    $scope.clearPesquisa = function () {
        $rootScope.pesquisa = '';
    };

    $rootScope.PRODUTOS_BUSCA = [];
    $scope.clickItem = function (ORIGEM) {
        switch (ORIGEM) {
            case 'busca':
                $rootScope.toolbar = false;
                $rootScope.MenuBottom = false;
                $rootScope.PRODUTOS_BUSCA.ATIVO = true;
                setTimeout(function(){
                    $('.boxPopup[box="busca"] #busca input').focus();
                }, 500);
                break;
            case 'index':
                $rootScope.toolbar = true;
                $rootScope.MenuBottom = true;
                $rootScope.PRODUTOS_BUSCA.ATIVO = false;
                break;
            case 'carrinho':
                $rootScope.CARRINHO = false;
                $rootScope.toolbar = true;
                break;
        }
    };

    $rootScope.SetAddRemoveQtdeProd = function (PROD, QTDE) {
        clearTimeout(Factory.timeout);
        Factory.timeout = setTimeout(function () {
            Factory.ajax(
                {
                    action: 'payment/addremoveqtde',
                    data: {
                        ID: PROD == -1 ? -1 : PROD.PROD_ID,
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
        }, 500);
    };

    $rootScope.limparCarrinho = function () {
        try {
            navigator.notification.confirm(
                'Tem certeza que deseja sua lista de compra?',
                function (buttonIndex) {
                    if (buttonIndex == 1)
                        $rootScope.SetAddRemoveQtdeProd(-1, 0);
                },
                'Confirmar',
                'Sim,Não'
            );
        } catch (e) {
            if (confirm('Tem certeza que deseja sua lista de compra?'))
                $rootScope.SetAddRemoveQtdeProd(-1, 0);
        }
    };

    $rootScope.addRemoveQtdeProd = function (PROD, type) {
        if (!PROD.QTDE_ORIGINAL)
            PROD.QTDE_ORIGINAL = parseFloat($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0);

        switch (type) {
            case '+':
                PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0) + 1;
                $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE);
                break;
            case '-':
                if (parseFloat(PROD.QTDE)) {
                    if (parseInt(PROD.QTDE) == 1 || PROD.UNIDADE_MEDIDA == 'KG') {
                        try {
                            navigator.notification.confirm(
                                'Tem certeza que deseja remover este item da sua lista de compra?',
                                function (buttonIndex) {
                                    if (buttonIndex == 1)
                                        $rootScope.SetAddRemoveQtdeProd(PROD, 0);
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
                                $rootScope.SetAddRemoveQtdeProd(PROD, 0);
                        }
                    } else {
                        PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID]) - 1;
                        $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                        $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE);
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