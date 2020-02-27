var BarCodeScanner = {
    getQrcode(text) {
        Factory.ajax(
            {
                action: 'qrcode/get',
                data: {
                    TEXT: text
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
    },
    qrcode: function () {
        try {
            if (Factory.$rootScope.device == 'android')
                Factory.$rootScope.location('#!/scanner');

            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text)
                        BarCodeScanner.getQrcode(result.text);
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
                    resultDisplayDuration: 0,
                    orientation: "portrait",
                    disableAnimations: true,
                    disableSuccessBeep: true
                }
            );
        } catch (err) {
            try {
                navigator.notification.prompt(
                    'Digite o código',
                    function (results) {
                        if (results.buttonIndex == 1) {
                            if (results.input1.length)
                                BarCodeScanner.getQrcode(results.input1);
                            else
                                return false;
                        }
                    },
                    'Atenção',
                    ['Continue', 'Cancelar'],
                    ''
                );
            } catch (err) {
                var text = prompt("Digite o código", "");
                if (text != null)
                    BarCodeScanner.getQrcode(text);
            }
        }
    }
};