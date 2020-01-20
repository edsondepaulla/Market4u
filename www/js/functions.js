var Page = {
    active: 0,
    start: function () {
        Page.active = 1;
        setTimeout(function () {
            Page.active = 0;
        }, 1000);
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
    timeoutVersaoNova: null,
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
            case 'payment/verify':
            case 'payment/pagseguro':
            case 'payment/cancel':
            case 'cadastro/verify':
                return false;
                break;
        }
        return true;
    },
    ajax: function (params, successCallback, functionError) {
        if (params.action) {
            // Loading
            var diffCarregando = this.diffCarregando(params.action);
            if (diffCarregando) {
                clearTimeout(Factory.timeout);
                $('#carregando').show();
                Pace.restart();
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
                            Factory.timeout = setTimeout(function () {
                                if (diffCarregando) {
                                    $('#carregando').hide();
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
                            }catch (e) { }
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
                                if(response.data.VERSAO_NOVA && params.action != 'options/atualizarapp') {
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
                                if (response.data.status == 1) {
                                    if (response.data.redirect)
                                        Factory.$rootScope.location(response.data.redirect);

                                    var open_browser = response.data.open_browser;
                                    if (open_browser) {
                                        Factory.AppBrowser(
                                            open_browser.url,
                                            open_browser
                                        );
                                    }
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
                    setTimeout(function () {
                        if (diffCarregando) {
                            $('#carregando').hide();
                            $('.loadingLst').hide();
                        }
                    }, 500);
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
                                tintColor: "#00ffff",
                                barColor: "#0000ff",
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
            window.device = {platform: 'Browser'};
            try {
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
            } catch (e) {
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

        $('#btnConfirme').attr('disabled', false);

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
                        if(notification.url)
                            Factory.$rootScope.location(notification.url);
                        break;
                }
            });
        }, false);
    }
};

window.handleOpenURL = function(url) {
    setTimeout(function () {
        try {
            SafariViewController.hide();
        } catch (e) {

        }
        Factory.ajax(
            {
                action: 'callback/url',
                data: {
                    URL: url
                }
            }
        );
    }, 0);
}

function onErrorUser(_this){
    _this.src = 'img/login_default.png';
}

function onErrorMaquina(_this){
    _this.src = 'img/maquina.png';
}

function onErrorProd(_this){
    _this.src = 'img/produto.png';
}