var BarCodeScanner = {
    qrcode: function () {
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if(result.text){
                        Factory.ajax(
                            {
                                action: 'qrcode/get',
                                data: {
                                    TEXT: result.text
                                }
                            },
                            function (data) {
                                if (data.status == 1) {
                                    if (parseInt(data.TRANSACAO_ID))
                                        Factory.$rootScope.transacaoId = parseInt(data.TRANSACAO_ID);

                                    if(data.url)
                                        Factory.$rootScope.location(data.url);
                                }
                            }
                        );
                    }
                },
                function (error) {

                },
                {
                    preferFrontCamera : false, // iOS and Android
                    showFlipCameraButton : false, // iOS and Android
                    showTorchButton : false, // iOS and Android
                    torchOn: false, // Android, launch with the torch switched on (if available)
                    saveHistory: false, // Android, save scan history (default false)
                    prompt : "", // Android
                    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                    orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                    disableAnimations : true, // iOS
                    disableSuccessBeep: true // iOS and Android
                }
            );
        } catch (err) {
        }
    },
    timeout: null,
};