var BarCodeScanner = {
    getScan(text, type) {
        if (type == 'comprar') {
            var audio = new Audio('audio/beep.mp3');
            audio.play();
        }
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
    scan: function (type) {
        $('#carregando').show().css('opacity', 1);
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text)
                        BarCodeScanner.getScan(result.text, type);
                    else {
                        try {
                            navigator.notification.prompt(
                                'Não conseguiu escanear o código, digite se preferir:',
                                function (results) {
                                    if (results.buttonIndex == 1) {
                                        if (results.input1.length)
                                            BarCodeScanner.getScan(results.input1, type);
                                    }
                                },
                                'Atenção',
                                ['Continue', 'Cancelar'],
                                ''
                            );
                        } catch (err) {
                            var text = prompt("Não conseguiu escanear o código, digite se preferir:", "");
                            if (text != null)
                                BarCodeScanner.getScan(text, type);
                            else {
                                $('#carregando').hide().css('opacity', 0);
                            }
                        }
                    }
                },
                function (error) {
                    $('#carregando').hide().css('opacity', 0);
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
                                BarCodeScanner.getScan(results.input1, type);
                            else {
                                $('#carregando').hide().css('opacity', 0);
                                return false;
                            }
                        }
                    },
                    'Atenção',
                    ['Continue', 'Cancelar'],
                    ''
                );
            } catch (err) {
                var text = prompt("Digite o código", "");
                if (text != null)
                    BarCodeScanner.getScan(text, type);
                else {
                    $('#carregando').hide().css('opacity', 0);
                }
            }
        }
    }
};