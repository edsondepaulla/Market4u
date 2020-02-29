var Payment = {
    CARRINHO_COMPRAS: [],
    clear: function (cancelar, status) {
        if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            Factory.$rootScope.transacaoId = 0;

            // Redirect
            if (!parseInt(cancelar) && status == 'success')
                Factory.$rootScope.location('#!/');
        }
    },
    cancel: function () {
        if (Factory.$rootScope.transacaoId) {
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
    $rootScope.STEP = parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1;
    if ($rootScope.usuario.COMPRAR) {
        Factory.ajax(
            {
                action: 'payment/carrinho'
            },
            function (data) {
                $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data;
            }
        );
    }
    if ($rootScope.CARRINHO)
        $rootScope.TIPO_PG = 'COMPRAR';
    else {
        $rootScope.TIPO_PG = false;
        if ($rootScope.usuario.COMPRAR && $rootScope.usuario.AUTOATENDIMENTO)
            $rootScope.TIPO_PG = 'INICIO';
        else if ($rootScope.usuario.COMPRAR)
            $rootScope.TIPO_PG = 'COMPRAR';
        else if ($rootScope.usuario.AUTOATENDIMENTO)
            $rootScope.TIPO_PG = 'PAGAMENTO';
        switch ($rootScope.STEP) {
            case 1:
            case 2:
            case 4:
                $rootScope.MenuBottom = 1;
                break;
        }
    }
    if ($rootScope.STEP > 1)
        $rootScope.TIPO_PG = 'PAGAMENTO';
    if ($rootScope.TIPO_PG == 'COMPRAR')
        $rootScope.toolbar = false;

    $rootScope.SetAddRemoveQtdeProd = function (ID, QTDE) {
        clearTimeout(Factory.timeout);
        Factory.timeout = setTimeout(function () {
            Factory.ajax(
                {
                    action: 'payment/addremoveqtde',
                    data: {
                        ID: ID,
                        QTDE: QTDE
                    }
                },
                function (data) {
                    if (!parseInt(QTDE))
                        $rootScope.PROD_DETALHES = false;
                    $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data;
                }
            );
        }, 500);
    };

    $rootScope.addRemoveQtdeProd = function (PROD, type) {
        if (!PROD.QTDE_ORIGINAL)
            PROD.QTDE_ORIGINAL = PROD.QTDE;

        switch (type) {
            case '+':
                PROD.QTDE = parseInt(PROD.QTDE) + 1;
                $rootScope.SetAddRemoveQtdeProd(PROD.PROD_ID, PROD.QTDE);
                break;
            case '-':
                if (parseInt(PROD.QTDE) == 1 || PROD.UNIDADE_MEDIDA == 'KG') {
                    try {
                        navigator.notification.confirm(
                            'Tem certeza que deseja remover este item da sua lista de compra?',
                            function (buttonIndex) {
                                if (buttonIndex == 1)
                                    $rootScope.SetAddRemoveQtdeProd(PROD.PROD_ID, 0);
                                else
                                    PROD.QTDE = PROD.QTDE_ORIGINAL;
                            },
                            'Confirmar',
                            'Sim,Não'
                        );
                    } catch (e) {
                        if (confirm('Tem certeza que deseja remover este item da sua lista de compra?'))
                            $rootScope.SetAddRemoveQtdeProd(PROD.PROD_ID, 0);
                    }
                } else {
                    PROD.QTDE = parseInt(PROD.QTDE) - 1;
                    $rootScope.SetAddRemoveQtdeProd(PROD.PROD_ID, PROD.QTDE);
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
                'STEP': 'AA',
                'TEXTO': 'Autoatendimento'
            },
            {
                'STEP': 1,
                'STEP_TEXTO': 1,
                'TEXTO': 'Ler o QRCode'
            },
            {
                'STEP': 3,
                'STEP_TEXTO': 2,
                'TEXTO': 'Modo de pagamento'
            },
            {
                'STEP': 4,
                'STEP_TEXTO': 3,
                'TEXTO': 'Compra realizada com sucesso'
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
                $rootScope.TEXTO_BTN = '<img src="img/qrcode.png"> Comprar';
                break;
            case 2:
                $rootScope.BTN_HOME = false;
                $rootScope.transacaoId = 0;
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
                            } else {
                                clearTimeout(Factory.timeout);
                                Factory.timeout = setTimeout(function () {
                                    $rootScope.location('#!/');
                                }, 500);
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