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