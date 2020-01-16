app.controller('ProdutosGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.Titulo = "Detalhes do item";
    QRScannerConf.destroy();
    $scope.REG = ReturnData;
    $scope.imgFull = 0;
    $rootScope.REDIRECT = '';

    $scope.payment = function () {
        var url = '#!/payment/' + $routeParams.MAQUINA + ($routeParams.JSON ? '/' + $routeParams.JSON : '');
        if (!parseInt(Login.getData().ID))
            $rootScope.REDIRECT = btoa(url);
        $rootScope.location(parseInt(Login.getData().ID) ? url : '#!/conecte-se');
    };

    $scope.img = function (v) {
        var idx_active = 0;
        $.each($scope.REG.PRODUTO.IMGS, function (idx, IMG) {
            if (IMG.ACTIVE)
                idx_active = idx;
            IMG.ACTIVE = 0;
        });
        switch (v) {
            case 'left':
                idx_active = idx_active - 1;
                if (idx_active == -1)
                    idx_active = $scope.REG.PRODUTO.IMGS.length - 1;
                break;
            case 'right':
                idx_active = idx_active + 1;
                break;
        }
        if (!$scope.REG.PRODUTO.IMGS[idx_active])
            idx_active = 0;
        $scope.REG.PRODUTO.IMGS[idx_active].ACTIVE = 1;
    };

    $scope.verImg = function (v) {
        $scope.imgFull = v;
        $rootScope.toolbar = !v;
    };
});