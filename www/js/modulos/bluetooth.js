'use strict';
var bluetooth = {
    deviceId: null,
    writeWithoutResponse: null,
    detravar: function (set) {
        if (set == 1)
            bluetooth.tentativas = 0;
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
                            //alert('Conectado 1');
                            var characteristic = peripheral.characteristics.filter(function (element) {
                                if (element.characteristic.toLowerCase() === 'ffe1')
                                    return element;
                            })[0];
                            bluetooth.writeWithoutResponse = characteristic.properties.indexOf('WriteWithoutResponse') > -1 ? true : false;

                            //alert('Conectado 2');
                            ble.startNotification(
                                bluetooth.deviceId,
                                'ffe0',
                                'ffe1',
                                function (data) {

                                },
                                bluetooth.onError
                            );

                            //alert('Conectado 3');
                            setTimeout(function(){
                                bluetooth.sendData('1');
                            }, 2000);
                        },
                        bluetooth.onError
                    );
                }
            },
            bluetooth.onError
        );
    },
    sendData: function (value) {

        //alert('Conectado 4');
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
                    //alert('Conectado 5');
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
                    //alert('Conectado 5');
                    setTimeout(function(){
                        bluetooth.disconnect();
                    }, 1000);
                },
                bluetooth.onError
            );
        }
    },
    disconnect: function (event) {
        //alert('disconectado');
        ble.disconnect(
            bluetooth.deviceId,
            function () {

            },
            function () {

            }
        );
    },
    tentativas: 0,
    onError: function (e) {
        //alert('Error: ' + e);
        bluetooth.disconnect();
        if (bluetooth.tentativas <= 3) {
            bluetooth.tentativas++;
            bluetooth.detravar();
        }
    }
};