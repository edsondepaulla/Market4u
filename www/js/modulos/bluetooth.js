'use strict';
var bluetooth = {
    deviceId: null,
    writeWithoutResponse: null,
    detravar: function (set) {
        if (set == 1)
            this.tentativas = 0;
        ble.scan(
            [],
            5,
            function (device) {
                if (device.name == 'market4u') {
                    this.deviceId = device.id;
                    ble.connect(
                        this.deviceId,
                        function (peripheral) {
                            var characteristic = peripheral.characteristics.filter(function (element) {
                                if (element.characteristic.toLowerCase() === 'ffe1')
                                    return element;
                            })[0];
                            this.writeWithoutResponse = characteristic.properties.indexOf('WriteWithoutResponse') > -1 ? true : false;
                            ble.startNotification(
                                this.deviceId,
                                'ffe0',
                                'ffe1',
                                function (data) {

                                },
                                this.onError
                            );
                            this.sendData('1');


                        },
                        this.onError
                    );
                }
            },
            this.onError
        );
    },
    sendData: function (value) {
        var array = new Uint8Array(value.length);
        for (var i = 0, l = value.length; i < l; i++)
            array[i] = value.charCodeAt(i);
        if (this.writeWithoutResponse) {
            ble.writeWithoutResponse(
                this.deviceId,
                'ffe0',
                'ffe1',
                array.buffer,
                function () {

                },
                this.onError
            );
        } else {
            ble.write(
                this.deviceId,
                'ffe0',
                'ffe1',
                array.buffer,
                function () {

                },
                this.onError
            );
        }
    },
    disconnect: function (event) {
        ble.disconnect(
            this.deviceId,
            function () {

            },
            function () {

            }
        );
    },
    tentativas: 0,
    onError: function (reason) {
        this.disconnect();
        if (this.tentativas <= 3) {
            this.tentativas++;
            this.detravar();
        }
    }
};