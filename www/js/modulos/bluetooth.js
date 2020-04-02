'use strict';
var bluetooth = {
    deviceId: null,
    writeWithoutResponse: null,
    detravar: function () {
        try {
            ble.enable(
                function () {
                    bluetooth.scan();
                },
                function () {
                    Factory.alert("LIGAR BLUETOOTH");
                }
            );
        } catch (e) {
            bluetooth.scan();
        }
    },
    scan: function () {
        try {
            ble.scan(
                [],
                5,
                function (device) {
                    if (device.name == 'market4u') {
                        Factory.$rootScope.location('#!/command/18+/destravar/BLUETOOTH', 0, 1);
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
        }catch (e) {
            Factory.alert("LIGAR BLUETOOTH");
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
    disconnect: function (event) {
        try {
            ble.stopScan(
                function () {
                },
                function () {
                }
            );
        } catch (e) {
        }
        if(bluetooth.deviceId) {
            try {
                ble.disconnect(
                    bluetooth.deviceId,
                    function () {

                    },
                    function () {

                    }
                );
            } catch (e) {
            }
        }
    }
};