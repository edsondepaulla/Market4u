var Location = {
    onDeviceReady: function () {
        $(document).on("resume", Location.checkState);
    },
    openSettings: function () {
        if (cordova.platformId === "android")
            cordova.plugins.diagnostic.switchToLocationSettings();
        else
            cordova.plugins.diagnostic.switchToSettings();
    },
    requestLocationAuthorization: function () {
        cordova.plugins.diagnostic.requestLocationAuthorization(
            function () {

            },
            function (error) {

            }
        );
    },
    requestLocationAccuracy: function () {
        cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
            if (canRequest) {
                cordova.plugins.locationAccuracy.request(function () {
                        Location.checkState();
                    }, function (error) {
                        if (error) {
                            if (cordova.platformId === "android" && error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                                if (window.confirm("Falha ao definir o Modo de Localização automaticamente como 'Alta Precisão'. Deseja mudar as Configurações de local e fazer isso manualmente?"))
                                    cordova.plugins.diagnostic.switchToLocationSettings();
                            }
                        }
                    }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
                );
            } else
                Location.checkState();
        });
    },
    time: null,
    checkState: function () {
        clearTimeout(Location.time);
        Location.time = setTimeout(function () {
            cordova.plugins.diagnostic.isLocationEnabled(
                function (enabled) {
                    if (enabled) {
                        cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {
                            $('#teste_gps').html(authorized ? "AUTORIZADA" : "NÃO AUTORIZADO");
                            if(authorized)
                                $('#gps').css('display', 'block !important');
                            else
                                $('#gps').css('display', 'none !important');
                        }, function () {

                        });
                    } else {
                        $('#teste_gps').html('GPS DESATIVADO');
                        $('#gps').css('display', 'block !important');
                        //Location.requestLocationAuthorization();
                        //Location.requestLocationAccuracy();
                        //Location.openSettings();
                    }
                },
                function () {
                }
            );
        }, 1000);
    }
};