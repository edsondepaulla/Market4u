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

                    if(data.CARRINHO)
                        Factory.$rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data.CARRINHO;

                    if(data.QTDE_PRODUTOS)
                        Factory.$rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;

                    if (data.url)
                        Factory.$rootScope.location(data.url);
                }
            }
        );
    },
    prompt: function(msg, type){
        try {
            navigator.notification.prompt(
                msg,
                function (results) {
                    if (results.buttonIndex == 1) {
                        if (results.input1.length)
                            BarCodeScanner.getScan(results.input1, type);
                        else
                            $('#carregando').hide().css('opacity', 0);
                    }else
                        $('#carregando').hide().css('opacity', 0);
                },
                'Atenção',
                ['Continue', 'Cancelar'],
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
        $('#carregando').show().css('opacity', 1);
        try {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text)
                        BarCodeScanner.getScan(result.text, type);
                    else if(type != 'destravar')
                        BarCodeScanner.prompt("Não conseguiu escanear?\nDigite o código:", type);
                    else
                        $('#carregando').hide().css('opacity', 0);
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
            BarCodeScanner.prompt("Digite o código:", type);
        }
    }
};