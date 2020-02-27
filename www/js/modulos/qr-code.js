var QRScannerConf = {
    digite: function () {
        try {
            navigator.notification.prompt(
                'Digite o código',
                function (results) {
                    if (results.buttonIndex == 1) {
                        if (results.input1.length)
                            QRScannerConf.scan(results.input1);
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
                QRScannerConf.scan(text);
        }
    },
    show: function () {
        Factory.$rootScope.Titulo = 'LER O QRCODE';
        Factory.$rootScope.QRCODE = 1;
        clearTimeout(QRScannerConf.timeout);
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    alert("We got a barcode\n" +
                        "Result: " + result.text + "\n" +
                        "Format: " + result.format + "\n" +
                        "Cancelled: " + result.cancelled);
                },
                function (error) {
                    
                },
                {
                    preferFrontCamera : false, // iOS and Android
                    showFlipCameraButton : true, // iOS and Android
                    showTorchButton : true, // iOS and Android
                    torchOn: false, // Android, launch with the torch switched on (if available)
                    saveHistory: false, // Android, save scan history (default false)
                    prompt : "", // Android
                    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                   // formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                    orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                    disableAnimations : true, // iOS
                    disableSuccessBeep: true // iOS and Android
                }
            );

            /*QRScanner.prepare(function (err, status) {
                if (err) {

                }
                if (status.authorized) {
                    try {
                        QRScanner.scan(function (err, text) {
                            if (err) {

                            } else {
                                QRScannerConf.scan(text, 1);
                            }
                        });
                        QRScanner.show();
                    } catch (err) {
                    }
                } else if (status.denied) {

                } else {

                }
            });*/
        } catch (err) {
        }
    },
    timeout: null,
    destroy: function () {
        Factory.$rootScope.QRCODE = 0;
        QRScannerConf.timeout = setTimeout(function(){
            try {
                QRScanner.destroy();
            } catch (err) {
            }
        }, 1000);
    },
    scan: function (text, qrcode) {
        if (text.length) {
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

                        if(data.url)
                            Factory.$rootScope.location(data.url);
                    }
                }
            );
        }
    }
};