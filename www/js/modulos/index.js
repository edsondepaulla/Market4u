var Payment = {
    clear: function (cancelar) {
        if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            Factory.$rootScope.transacaoId = 0;
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
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $rootScope.BTN_TYPE = 'NEXT';
    $rootScope.TEXTO_BTN = '';
    $rootScope.TOTAL_DE = '';
    $rootScope.TOTAL_POR = '';
    $rootScope.TOTAL_DESCONTO = '';
    $rootScope.PRODUTOS = [];
    $rootScope.FORMAS_PG = [];
    $rootScope.VALOR_PG = 0;
    $rootScope.ACTIVE_SALDO = 0;
    $rootScope.STEP = parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1;
    $rootScope.BTN_HOME = $rootScope.STEP == 1 ? true : false;
    $rootScope.STEPS =
        [
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
                'TEXTO': 'Compra realizada'
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
                    Factory.timeout = setTimeout(function(){
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
                QRScannerConf.show();
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
                Factory.timeout = setTimeout(function(){
                    $rootScope.location('#!/');
                }, 500);
                break;
        }
    };
    $scope.step($rootScope.STEP);

    $rootScope.clickBtnHome = function (swipe, type) {
        if(swipe && $rootScope.STEP != 1)
            return;

        switch ($rootScope.BTN_TYPE) {
            case 'INICIO':
            case 'CANCEL':
                Payment.clear(1);
                clearTimeout(Factory.timeout);
                Factory.timeout = setTimeout(function(){
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
                    if (data.ITENS || parseInt(data.status))
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
                                            $('#boxPago').show();
                                            var audio = new Audio('audio/song.mp4');
                                            audio.play();
                                            setTimeout(function () {
                                                $('#boxPago').hide();
                                            }, 3000);
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
                                        Payment.clear();
                                    else/* if(data.STATUS != 'waiting_authorization')*/
                                        $rootScope.verify(1000);
                                } else
                                    $rootScope.verify(1000);
                            } else {
                                clearTimeout(Factory.timeout);
                                Factory.timeout = setTimeout(function(){
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