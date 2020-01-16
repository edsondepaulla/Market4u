app.controller('MaquinasFiltros', function($rootScope, $scope, $routeParams) {
    $rootScope.Titulo = "Filtros";
    QRScannerConf.destroy();
});

app.controller('MaquinasLst', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.Titulo = "Condomínios";
    QRScannerConf.destroy();
    $rootScope.REDIRECT = '';

    var timeoutGetLst = null;
    $scope.getLst = function(pesquisa) {
        if(timeoutGetLst)
            clearTimeout(timeoutGetLst);
        timeoutGetLst = setTimeout(function(){
            Factory.ajax(
                {
                    action: 'maquinas/lst',
                    data: {
                        Q: $rootScope.pesquisa || ''
                    }
                },
                function (data) {
                    $scope.LST = data.LST;
                }
            );
        }, pesquisa?1000:0);
    };
    $scope.LST = ReturnData.LST;

    $scope.clearPesquisa = function() {
        $rootScope.pesquisa = '';
        $scope.getLst();
    };

    $scope.click = function(EST) {
        $rootScope.location('#!/maquinas/' + EST.ID);
    };
});

app.controller('MaquinasGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.Titulo = "Detalhes";
    $rootScope.REDIRECT = '';
    QRScannerConf.destroy();
    $scope.REG = ReturnData;
    $scope.produto = function (MAQUINA, PROD) {
        $rootScope.location('#!/produtos/' + MAQUINA + '/' + btoa(JSON.stringify(PROD.PLANOGRAMA)));
    };
});