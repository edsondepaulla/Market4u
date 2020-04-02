'use strict';
var bluetooth = {
    deviceId: null,
    writeWithoutResponse: null,
    detravar: function () {
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
                    }catch (e) { }
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
                                bluetooth.onError
                            );
                            bluetooth.sendData('1');
                        },
                        bluetooth.onError
                    );
                }
            },
            bluetooth.onError
        );
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
                    setTimeout(function(){
                        bluetooth.disconnect();
                    }, 1000);
                },
                bluetooth.onError
            );
        } else {
            ble.write(
                bluetooth.deviceId,
                'ffe0',
                'ffe1',
                array.buffer,
                function () {
                    setTimeout(function(){
                        bluetooth.disconnect();
                    }, 1000);
                },
                bluetooth.onError
            );
        }
    },
    disconnect: function (event) {
        ble.disconnect(
            bluetooth.deviceId,
            function () {

            },
            function () {

            }
        );
    },
    onError: function (e) {
        bluetooth.disconnect();
    }
};