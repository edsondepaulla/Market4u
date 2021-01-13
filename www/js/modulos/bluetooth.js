'use strict';
var bluetooth = {
    deviceId: null,
    ativado: false,
    timeout: null,
    bebidas_alcoolicas: function() {
        var ok = true;
        if (parseInt(Factory.$rootScope.LOCAL.ITEM.LICENCIADO) == 4 || parseInt(Factory.$rootScope.LOCAL.ITEM.LICENCIADO) == 1) {
            var day = parseInt((new Date()).getDay());
            /*if ((day == 6 || day == 0))
                ok = false;
            else {*/
            var hours = parseInt((new Date()).getHours());
            if (hours >= 0)
                ok = false;
            if (hours >= 5)
                ok = true;
            if (hours >= 23)
                ok = false;
            //}
            if (!ok) {
                Factory.$rootScope.location('#!/command/18+/destravar/VENDA_BEBIDA_PROIBIDA_HORARIO', 0, 1);
            }
        }
        return ok;
    },
    callback_ativado: false,
    writeWithoutResponse: null,
    set: null,
    set_bluetooth: null,
    porta: null,
    detravar: function (set, set_bluetooth, porta) {
        if(set){
            bluetooth.set = set;
            bluetooth.set_bluetooth = set_bluetooth;
            bluetooth.porta = porta;
        }else{
            set = bluetooth.set;
            set_bluetooth = bluetooth.set_bluetooth;
            porta = bluetooth.porta;
        }
        bluetooth.disconnect();
        if (bluetooth.ativado) {
            bluetooth.callback_ativado = false;
            if (window.location.hash != '#!/command/18+/destravar/BLUETOOTH')
                Factory.$rootScope.location('#!/command/18+/destravar/BLUETOOTH', 0, 1);
            ble.scan(
                [],
                5,
                function (device) {
                    var mkt_local = device.name.indexOf('mkt' + (set_bluetooth ? set_bluetooth : '') + '_') !== -1 || device.name.indexOf('mkt' + (set_bluetooth ? set_bluetooth : '1') + '_') !== -1;
                    if ((device.name == 'market4u' + (parseInt(set_bluetooth) == 1 ? '' : '_other')) || (device.name == 'market4u' + (set_bluetooth ? set_bluetooth : '1')) || (device.name == 'market4u' + (set_bluetooth ? set_bluetooth : '')) || mkt_local) {
                        if (mkt_local) {
                            var id_local = parseInt(device.name.split('_')[1]);
                            //alert(id_local);
                        }

                        clearInterval(bluetooth.timeout);
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
                                ble.startNotification(
                                    bluetooth.deviceId,
                                    'ffe0',
                                    'ffe1',
                                    function (data) {
                                    },
                                    function (e) {
                                    }
                                );

                                var value = 30000;

                                // Porta
                                if (parseInt(porta ? porta : 0))
                                    value += parseInt(porta);

                                value = value.toString();
                                var array = new Uint8Array(value.length);
                                for (var i = 0, l = value.length; i < l; i++)
                                    array[i] = value.charCodeAt(i);
                                ble.writeWithoutResponse(
                                    bluetooth.deviceId,
                                    'ffe0',
                                    'ffe1',
                                    array.buffer,
                                    function (e) {
                                        var url = '#!/command/18+/destravar/BEB_ALC' + (set_bluetooth ? set_bluetooth : '');
                                        if(parseInt(porta))
                                            url = '#!/command/18+/destravar/PORTA_' + parseInt(porta);
                                        if (window.location.hash != url)
                                            Factory.$rootScope.location(url, 0, 1);
                                        setTimeout(function () {
                                            bluetooth.disconnect();
                                        }, 1000);
                                    },
                                    function (e) {

                                    }
                                );
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