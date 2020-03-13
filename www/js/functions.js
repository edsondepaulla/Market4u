var Page = {
    active: 0,
    start: function () {
        Page.active = 1;
        setTimeout(function () {
            Page.active = 0;
        }, 2000);
    }
};
var Factory = {
    $http: null,
    $scope: [],
    $rootScope: [],
    $swipeLeftPageBefore: false,
    PAGINACAO_INFINITO: {
        QUERY: '',
        ATIVO: 0,
        PESQUISA: 0,
        LIMIT: 10,
        OFFSET: 0
    },
    alert: function (msg) {
        if (msg) {
            try {
                navigator.notification.alert(
                    msg,
                    function () {

                    },
                    'Atenção!'
                );
            } catch (err) {
                alert(msg);
            }
        }
    },
    timeoutCarregando: null,
    updatePage: function () {

    },
    submit: function (_this, successCallback) {
        Factory.ajax(
            {
                action: _this.attr('action'),
                form: _this,
                data: _this.serializeArray()
            },
            successCallback
        );
    },
    diffCarregando: function (action) {
        switch (action) {
            case 'login/get':
            case 'cadastro/setgeolocation':
            case 'maquinas/getpoints':
            case 'options/command':
            case 'payment/verify':
            case 'payment/pagseguro':
            case 'payment/cancel':
            case 'cadastro/verify':
            case 'payment/carrinho':
            case 'payment/addremoveqtde':
            case 'payment/bannercount':
                return false;
                break;
        }
        return true;
    },
    ajax: function (params, successCallback, functionError) {
        if (params.action) {
            // Loading
            var diffCarregando = (params.data ? params.data['LOADER_CARREGANDO'] === false : false) ? false : ((params.data ? params.data['LOADER_CARREGANDO'] === true : false) ? true : this.diffCarregando(params.action));
            if (diffCarregando) {
                clearTimeout(Factory.timeoutCarregando);
                $('#carregando').show().css('opacity', 1);
            }

            // Form
            var _form = params.form;

            // Data
            var data = new FormData();

            // Data (parametros)
            data.append('type-post', 'ajax');

            // Device
            data.append('device', Factory.$rootScope.device);

            // Parametro versao app mobile
            if (config.versao_app_mobile)
                data.append('versao_app_mobile', config.versao_app_mobile);

            // Set data
            if (params.data) {
                $.each(params.data, function (index, val) {
                    try {
                        if (val.name && val.value)
                            data.append(val.name, val.value);
                        else if (val) {
                            if (typeof val === 'object' && index != 'IMAGEM') {
                                $.each(val, function (index2, val2) {
                                    data.append(index + '[' + index2 + ']', val2);
                                });
                            } else
                                data.append(index, val);
                        }
                    } catch (err) {
                        data.append(index, val);
                    }
                });
            }

            if (_form)
                $('.btn-salvar').attr('disabled', true);

            /*
             * Paginacao infinito
             */
            $('.loadingLst').hide();
            if (parseInt(Factory.PAGINACAO_INFINITO.ATIVO) && parseInt(Factory.PAGINACAO_INFINITO.LIMIT)) {
                if (Factory.PAGINACAO_INFINITO.OFFSET) {
                    if (!$('.scrollable-content .loadingLst').length)
                        $('.scrollable-content').append('<span class="loadingLst"></span>');

                    $('.loadingLst').show();
                }

                data.append('PAG_LIMIT', Factory.PAGINACAO_INFINITO.LIMIT);
                data.append('PAG_OFFSET', Factory.PAGINACAO_INFINITO.OFFSET);
            }

            /*
             * Pesquisar - Query
             */
            Factory.$rootScope.criterio = Factory.$rootScope.criterio ? Factory.$rootScope.criterio : '';
            if (Factory.$rootScope.criterio != '')
                data.append('PAG_QUERY', Factory.$rootScope.criterio);

            /*
             * Get Login - cookie
             */
            if (params.action != 'cadastro/novo')
                data.append('getLogin', 1);

            if (localStorage.getItem("PHPSESSID"))
                data.append('PHPSESSID', localStorage.getItem("PHPSESSID"));

            // Request ajax
            return Factory.$http({
                method: params.method ? params.method : 'POST',
                url: config.url_api[config.ambiente] + params.action,
                data: data,
                cache: false,
                withCredentials: true,
                processData: false,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(function (response) {
                    switch (params.dataType) {
                        case 'html':
                            return response;
                            break;
                        default:
                            Factory.timeoutCarregando = setTimeout(function () {
                                if (diffCarregando) {
                                    $('#carregando').hide().css('opacity', 0);
                                    $('.loadingLst').hide();
                                }
                            }, 100);
                            try {
                                // Notificacoes
                                if (response.data.NOTIFICACOES) {
                                    $.each(response.data.NOTIFICACOES, function (idx_each, val_each) {
                                        try {
                                            cordova.plugins.notification.local.schedule(val_each);
                                        } catch (err) {
                                        }
                                    });
                                }
                            } catch (e) {
                            }
                            try {
                                if (Factory.$rootScope)
                                    Factory.$rootScope.loading = false;

                                // Login
                                if (response.data.Login) {
                                    Login.set(response.data.Login);

                                    // PHPSESSID
                                    if (response.data.Login.PHPSESSID)
                                        localStorage.setItem("PHPSESSID", response.data.Login.PHPSESSID);
                                }

                                // Versao nova
                                if (response.data.VERSAO_NOVA && params.action != 'options/atualizarapp') {
                                    Page.start();
                                    window.location = '#!/atualizar-app';
                                }

                                if (successCallback)
                                    eval(successCallback)(response.data);

                                if (response.data.callback) {
                                    var callback = response.data.callback.split(';');
                                    $.each(callback, function (idx_each, val_each) {
                                        if (val_each) {
                                            try {
                                                eval(val_each)(name);
                                            } catch (err) {
                                            }
                                        }
                                    });
                                    response.data.callback = null;
                                }

                                // Focus
                                if (response.data.focus)
                                    $(response.data.focus).focus();

                                // Msg
                                Factory.alert(response.data.msg);

                                // WhatsApp
                                if (params.action != 'login/get')
                                    Factory.$rootScope.TEXT_WHATSAPP = response.data.TEXT_WHATSAPP ? response.data.TEXT_WHATSAPP : '';

                                // Window open
                                if (response.data.redirect)
                                    Factory.$rootScope.location(response.data.redirect, 0, response.data.redirect == '#!/cadastro' ? 1 : 0);

                                var open_browser = response.data.open_browser;
                                if (open_browser) {
                                    Factory.AppBrowser(
                                        open_browser.url,
                                        open_browser
                                    );
                                }

                                if (_form)
                                    $('.btn-salvar').attr('disabled', false);

                                return response.data;
                            } catch (err) {
                                Factory.error(_form, err, functionError);
                            }
                            break;
                    }
                }, function (data) {
                    $('#carregando').hide().css('opacity', 0);
                    $('.loadingLst').hide();
                    if (params.action != 'payment/verify')
                        Factory.error(_form, data, functionError);
                });
        }
    },
    AppBrowser: function (url, open_browser) {
        if (!open_browser.window_open) {
            try {
                SafariViewController.isAvailable(function (available) {
                    if (available) {
                        SafariViewController.show(
                            {
                                url: url,
                                hidden: open_browser.hidden ? open_browser.hidden : false,
                                animated: open_browser.animated ? open_browser.animated : false,
                                transition: open_browser.transition ? open_browser.transition : 'curl',
                                enterReaderModeIfAvailable: open_browser.enterReaderModeIfAvailable ? open_browser.enterReaderModeIfAvailable : false,
                                tintColor: "#043d22",
                                barColor: "#00ab46",
                                controlTintColor: "#ffffff"
                            }
                        );
                    } else
                        open_browser.window_open = true;
                });
            } catch (e) {
                open_browser.window_open = true;
            }
        }
        if (open_browser.window_open) {
            try {
                window.device = {platform: 'Browser'};
                switch (open_browser.type) {
                    case 'load_url':
                        navigator.app.loadUrl(url, {openExternal: true});
                        break;
                    default:
                        window.open(
                            url,
                            open_browser.target ? open_browser.target : '_system',
                            open_browser.options ? open_browser.options : 'location=yes'
                        );
                        break;
                }
            }catch (e) {
                window.open(
                    url,
                    open_browser.target ? open_browser.target : '_system',
                    open_browser.options ? open_browser.options : 'location=yes'
                );
            }
        }
    },
    error: function (_form, data, functionError) {
        if (Factory.$rootScope)
            Factory.$rootScope.loading = false;

        if (functionError)
            eval(functionError);

        console.log(data);

        $('.btnConfirme').attr('disabled', false);

        if (data.status == '-1')
            window.location = '#!/sem-internet';
    },
    prepare: function () {
        document.addEventListener("deviceready", function () {
            cordova.plugins.notification.local.requestPermission(function (granted) {

            });
            cordova.plugins.notification.local.on("click", function (notification, state) {
                switch (notification.type) {
                    case 'redirect':
                        if (notification.url)
                            Factory.$rootScope.location(notification.url);
                        break;
                    default:
                        Factory.$rootScope.location('#!/notificacoes/' + notification.id);
                        break;
                }
            });

            /*
            // Android customization
            cordova.plugins.backgroundMode.setDefaults({ text:'Doing heavy tasks.'});
            // Enable background mode
            cordova.plugins.backgroundMode.enable();

            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                setTimeout(function () {
                    // Modify the currently displayed notification
                    cordova.plugins.backgroundMode.configure({
                        text:'Running in background for more than 5s now.'
                    });
                    alert('ddd');
                }, 5000);
            }*/
        }, false);
        if(!parseInt(Login.getData().ID))
            window.location = '#!/conecte-se';
    }
};

window.handleOpenURL = function(url) {
    setTimeout(function () {
        try {
            SafariViewController.hide();
        } catch (e) {

        }
        if (url.indexOf(config.idApp + '://?qrcode') !== -1) {
            BarCodeScanner.scan('qrcode');
        } else if (url.indexOf(config.idApp + '://?barcode') !== -1) {
            BarCodeScanner.scan('barcode');
        } else if (url.indexOf(config.idApp + '://?close') !== -1) {

        } else if (url.indexOf(config.idApp + '://?redirect=') !== -1) {
            url = url.split(config.idApp + '://?redirect=');
            if (url[1])
                Factory.$rootScope.location(url[1]);
        } else {
            Factory.ajax(
                {
                    action: 'callback/url',
                    data: {
                        URL: url
                    }
                }
            );
        }
    }, 0);
}

function onErrorUser(_this){
    _this.src = 'img/login_default.png';
}

function onErrorProd(_this){
    _this.src = 'img/market4u.png';
}