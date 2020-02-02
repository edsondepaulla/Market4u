var QRScannerConf = {
    digite: function () {
        try {
            navigator.notification.prompt(
                'Está localizado na máquina',
                function (results) {
                    if (results.buttonIndex == 1) {
                        if (results.input1.length)
                            QRScannerConf.scan(results.input1);
                        else
                            return false;
                    }
                },
                'Escreva o código',
                ['Continue', 'Cancelar'],
                ''
            );
        } catch (err) {
            var text = prompt("Escreva o código que está localizado na máquina", "");
            if (text != null)
                QRScannerConf.scan(text);
        }
    },
    show: function () {
        Factory.$rootScope.Titulo = 'LER O QRCODE';
        Factory.$rootScope.QRCODE = 1;
        clearTimeout(QRScannerConf.timeout);
        try {
            QRScanner.prepare(function (err, status) {
                if (err) {

                }
                if (status.authorized) {

                } else if (status.denied) {

                } else {

                }
            });
        } catch (err) {
        }
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