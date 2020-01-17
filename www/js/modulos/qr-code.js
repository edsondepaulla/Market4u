app.controller('QrCode', function($rootScope, $scope) {
    $rootScope.NO_WHATSAPP = false;
    $rootScope.REDIRECT = '';
    if (Page.active) {
        $rootScope.Titulo = 'LER O QRCODE';

        QRScannerConf.show();

        $scope.digite = function () {
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
        };

        $scope.flashAtivo = 'on';
        $scope.flashTexto = 'Acenda';
        $scope.flash = function () {
            if ($scope.flashAtivo == 'on') {
                $scope.flashAtivo = 'off';
                $scope.flashTexto = 'Apague';
                try {
                    QRScanner.enableLight();
                } catch (err) {
                }
            } else {
                $scope.flashAtivo = 'on';
                $scope.flashTexto = 'Acenda';
                try {
                    QRScanner.disableLight();
                } catch (err) {
                }
            }
        };
    } else
        window.history.go(-1);
});

var QRScannerConf = {
    show: function () {
        try {
            QRScanner.prepare(function (err, status) {
                if (err) {
                    // here we can handle errors and clean up any loose ends.
                    console.error(err);
                }
                if (status.authorized) {
                    // W00t, you have camera access and the scanner is initialized.
                    // QRscanner.show() should feel very fast.
                } else if (status.denied) {
                    // The video preview will remain black, and scanning is disabled. We can
                    // try to ask the user to change their mind, but we'll have to send them
                    // to their device settings with `QRScanner.openSettings()`.
                } else {
                    // we didn't get permission, but we didn't get permanently denied. (On
                    // Android, a denial isn't permanent unless the user checks the "Don't
                    // ask again" box.) We can ask again at the next relevant opportunity.
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
    destroy: function () {
        try {
            QRScanner.destroy();
        } catch (err) {
        }
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
                        Factory.$rootScope.location(data.url);
                    } else {
                        if (qrcode) {
                            try {
                                QRScanner.destroy();
                                QRScannerConf.show();
                            } catch (err) {
                            }
                        }
                        try {
                            navigator.notification.alert(
                                'Código inválido!',
                                'Mensagem',
                                'Algo de errado'
                            );
                        } catch (err) {
                            alert('Código inválido!');
                        }
                    }
                }
            );
        }
    }
};