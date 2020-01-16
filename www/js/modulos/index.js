app.controller('Index', function($rootScope) {
    QRScannerConf.destroy();
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
});