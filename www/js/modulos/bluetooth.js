'use strict';
var bluetooth = {
    deviceId: null,
    ativado: false,
    timeout: null,
    callback_ativado: false,
    writeWithoutResponse: null,
    detravar: function (set) {
        alert('detravar');
        bluetooth.disconnect();
        if (bluetooth.ativado) {
            bluetooth.callback_ativado = false;
            if (window.location.hash != '#!/command/18+/destravar/BLUETOOTH')
                Factory.$rootScope.location('#!/command/18+/destravar/BLUETOOTH', 0, 1);
            ble.scan(
                [],
                5,
                function (device) {
                    if (device.name == 'market4u') {
                        clearTimeout(bluetooth.timeout);
                        bluetooth.deviceId = device.id;
                        try {
                            ble.stopScan(
                                function () {
                                },
                                function () {
                                }
                            );
                        } catch (e) {
                        }
                        ble.connect(
                            bluetooth.deviceId,
                            function () {
                                try {
                                    ble.startNotification(
                                        bluetooth.deviceId,
                                        'ffe0',
                                        'ffe1',
                                        function (data) {
                                        },
                                        function (e) {
                                        }
                                    );
                                    var value = (parseInt(Login.getData().TIME_TRAVA) * 1000).toString();
                                    var array = new Uint8Array(value.length);
                                    for (var i = 0, l = value.length; i < l; i++)
                                        array[i] = value.charCodeAt(i);
                                    ble.writeWithoutResponse(
                                        bluetooth.deviceId,
                                        'ffe0',
                                        'ffe1',
                                        array.buffer,
                                        function (e) {
                                            Factory.$rootScope.location('#!/command/18+/destravar/BEB_ALC', 0, 1);
                                            setTimeout(function () {
                                                alert('disconnect: 3');
                                                bluetooth.disconnect();
                                            }, 1000);
                                        },
                                        function (e) {

                                        }
                                    );
                                } catch (e) {
                                    alert('ERROR: ' + e);
                                }
                            },
                            function(){
                                alert('disconnect: 2');
                                bluetooth.disconnect();
                            }
                        );
                    }
                },
                function(){
                    alert('disconnect: 1');
                    bluetooth.disconnect();
                }
            );
        } else {
            if (set == 1)
                bluetooth.callback_ativado = true;
            switch (Factory.$rootScope.device) {
                case 'ios':
                    Factory.alert("Favor ativar o Bluetooth");
                    break;
                case 'android':
                    cordova.plugins.BluetoothStatus.promptForBT();
                    break;
            }
        }
    },
    disconnect: function () {
        try {
            ble.stopScan(
                function () {
                },
                function () {
                }
            );
        } catch (e) {
        }
        if (bluetooth.deviceId) {
            try {
                ble.disconnect(
                    bluetooth.deviceId,
                    function () {

                    },
                    function () {

                    }
                );
                bluetooth.deviceId = null;
            } catch (e) {
            }
        }
        bluetooth.callback_ativado = false;
    }
};