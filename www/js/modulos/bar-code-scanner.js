var BarCodeScanner = {
    qrcode: function () {
        try {
            if (Factory.$rootScope.device == 'android')
                Factory.$rootScope.location('#!/scanner');

            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text) {
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

                                    if (data.url)
                                        Factory.$rootScope.location(data.url);
                                }
                            }
                        );
                    }
                },
                function (error) {

                },
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: false,
                    showTorchButton: false,
                    torchOn: false,
                    saveHistory: false,
                    prompt: "",
                    resultDisplayDuration: 1500,
                    orientation: "portrait",
                    disableAnimations: true,
                    disableSuccessBeep: true
                }
            );
        } catch (err) {
        }
    }
};