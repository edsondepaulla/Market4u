var Payment = {
    clear: function (cancelar) {
        /*if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            Factory.$rootScope.transacaoId = 0;
        }*/
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

app.controller('Index', function($scope, $rootScope, $routeParams) {
    QRScannerConf.destroy();
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $scope.STEP = parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1;

    $scope.step = function(step) {
        $scope.STEP = step;
        switch ($scope.STEP) {
            case 3:
            case 4:
                if(!parseInt($rootScope.transacaoId))
                    $rootScope.location('#!/');
                break;
        }
        switch ($scope.STEP) {
            case 1:
                $rootScope.transacaoId = 0;
                $scope.TEXTO_BTN = 'Começar <i class="mdi mdi-navigation-arrow-forward"></i>';
                break;
            case 2:
                $rootScope.transacaoId = 0;
                $scope.TEXTO_BTN = 'Ler o QRCode';
                break;
            case 3:
                $scope.TEXTO_BTN = 'Finalizar compra <i class="mdi mdi-navigation-arrow-forward"></i>';
                break;
            case 4:
                $scope.TEXTO_BTN = '<i class="mdi mdi-navigation-check"></i>';
                break;
        }
    };
    $scope.step($scope.STEP);

    $scope.nextStep = function() {
        $scope.STEP++;
        $scope.step($scope.STEP);
        switch ($scope.STEP) {
            case 2:
                $rootScope.location('#!/qr-code');
                break;
            case 4:
                $rootScope.transacaoId = 0;
                break;
            case 5:
                $rootScope.location('#!/');
                break;
        }
    };
});