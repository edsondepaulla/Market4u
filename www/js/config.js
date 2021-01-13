var config = {
    versao_app_mobile: "1.0.25",
    ambiente: function () {
        var ambiente = 'prod';
        if (Login.getData().DEV_AMBIENTE)
            ambiente = Login.getData().DEV_AMBIENTE.toString();
        if (!ambiente.length)
            ambiente = localStorage.getItem("ambiente") ? localStorage.getItem("ambiente") : 'prod';
        localStorage.setItem("ambiente", ambiente);
        return ambiente;
    },
    idApp: "market4uapp",
    dominio: 'market4u.com.br',
    url_api: function () {
        var subdominio = 'm';
        var ambiente = this.ambiente();
        if (ambiente != 'prod')
            subdominio += '-' + ambiente;
        return 'https://' + subdominio + '.' + this.dominio + '/';
    }
};

var Login = {
    data: {
        ID: 0,
        url_avatar: 'img/login_default.png',
        MEUSALDO_ATIVADO: 0,
        WHATSAPP: [],
        MEUSALDO: 0,
        GET_LOCAL: 0,
        MEUSALDO_FORMAT: 'R$ 0,00'
    },
    set: function (data) {
        // OLD
        var ID_OLD = data.ID;

        // ID
        data.ID = data.ID ? data.ID : 0;

        // DDI
        data.DDI = parseInt(data.DDI) ? data.DDI : '55';

        // Genero
        data.GENERO = data.ID ? data.GENERO : 'M';

        // Get local
        data.GET_LOCAL = Login.data.GET_LOCAL ? 1 : 0;

        // Disconectado
        if (parseInt(ID_OLD) && !parseInt(data.ID))
            Factory.alert('Você foi disconectado!');

        // Saldo
        data.WHATSAPP = data.WHATSAPP;
        data.MEUSALDO = data.MEUSALDO ? data.MEUSALDO : 0;
        data.MEUSALDO_FORMAT = data.MEUSALDO_FORMAT ? data.MEUSALDO_FORMAT : 'R$ 0,00';

        // Avatar
        data.url_avatar = data.url_avatar ? data.url_avatar : 'img/login_default.png';
        $('#userLeft img').attr('src', data.url_avatar);

        // Token maps
        if (data.TOKEN_MAPS)
            localStorage.setItem("TokenMaps", data.TOKEN_MAPS);

        // Set data
        Login.data = data;
        Factory.$rootScope.usuario = data;
        localStorage.setItem("CLIENTE", JSON.stringify(data));

        // Ambiente
        var ambiente = data.DEV_AMBIENTE.toString();
        if (!ambiente.length)
            ambiente = localStorage.getItem("ambiente") ? localStorage.getItem("ambiente") : 'prod';
        localStorage.setItem("ambiente", ambiente);

        // Redirect conecte-se
        if (!parseInt(data.ID)) {
            var hash = window.location.hash.split('/');
            switch (hash[1]) {
                case 'conecte-se':
                case 'cadastro':
                case 'suporte':
                case 'faq':
                case 'conecte-se-codigo':
                case 'atualizar-app':
                case 'token':
                case 'command':
                case 'sem-internet':
                    break;
                default:
                    Factory.$rootScope.location('#!/conecte-se');
                    break;
            }
        }
    },
    getData: function () {
        if (!Login.data.GET_LOCAL) {
            var data = JSON.parse(localStorage.getItem("CLIENTE"));
            if (data) {
                Login.data = data;
                Login.data.GET_LOCAL = 1;
            }
        }
        return Login.data;
    },
    setTimeoutLoginGet: null,
    logout: function () {
        foto_cadastro_novo = null;
        documento_cadastro_novo = null;
        Factory.ajax(
            {
                action: 'login/logout'
            }, function () {
                Payment.PRODUTOS_COMPRAS = [];
                Factory.$rootScope.LOCAL = [];
            }
        );
    },
    get: function (redirect, off) {
        clearTimeout(this.setTimeoutLoginGet);
        this.setTimeoutLoginGet = setTimeout(function () {
            return Factory.ajax(
                {
                    action: 'login/get'
                },
                function (data) {
                    if ((off ? !data.Login.ID : data.Login.ID) && redirect)
                        Factory.$rootScope.location(redirect, 0, 1);
                }
            );
        }, 500);
    }
};

var CC = {
    get: function () {
        var cc = localStorage.getItem("CC+" + Login.getData().ID);
        if (cc) {
            var cc = JSON.parse(CryptoJS.AES.decrypt(cc, Login.getData().KEY).toString(CryptoJS.enc.Utf8));
            return cc ? cc : {};
        } else
            return {};
    },
    add: function (cardData, bandeira) {
        try {
            // Ajusta year
            if (cardData.expirationYear.toString().length == 4)
                cardData.expirationYear = cardData.expirationYear.toString().substr(2, 2);

            var cc = this.get();
            var ID = 0;
            $.each(cc, function (idx, vals) {
                ID = idx;
            });
            ID++;
            cc[ID] = {
                'ID': ID,
                'NAME': cardData.holderName,
                'BANDEIRA': bandeira,
                'TIPO_CC': cardData.TIPO_CC,
                'TEXT': '**** **** **** ' + cardData.cardNumber.toString().replace(/ /g, '').substr(12, 4),
                'HASH': CryptoJS.AES.encrypt(btoa(JSON.stringify(cardData)), Login.getData().KEY).toString()
            };
            this.set(cc);
        } catch (e) {

        }
    },
    decrypt: function (vals) {
        return JSON.parse(atob(CryptoJS.AES.decrypt(vals, Login.getData().KEY).toString(CryptoJS.enc.Utf8)));
    },
    set: function (cc) {
        localStorage.setItem("CC+" + Login.getData().ID, CryptoJS.AES.encrypt(JSON.stringify(cc), Login.getData().KEY).toString());
    }
};

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
    DEVICE_ID: null,
    $http: null,
    $scope: [],
    $rootScope: [],
    $swipeLeftPageBefore: false,
    nao_confirmar_pg: false,
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
                    '',
                    function () {

                    },
                    msg
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
            case 'options/push':
            case 'options/pushvisualizado':
            case 'sac/getconversarion':
            case 'cadastro/ibge':
            case 'sac/saveconversarion':
            case 'redesocial/curtir':
            case 'options/log':
            case 'cadastro/cc':
            case 'redesocial/conexoes':
            case 'redesocial/seguirusuario':
            case 'redesocial/deixardeseguir':
                return false;
                break;
        }
        return true;
    },
    ajax: function (params, successCallback, functionError) {
        if (params.action) {
            // Loading
            var diffCarregando = (params.data ? params.data['LOADER_CARREGANDO'] === false : false) ? false : ((params.data ? params.data['LOADER_CARREGANDO'] === true : false) ? true : this.diffCarregando(params.action));
            if(params.method == 'GET')
                diffCarregando = false;
            if(params.loader)
                diffCarregando = true;
            if(params.loader === 0)
                diffCarregando = false;
            if (diffCarregando) {
                clearTimeout(Factory.timeoutCarregando);
                $('#carregando').css('display', 'flex').css('opacity', 1);
            }

            // Form
            var _form = params.form;

            // Data
            var data = new FormData();

            // Data (parametros)
            data.append('type-post', 'ajax');

            // Device
            data.append('device', Factory.$rootScope.device);
            if (Factory.DEVICE_ID)
                data.append('DEVICE_ID', Factory.DEVICE_ID);

            // Parametro versao app mobile
            if (config.versao_app_mobile)
                data.append('versao_app_mobile', config.versao_app_mobile);

            // Ambiente
            data.append('ambiente', config.ambiente());

            // Set data
            if (params.data) {
                $.each(params.data, function (index, val) {
                    try {
                        if (val.name && val.value)
                            data.append(val.name, val.value);
                        else if (val) {
                            if (typeof val === 'object' && index != 'IMAGEM' && index != 'DOCUMENTO') {
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
                url: config.url_api() + params.action,
                data: data,
                cache: params.cache ? true : false,
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
                                if (Factory.$rootScope)
                                    Factory.$rootScope.loading = false;
                                // Qtde push
                                Factory.$rootScope.QTDE_PUSH = parseInt(response.data.QTDE_PUSH || 0);
                                Factory.$rootScope.QTDE_SAC = parseInt(response.data.QTDE_SAC || 0);
                                Factory.$rootScope.PESQUISA_ATIVA = parseInt(response.data.PESQUISA_ATIVA || 0);

                                // Login
                                if (response.data.Login) {
                                    Login.set(response.data.Login);

                                    // Atualizar
                                    if (!parseInt(Login.getData().DADOS_ATUALIZADO) && params.action != 'login/get')
                                        Factory.$rootScope.location('#!/cadastro');

                                    // PHPSESSID
                                    if (response.data.Login.PHPSESSID)
                                        localStorage.setItem("PHPSESSID", response.data.Login.PHPSESSID);
                                }

                                // Juno
                                if (!$('#api_juno').length && response.data.Login)
                                    $('body').append('<script id="api_juno" onerror="semInternet()" src="' + (response.data.Login.JUNO.production ? 'https://www.boletobancario.com/boletofacil/wro/direct-checkout.min.js' : 'https://sandbox.boletobancario.com/boletofacil/wro/direct-checkout.min.js') + '"></script>');

                                // Versao nova
                                if (response.data.VERSAO_NOVA && params.action != 'options/atualizarapp') {
                                    Page.start();
                                    window.location = '#!/atualizar-app';
                                }

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

                                if (successCallback)
                                    eval(successCallback)(response.data);

                                if (_form)
                                    $('.btn-salvar').attr('disabled', false);

                                return response.data;
                            } catch (err) {
                                Factory.error(_form, err, functionError);
                            }
                            break;
                    }
                }, function (data) {
                    Layers.back($('#layers > li:last'));
                    $('#carregando').hide().css('opacity', 0);
                    $('.loadingLst').hide();
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
                                barColor: "#00CB00",
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

        if (functionError){
            try {
                eval(functionError)(name);
            } catch (err) {
            }
        }

        $('.btnConfirme').attr('disabled', false);

        if (data.status == '-1')
            window.location = '#!/sem-internet';
    },
    pushVisualizado: function (data) {
        Factory.ajax(
            {
                action: 'options/pushvisualizado',
                data: {
                    ID: data.id
                }
            }
        );
        setTimeout(function () {
            switch (data.type) {
                case 'BP': // Busca de produtos
                    Factory.$rootScope.STEP = 1;
                    Factory.$rootScope.TIPO_PG = 'COMPRAR';
                    Factory.$rootScope.Layers('produtos-busca');
                    Factory.$rootScope.PESQUISA = data.url;
                    break;
                case 'L': // Layers
                    switch (data.url) {
                        case '[MINHA_CARTEIRA]':
                            Factory.$rootScope.Layers('feed-minha-carteira');
                            break;
                        default:
                            if (data.url.indexOf('[PESQUISA#') != -1) {
                                Factory.$rootScope.Layers(
                                    'pesquisa-satisfacao-form',
                                    {
                                        ID: parseInt(data.url.split('#')[1].replace(']', ''))
                                    }
                                );
                            }
                            break;
                    }
                    break;
                case 'C': // Categorias
                    Factory.$rootScope.clickItem('index');
                    Factory.$rootScope.getCompras({ID: parseInt(data.url)});
                    break;
                case 'P': // Produto
                    Factory.$rootScope.getProduto(data.url);
                    break;
                case 'redirect':
                    if (data.url) {
                        if (data.external) {
                            data.url = {
                                'url': data.url,
                                'type': 'load_url',
                                'window_open': Factory.$rootScope.device == 'ios' ? false : true
                            };
                        }
                        Factory.$rootScope.location(data.url, data.external ? 1 : 0, 1);
                    }
                    break;
                default:
                    if (data.id)
                        Factory.$rootScope.location('#!/notificacoes/' + data.id);
                    break;
            }
        }, 3000);
    },
    prepare: function () {
        var mouseEventTypes = {
            touchstart : "mousedown",
            touchmove : "mousemove",
            touchend : "mouseup"
        };
        for (originalType in mouseEventTypes) {
            document.addEventListener(originalType, function (originalEvent) {
                event = document.createEvent("MouseEvents");
                touch = originalEvent.changedTouches[0];
                event.initMouseEvent(mouseEventTypes[originalEvent.type], true, true,
                    window, 0, touch.screenX, touch.screenY, touch.clientX,
                    touch.clientY, touch.ctrlKey, touch.altKey, touch.shiftKey,
                    touch.metaKey, 0, null);
                originalEvent.target.dispatchEvent(event);
                event.preventDefault();
            });
        }

        document.addEventListener("deviceready", function () {
            if (parseInt(Login.getData().ID) == 475 && false) {
                Factory.ajax(
                    {
                        action: 'options/log',
                        data: {
                            CODE: 'deviceready'
                        }
                    }
                );
                document.addEventListener("pause", function(){
                    Factory.ajax(
                        {
                            action: 'options/log',
                            data: {
                                CODE: 'pause'
                            }
                        }
                    );
                }, false);
                document.addEventListener("resume", function(){
                    Factory.ajax(
                        {
                            action: 'options/log',
                            data: {
                                CODE: 'resume'
                            }
                        }
                    );
                }, false);
            }

            if (Factory.$rootScope.device == 'ios')
                Factory.$rootScope.new_iphone = (parseFloat(device.model.replace('iPhone', '').replace(',', '.'))) > 10 ? 1 : 0;
            try {
                if(Factory.$rootScope.device == 'ios'){
                    onNotificationAPN = function (event) {
                        Factory.ajax(
                            {
                                action: 'options/push'
                            }
                        );
                        if (parseInt(event.foreground)) {
                            if (event.body) {
                                if (Factory.$rootScope.device == 'ios') {
                                    navigator.notification.confirm(
                                        event.body,
                                        function (buttonIndex) {
                                            if (buttonIndex == 2)
                                                Factory.pushVisualizado(event);
                                        },
                                        'Notificação\n\n'+event.title+'\n\n',
                                        'Ignorar,Visualizar'
                                    );
                                    navigator.notification.beep(1);
                                }
                            }
                        } else
                            Factory.pushVisualizado(event);
                    };
                    window.plugins.pushNotification.register(
                        function (result) {
                            Factory.DEVICE_ID = result;
                        },
                        function (result) {

                        },
                        {
                            "badge": "true",
                            "sound": "true",
                            "alert": "true",
                            "ecb": "onNotificationAPN"
                        }
                    );
                }else{
                    var push = PushNotification.init({
                        android: {
                            senderID: 344238321654,
                            iconColor: 'green'
                        }
                    });
                    push.on('registration', function (data) {
                        Factory.DEVICE_ID = data.registrationId;
                    });
                    push.on('notification', function (data) {
                        Factory.ajax(
                            {
                                action: 'options/push'
                            }
                        );
                        push.finish(function () {
                            if (data.additionalData.foreground) {
                                if (data.message) {
                                    cordova.plugins.notification.local.schedule({
                                        title: data.title,
                                        text: data.message,
                                        type: data.additionalData.type,
                                        url: data.additionalData.url,
                                        external: data.additionalData.external?1:0,
                                        id: data.additionalData.id,
                                        foreground: true,
                                        color: 'green'
                                    });
                                }
                            } else
                                Factory.pushVisualizado(data.additionalData);
                        });
                    });
                }
            } catch (e) {

            }

            Location.onDeviceReady();
            cordova.plugins.BluetoothStatus.initPlugin();
            window.addEventListener('BluetoothStatus.enabled', function () {
                bluetooth.ativado = true;
                if (bluetooth.callback_ativado)
                    bluetooth.detravar();
            });
            window.addEventListener('BluetoothStatus.disabled', function () {
                bluetooth.ativado = false;
            });

            cordova.plugins.notification.local.requestPermission(function (granted) {

            });
            cordova.plugins.notification.local.on("click", function (notification, state) {
                Factory.pushVisualizado(notification);
            });
        }, false);
        if (!parseInt(Login.getData().ID))
            window.location = '#!/conecte-se';
    }
};