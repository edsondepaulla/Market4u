app.controller('Maps', function($rootScope) {
    QRScannerConf.destroy();
    Maps.init();
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
});

var Maps = {
    init: function (falha) {
        if (falha) {
            Maps.markers = [];
            Maps.this = null;
        }
        if (Maps.this == null || !$('#map iframe').length) {
            Maps.auth();
        }
    },
    append: function (token) {
        $('#api_maps').remove();
        $('body').append('<script id="api_maps" src="https://maps.googleapis.com/maps/api/js?key=' + token + '&libraries=geometry&callback=initMap" async defer></script>');
    },
    auth: function () {
        var token = localStorage.getItem("TokenMaps");
        if (token)
            Maps.append(token);
        else {
            var getTokenMaps = setInterval(function () {
                token = Login.getData().TOKEN_MAPS;
                if (token) {
                    Maps.append(token);
                    clearInterval(getTokenMaps);
                }
            }, 1000);
        }
    },
    this: null,
    markers: [],
    timeoutGetPoints: null,
    getPoints: function (time) {
        if (!Maps.markers.length || time === true) {
            try {
                if (Maps.timeoutGetPoints)
                    clearTimeout(Maps.timeoutGetPoints);

                Maps.timeoutGetPoints = setTimeout(function () {
                    var bounds = Maps.this.getBounds();
                    if (bounds) {
                        var ne = bounds.getNorthEast();
                        var sw = bounds.getSouthWest();
                        var nw = new google.maps.LatLng(ne.lat(), sw.lng());
                        var se = new google.maps.LatLng(sw.lat(), ne.lng());
                        Factory.ajax(
                            {
                                action: 'maquinas/getpoints',
                                data: {
                                    NE_LAT: ne.lat(),
                                    SW_LNG: sw.lng(),
                                    SW_LAT: sw.lat(),
                                    NE_LNG: ne.lng()
                                }
                            },
                            function (data) {
                                if(Maps.markers){
                                    $.each(Maps.markers, function (index, marker) {
                                        marker.setMap(null);
                                    });
                                    Maps.markers = [];
                                }
                                $.each(data.lst, function (index, val) {
                                    if (!Maps.markers[val.ID]) {
                                        var latlng = new google.maps.LatLng(val.LAT, val.LNG);
                                        var img = '';
                                        switch (val.STATUS) {
                                            case 'blue':
                                            case 'green':
                                                img = 'pin';
                                                break;
                                            case 'yellow':
                                                img = 'pin_yellow';
                                                break;
                                            default:
                                                img = 'pin_red';
                                                break;
                                        }

                                        var image = {
                                            url: 'img/' + img + '.png',
                                            labelOrigin: new google.maps.Point(15, 40)
                                        }
                                        var marker = new google.maps.Marker({
                                            position: latlng,
                                            map: Maps.this,
                                            icon: image,
                                            ID: val.ID
                                        });
                                        if (marker) {
                                            marker.addListener('click', function () {
                                                window.location = '#!/maquinas/' + marker.ID;
                                            });
                                            Maps.markers.push(marker);
                                        }
                                    }
                                });
                            }
                        );
                    } else
                        Maps.getPoints(time);
                }, time ? time : 1400);
            } catch (err) {
                Maps.getPoints(time);
            }
        }
    },
    markerLocation: null,
    latLngLocation: function (latLng) {
        var zoom_default = 14;
        if (latLng) {
            latLng.zoom = zoom_default;
            localStorage.setItem("latLngLocation",
                JSON.stringify(
                    {
                        zoom: latLng.zoom,
                        latitude: latLng.latitude,
                        longitude: latLng.longitude
                    }
                )
            );
        } else {
            latLng = JSON.parse(localStorage.getItem("latLngLocation"));
            if (!latLng) {
                if (parseFloat(Login.getData().LAT)) {
                    latLng = {
                        zoom: zoom_default,
                        latitude: parseFloat(Login.getData().LAT),
                        longitude: parseFloat(Login.getData().LNG)
                    };
                } else {
                    latLng = {
                        zoom: 6,
                        latitude: -25.5505913,
                        longitude: -49.7997885
                    };
                }
            }
        }
        return {
            latLng_text: latLng.latitude + ',' + latLng.longitude,
            latLng: latLng,
            object: new google.maps.LatLng(latLng.latitude, latLng.longitude)
        }
    },
    setgeolocation: function () {
        try {
            Factory.ajax(
                {
                    action: 'cadastro/setgeolocation',
                    data: Maps.latLngLocation().latLng
                }
            );
        } catch (e) {

        }
    },
    geoLocation: function (getpoints) {
        var latLngLocation = Maps.latLngLocation();
        if (latLngLocation.object) {
            Maps.this.setZoom(latLngLocation.latLng.zoom);
            Maps.this.setCenter(latLngLocation.object);
            if (getpoints)
                Maps.getPoints();
        }
        if (Maps.markerLocation == null) {
            Maps.markerLocation = new google.maps.Marker({
                map: Maps.this,
                position: latLngLocation.object,
                icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAF96VFh0UmF3IHByb2ZpbGUgdHlwZSBBUFAxAABo3uNKT81LLcpMVigoyk/LzEnlUgADYxMuE0sTS6NEAwMDCwMIMDQwMDYEkkZAtjlUKNEABZgamFmaGZsZmgMxiM8FAEi2FMnxHlGkAAADqElEQVRo3t1aTWgTQRQOiuDPQfHs38GDogc1BwVtQxM9xIMexIN4EWw9iAehuQdq0zb+IYhglFovClXQU+uhIuqh3hQll3iwpyjG38Zkt5uffc4XnHaSbpLZ3dnEZOBB2H3z3jeZN+9vx+fzYPgTtCoQpdVHrtA6EH7jme+/HFFawQBu6BnWNwdGjB2BWH5P32jeb0V4B54KL5uDuW3D7Y/S2uCwvrUR4GaEuZABWS0FHhhd2O4UdN3FMJneLoRtN7Y+GMvvUw2eE2RDh3LTOnCd1vQN5XZ5BXwZMV3QqQT84TFa3zuU39sy8P8IOqHb3T8fpY1emoyMSQGDI/Bwc+0ELy6i4nLtepp2mE0jc5L3UAhMsdxut0rPJfRDN2eMY1enF8Inbmj7XbtZhunkI1rZFD/cmFMlr1PFi1/nzSdGkT5RzcAzvAOPU/kVF9s0ujqw+9mP5QgDmCbJAV7McXIeGpqS3Qg7OVs4lTfMD1Yg9QLR518mZbImFcvWC8FcyLAbsev++3YETb0tn2XAvouAvjGwd14YdCahUTCWW6QQIzzDO/CIAzKm3pf77ei23AUkVbICHr8pnDZNynMQJfYPT7wyKBzPVQG3IvCAtyTsCmRBprQpMawWnkc+q2Rbn+TK/+gmRR7qTYHXEuZkdVM0p6SdLLYqX0LItnFgBxe3v0R04b5mGzwnzIUMPiBbFkdVmhGIa5tkJ4reZvyl4Rg8p3tMBh+FEqUduVRUSTKTnieL58UDG76cc70AyMgIBxs6pMyIYV5agKT9f/ltTnJFOIhuwXOCLD6gQ/oc8AJcdtuYb09xRQN3NWULgCwhfqSk3SkaBZViRTK3EYNUSBF4Hic0Y8mM+if0HhlMlaIHbQ8Z5lszxnGuIP2zrAw8J8jkA7pkMAG79AKuPTOOcgWZeVP5AsSDjAxWegGyJoSUWAj/FBpRa0JiviSbfldMqOMPcce7UVeBLK4gkMVVBLI2phLjKlIJm8lcxMNkLuIomXOTTmc1kwYf2E+nMQdzlaTTKgoaZJWyBQ141RY0DkrK6XflAQbih1geZnhJeXu5WeEZ3mVqSkrIgCzXJaXqoh65TUuLerdtFXgQ2bYKeD1pq6hobLE86SlztXMWvaA5vPO0sYWB9p2K1iJS4ra0Fju/udsN7fWu+MDRFZ+YuuIjX1d8Zu2OD92WC9G3ub1qABktBV7vssfBMX1L7yVjZ7PLHuABb9svezS7boNDyK/b4LdX123+Au+jOmNxrkG0AAAAAElFTkSuQmCC'
            });
            Maps.markerLocation.addListener('click', function () {
                Maps.this.setZoom(Maps.latLngLocation().latLng.zoom);
                Maps.this.setCenter(Maps.latLngLocation().object);
            });
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    if (position.coords.latitude != latLngLocation.latLng.latitude || position.coords.longitude != latLngLocation.latLng.longitude) {
                        latLngLocation = Maps.latLngLocation(position.coords);
                        Maps.markerLocation.setPosition(latLngLocation.object);
                        Maps.this.setCenter(latLngLocation.object);
                        Maps.this.setZoom(latLngLocation.latLng.zoom);
                        Maps.setgeolocation();
                        if (getpoints)
                            Maps.getPoints();
                    }
                },
                function (error) {

                }
            );
        } else if (getpoints)
            Maps.getPoints();
    }
};

function gm_authFailure() {
    Maps.init(1);
}

function initMap() {
    if (Maps.this == null) {
        try {
            $('#map').html('');
            var latLngLocation = Maps.latLngLocation();

            Maps.this = new google.maps.Map(
                document.getElementById('map'),
                {
                    zoom: latLngLocation.latLng.zoom,
                    disableDefaultUI: true
                }
            );

            if (Maps.this) {
                Maps.this.setCenter(latLngLocation.object);

                Maps.this.setOptions(
                    {
                        styles: [
                            {
                                featureType: "poi",
                                stylers: [
                                    {visibility: "off"}
                                ]
                            }
                        ]
                    }
                );

                google.maps.event.addListener(Maps.this, 'zoom_changed', function (event) {
                    Maps.getPoints();
                });

                google.maps.event.addListener(Maps.this, 'dragend', function (event) {
                    Maps.getPoints();
                });

                Maps.geoLocation(true);

                setTimeout(function(){
                    if (!$('#map iframe').length)
                        Maps.init(1);
                }, 5000);
            } else
                Maps.init(1);
        } catch (e) {
            Maps.init(1);
        }
    }
}