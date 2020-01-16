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
            Factory.$rootScope.actionCancel = 1;
            Factory.$rootScope.showBtnCancel = Factory.$rootScope.showPaymentFlag = false;
            Factory.ajax(
                {
                    action: 'payment/cancel',
                    data: {
                        TRANSACAO_ID: Factory.$rootScope.transacaoId
                    }
                },
                function (data) {
                    Factory.$rootScope.verify();
                }
            );
        }
    }
};

app.controller('PaymentStart', function($rootScope, $scope, $routeParams, ReturnData) {
    if(ReturnData) {
        $rootScope.Titulo = "Compra em andamento";
        QRScannerConf.destroy();
        $rootScope.actionCancel = 0;
        $rootScope.NO_WHATSAPP = false;
        $rootScope.showPaymentFlag = false;
        $rootScope.showBtnVoltar = 0;
        $rootScope.border_top = 1;
        $rootScope.showBtnCancel = 1;
        $rootScope.ICON_PROGRESS = '';
        $rootScope.ADD_VOUCHER = '';
        $rootScope.FORMA_PAGAMENTO = null;
        $rootScope.ACTIVE_SALDO = 0;
        $rootScope.FORMAS_PG = [];
        $rootScope.VALOR_PG = 0;
        $rootScope.VOUCHER_VALOR = 0;
        $rootScope.VOUCHER_SOBRE_PROMOCAO = 0;
        $rootScope.VOUCHER = 0;
        $scope.PROD = [];
        $scope.PERCENTUAL = 5;
        $scope.STATUS_TEXTO = 'Aguarde por favor, carregando...';
        $rootScope.transacaoId = parseInt(ReturnData.TRANSACAO_ID);
        if (ReturnData.status == 1) {
            if ($rootScope.transacaoId) {
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
                    if($rootScope.FORMAS_PG['VOUCHER']) {
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
                                            $scope.PERCENTUAL = data.PERCENTUAL;
                                            $rootScope.ICON_PROGRESS = data.ICON_PROGRESS;
                                            $rootScope.showBtnVoltar = data.showBtnVoltar;
                                            $rootScope.showBtnCancel = data.showBtnCancel;
                                            $scope.STATUS_TEXTO = data.STATUS_TEXTO ? data.STATUS_TEXTO : 'Aguarde por favor, carregando...';
                                            $scope.SUB_STATUS = data.SUB_STATUS;

                                            switch (data.STATUS) {
                                                case 'waiting_authorization':
                                                    $scope.PROD = data.PROD;
                                                    $rootScope.FORMAS_PG = data.FORMAS_PG;
                                                    $scope.activeVoucher();
                                                    if (!$rootScope.actionCancel)
                                                        $rootScope.showPaymentFlag = true;

                                                    // PagSeguro
                                                    $rootScope.pagseguro();

                                                    // Verify limit formas pg
                                                    $rootScope.verifyLimitFormasPg();
                                                    break;
                                            }

                                            if (parseInt(data.CLEAR))
                                                Payment.clear();
                                            else if (data.STATUS != 'waiting_authorization')
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
        } else {
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.PERCENTUAL = ReturnData.PERCENTUAL;
                    $rootScope.ICON_PROGRESS = ReturnData.ICON_PROGRESS;
                    $rootScope.showBtnVoltar = ReturnData.showBtnVoltar;
                    $rootScope.showBtnCancel = 0;
                    $scope.STATUS_TEXTO = ReturnData.STATUS_TEXTO ? ReturnData.STATUS_TEXTO : 'Aguarde por favor, carregando...';
                    $scope.SUB_STATUS = ReturnData.SUB_STATUS;
                });
            }, 1000);
        }
    }
});