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

                    if (data.CARRINHO)
                        Factory.$rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data.CARRINHO;

                    if (data.QTDE_PRODUTOS)
                        Factory.$rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;

                    if (data.url)
                        Factory.$rootScope.location(data.url);
                }
            }
        );
    },
    prompt: function (msg, type) {
        try {
            navigator.notification.prompt(
                '',
                function (results) {
                    if (results.buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1)) {
                        if (results.input1.length)
                            BarCodeScanner.getScan(results.input1, type);
                        else
                            $('#carregando').hide().css('opacity', 0);
                    } else
                        $('#carregando').hide().css('opacity', 0);
                },
                msg,
                Factory.$rootScope.device == 'ios' ? ['Cancelar', 'Continuar'] : ['Continuar', 'Cancelar'],
                ''
            );
        } catch (err) {
            var text = prompt(msg, "");
            if (text != null)
                BarCodeScanner.getScan(text, type);
            else {
                $('#carregando').hide().css('opacity', 0);
            }
        }
    },
    scan: function (type) {
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text) {
                        if (type == 'finalizar_compra')
                            fecharCompra(result.text);
                        else
                            BarCodeScanner.getScan(result.text, type);
                    } else if (type == 'finalizar_compra') {
                        if (Factory.$rootScope.LOCAL.ITEM.QRCODE_PG_DATA)
                            fecharCompra();
                    } else if (type != 'destravar' && type != 'area-restrita')
                        BarCodeScanner.prompt("Não conseguiu escanear?\nDigite o código de barras:", type);
                },
                function (error) {

                },
                {
                    preferFrontCamera: false,
                    showFlipCameraButton: false,
                    showTorchButton: true,
                    torchOn: false,
                    saveHistory: false,
                    prompt: "",
                    formats: type == 'area-restrita' || type == 'finalizar_compra' ? "QR_CODE" : "QR_CODE,UPC_A,UPC_E,EAN_8,EAN_13,CODE_39,CODE_93,CODE_128,CODABAR,ITF",
                    resultDisplayDuration: 0,
                    orientation: "portrait",
                    disableAnimations: true,
                    disableSuccessBeep: true
                }
            );
            if (Factory.$rootScope.device == 'android' && type != 'finalizar_compra')
                Factory.$rootScope.location('#!/index/ESCANEAR');
        } catch (err) {
            BarCodeScanner.prompt("Digite o código de barras:", type);
        }
    }
};