'use strict';
var bluetooth = {
    deviceId: null,
    ativado: false,
    callback_ativado: false,
    writeWithoutResponse: null,
    detravar: function (set) {
        if (bluetooth.ativado) {
            bluetooth.callback_ativado = false;
            Factory.$rootScope.location('#!/command/18+/destravar/BLUETOOTH', 0, 1);
            ble.scan(
                [],
                5,
                function (device) {
                    if (device.name == 'market4u') {
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
                            function (peripheral) {
                                var characteristic = peripheral.characteristics.filter(function (element) {
                                    if (element.characteristic.toLowerCase() === 'ffe1')
                                        return element;
                                })[0];
                                bluetooth.writeWithoutResponse = characteristic.properties.indexOf('WriteWithoutResponse') > -1 ? true : false;
                                ble.startNotification(
                                    bluetooth.deviceId,
                                    'ffe0',
                                    'ffe1',
                                    function (data) {
                                        alert(JSON.stringify(data));
                                    },
                                    bluetooth.disconnect
                                );
                                bluetooth.sendData('1');
                            },
                            bluetooth.disconnect
                        );
                    }
                },
                bluetooth.disconnect
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
    sendData: function (value) {
        var array = new Uint8Array(value.length);
        for (var i = 0, l = value.length; i < l; i++)
            array[i] = value.charCodeAt(i);
        if (bluetooth.writeWithoutResponse) {
            ble.writeWithoutResponse(
                bluetooth.deviceId,
                'ffe0',
                'ffe1',
                array.buffer,
                function () {
                    Factory.$rootScope.location('#!/command/18+/destravar/BEB_ALC', 0, 1);
                    setTimeout(function () {
                        bluetooth.disconnect();
                    }, 1000);
                },
                bluetooth.disconnect
            );
        } else {
            ble.write(
                bluetooth.deviceId,
                'ffe0',
                'ffe1',
                array.buffer,
                function () {
                    Factory.$rootScope.location('#!/command/18+/destravar/BEB_ALC', 0, 1);
                    setTimeout(function () {
                        bluetooth.disconnect();
                    }, 1000);
                },
                bluetooth.disconnect
            );
        }
    },
    disconnect: function (e) {
        alert(e);
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
    }
};