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
};

function onErrorUser(_this){
    _this.src = 'img/login_default.png';
}

function onErrorProd(_this){
    _this.src = 'img/market4u.png';
}

function showPassword() {
    $('#showPassword').toggleClass('mdi-action-visibility').toggleClass('mdi-action-visibility-off');
    $('#senha').attr('type', $('#showPassword').hasClass('mdi-action-visibility') ? 'password' : 'text').focus();
}

var setTimeoutClearKeyPress = null;
function inputEvents(_this, _bind) {
    var _this = $(_this);
    clearTimeout(setTimeoutClearKeyPress);
    setTimeoutClearKeyPress = setTimeout(function () {
        var _value = _this.val();
        var _invalid = 0;
        var _type = 1;
        var _verify = 1;
        switch (_this.attr('id')) {
            case 'senha':
                if (_value.length < 8 && _value.length)
                    _invalid = 1;
                break;
            case 'postalcode':
                if (_value.length == 9 && _value.length && _this.attr('value-old') != _value) {
                    $.ajax({
                        url: 'https://viacep.com.br/ws/' + _value.replace('-', '') + '/json/',
                        cache: false,
                        type: 'GET',
                        dataType: 'json',
                        success: function (data) {
                            _this.blur();
                            _this.attr('value-old', _value);
                            if (!data.erro) {
                                $('#street').val(data.logradouro);
                                Factory.$rootScope.usuario.STREET = data.logradouro;
                                $('#district').val(data.bairro);
                                Factory.$rootScope.usuario.DISTRICT = data.bairro;
                                $('#city').val(data.localidade);
                                Factory.$rootScope.usuario.CITY = data.localidade;
                                $('#state').val(data.uf);
                                Factory.$rootScope.usuario.STATE = data.uf;
                                if (data.ibge) {
                                    Factory.ajax(
                                        {
                                            action: 'cadastro/ibge',
                                            data: {
                                                CEP: _value.replace('-', ''),
                                                IBGE: data.ibge
                                            }
                                        }
                                    );
                                }
                            }else
                                Factory.alert('CEP inválido!');
                            $('#boxEnderecoCompleto').show();
                        },
                        beforeSend: function () {
                            $('#carregando').css('display', 'flex').css('opacity', 1);
                        },
                        complete: function () {
                            $('#carregando').hide().css('opacity', 0);
                        },
                        error: function () {
                            $('#carregando').hide().css('opacity', 0);
                            $('#boxEnderecoCompleto').show();
                        }
                    });
                }
                break;
            case 'data_nascimento':
                if (_value.length) {
                    if (!isValidDate(_value))
                        _invalid = 1;
                    else if (_value.length < 10)
                        _invalid = 1;
                }
                break;
            case 'cardCpfCnpj':
                if (_value.length) {
                    if (_value.length == 14) {
                        if (!validaCpf(_value.substring(0, 14)))
                            _invalid = 1;
                    } else if (_value.length == 18) {
                        if (!validarCNPJ(_value.substring(0, 18)))
                            _invalid = 1;
                    } else
                        _invalid = 1;
                }
                break;
            case 'passaporte':
                if (_value.length < 5) {
                    verifyMsg(_verify, 0, _this, 2);
                    _invalid = 1;
                    $('#boxDadosPessoaisCompleto').hide();
                    _this.attr('value-old', _value);
                } else if(_this.attr('value-old') != _value) {
                    Factory.ajax(
                        {
                            action: 'cadastro/passaporte',
                            data: {
                                VALUE: _value
                            }
                        },
                        function (data) {
                            _this.blur();
                            _this.attr('value-old', _value);
                            verifyMsg(_verify, data.ja_utilizado ? 1 : 0, _this, 2);
                            if (!data.ja_utilizado) {
                                $('#passaporte').val(_value);
                                Factory.$rootScope.usuario.PASSAPORTE = _value;
                                $('#boxDadosPessoaisCompleto').show();
                            }
                        }
                    );
                }
                break;
            case 'cpf':
                if (!validaCpf(_value.substring(0, 14)) && _value.length) {
                    verifyMsg(_verify, 0, _this, 2);
                    _invalid = 1;
                    $('#boxDadosPessoaisCompleto').hide();
                    _this.attr('value-old', _value);
                } else if (_value.length == 14 && _this.attr('value-old') != _value) {
                    Factory.ajax(
                        {
                            action: 'cadastro/cpf',
                            data: {
                                VALUE: _value
                            }
                        },
                        function (data) {
                            _this.blur();
                            _this.attr('value-old', _value);
                            verifyMsg(_verify, data.ja_utilizado ? 1 : 0, _this, 2);
                            if (!data.ja_utilizado) {
                                $('#cpf').val(_value);
                                Factory.$rootScope.usuario.CPF = _value;
                                if (data.NOME) {
                                    $('#nome_completo').val(data.NOME);
                                    Factory.$rootScope.usuario.NOME = data.NOME;
                                }
                                if (data.GENERO) {
                                    $('#genero_' + data.GENERO).attr('checked', true);
                                    Factory.$rootScope.usuario.GENERO = data.GENERO;
                                }
                                if (data.DATA_NASCIMENTO) {
                                    $('#data_nascimento').attr('disabled', true).val(data.DATA_NASCIMENTO);
                                    Factory.$rootScope.usuario.DATA_NASCIMENTO_FORMAT = data.DATA_NASCIMENTO;
                                }
                                $('#boxDadosPessoaisCompleto').show();
                            }
                        }
                    );
                }
                break;
            case 'expirationMonthYear':
                if (_value.length) {
                    _value = _value.split('/');
                    _value[1] = '20' + _value[1];
                    if (parseInt(_value[0]) > 12 || parseInt(_value[0]) < 1)
                        _invalid = 1;
                    else if (parseInt(_value[1]) < (new Date()).getFullYear())
                        _invalid = 1;
                }
                break;
            case 'numero_celular':
                if(_value.length) {
                    switch (parseInt($('#numero_ddi').val())) {
                        case 55:
                            _value = _value.replace(/\D/g, '');
                            if(_value.length != 10 && _value.length != 11)
                                _invalid = 1;
                            break;
                        default:
                            if (_value.length < 6)
                                _invalid = 1;
                            break;
                    }
                } else
                    _invalid = 1;
                break;
            case 'cardNumber':
                _value = _value.replace(/ /g, '');
                _invalid = 0;
                _verify = 0;
                if (_value.length >= 6) {
                    verifyMsg(1, 0, _this);
                    $('#cardBandeira').val('');
                    $('#imgBandeira').hide();
                    if(!(_this.attr('tipo') == 'VA' || _this.attr('tipo') == 'VR')) {
                        Factory.ajax(
                            {
                                action: 'cadastro/cc',
                                data: {
                                    VALUE: _value.substr(0, 6)
                                }
                            },
                            function (data) {
                                if (data.bandeira) {
                                    verifyMsg(1, 0, _this);
                                    $('#cardBandeira').val(data.bandeira);
                                    $('#imgBandeira').show().attr('src', 'img/bandeira_cc/' + data.bandeira + '.png');
                                } else {
                                    verifyMsg(1, 1, _this);
                                    $('#cardBandeira').val('');
                                    $('#imgBandeira').hide();
                                }
                            }
                        );
                    }
                }
                break;
            case 'nome_completo':
                _value = _value.split(' ');
                if (!((_value[0] && _value[1]) || !_value[0]) && _value[0])
                    _invalid = 1;
                break;
            case 'email':
                if (_value.length) {
                    var email = _value.split('@');
                    if (email[0] && email[1]) {
                        Factory.ajax(
                            {
                                action: 'cadastro/verify',
                                data: {
                                    TYPE: 'EMAIL',
                                    VALUE: _value
                                }
                            },
                            function (data) {
                                verifyMsg(_verify, data.ja_utilizado ? 1 : 0, _this, 2);
                            }
                        );
                    }
                } else
                    _type = 2;
                break;
            case 'u_n':
                if (_value.length) {
                    _value = replaceSpecialChars(_value.toLowerCase());
                    _this.val(_value);
                    Factory.ajax(
                        {
                            action: 'cadastro/verify',
                            data: {
                                TYPE: 'USERNAME',
                                VALUE: _value
                            }
                        },
                        function (data) {
                            verifyMsg(_verify, data.ja_utilizado ? 1 : 0, _this, 2);
                        }
                    );
                } else
                    _type = 2;
                break;
            default:
                _verify = 0;
                break;
        }
        verifyMsg(_verify, _invalid, _this, _type);
    }, _bind == 'blur' ? 0 : 1000);
}

function verifyMsg(_verify, _invalid, _this, type) {
    if (_verify) {
        if (_invalid)
            _this.addClass('ng-invalid' + (type == 2 ? '2' : ''));
        else
            _this.removeClass('ng-invalid' + (type == 2 ? '2' : ''));

        _this.closest('form').attr('invalid', _this.closest('form').find('input.ng-invalid').length || _this.closest('form').find('input.ng-invalid2').length ? 1 : 0);
    }
}

function replaceSpecialChars(str) {
    var $spaceSymbol = '';
    var regex;
    var returnString = str;
    var specialChars = [
        {val:"a",let:"áàãâä"},
        {val:"e",let:"éèêë"},
        {val:"i",let:"íìîï"},
        {val:"o",let:"óòõôö"},
        {val:"u",let:"úùûü"},
        {val:"c",let:"ç"},
        {val:"A",let:"ÁÀÃÂÄ"},
        {val:"E",let:"ÉÈÊË"},
        {val:"I",let:"ÍÌÎÏ"},
        {val:"O",let:"ÓÒÕÔÖ"},
        {val:"U",let:"ÚÙÛÜ"},
        {val:"C",let:"Ç"},
        {val:"",let:"?!()"}
    ];
    for (var i = 0; i < specialChars.length; i++) {
        regex = new RegExp("["+specialChars[i].let+"]", "g");
        returnString = returnString.replace(regex, specialChars[i].val);
        regex = null;
    }

    var sourceString = returnString.replace(/\s/g,$spaceSymbol);

    return sourceString.replace(/[` ´~!@#$%^&*()|_+\-=?;:¨'",<>\{\}\[\]\\\/]/gi, '');
}
function isValidDate(data) {
    var regex = "\\d{2}/\\d{2}/\\d{4}";
    var dtArray = data.split("/");

    if (dtArray == null)
        return false;

    // Checks for dd/mm/yyyy format.
    var dtDay = dtArray[0];
    var dtMonth = dtArray[1];
    var dtYear = dtArray[2];

    if (dtMonth < 1 || dtMonth > 12)
        return false;
    else if (dtDay < 1 || dtDay > 31)
        return false;
    else if (dtYear > (new Date()).getFullYear() || dtYear <= ((new Date()).getFullYear() - 100))
        return false;
    else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
        return false;
    else if (dtMonth == 2) {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay > 29 || (dtDay == 29 && !isleap))
            return false;
    }
    return true;
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g,'');

    if(cnpj == '') return false;

    if (cnpj.length != 14)
        return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999")
        return false;

    // Valida DVs
    tamanho = cnpj.length - 2;
    numeros = cnpj.substring(0,tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return false;

    return true;
}

function validaCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var result = true;
    [9, 10].forEach(function (j) {
        var soma = 0, r;
        cpf.split(/(?=)/).splice(0, j).forEach(function (e, i) {
            soma += parseInt(e) * ((j + 2) - (i + 1));
        });
        r = soma % 11;
        r = (r < 2) ? 0 : 11 - r;
        if (r != cpf.substring(j, j + 1)) result = false;
    });
    return result;
}

function inputHandler(masks, max, event) {
    var c = event.target;
    var v = c.value.replace(/\D/g, '');
    var m = c.value.length > max ? 1 : 0;
    VMasker(c).unMask();
    VMasker(c).maskPattern(masks[m]);
    c.value = VMasker.toPattern(v, masks[m]);
}

function inputHandlerCelular(masks, max, event) {
    switch (parseInt($('#numero_ddi').val())) {
        case 55:
            var c = event.target;
            var v = c.value.replace(/\D/g, '');
            var m = c.value.length > max ? 1 : 0;
            VMasker(c).unMask();
            VMasker(c).maskPattern(masks[m]);
            c.value = VMasker.toPattern(v, masks[m]);
            break;
    }
}

var maskCelular = function(ddi, init) {
    var mask = ['(99) 9999-9999', '(99) 99999-9999'];
    try {
        var element = document.querySelector('#numero_celular');
        VMasker(element).unMask();
        switch (ddi) {
            case 55:
                VMasker(element).maskPattern($('#numero_celular').val().replace(/\D/g, '').length != 10 ? mask[1] : mask[0]);
                break;
            default:
                VMasker(element).maskPattern('99999999999999999');
                break;
        }
        if (init)
            element.addEventListener('input', inputHandlerCelular.bind(undefined, mask, 14), false);
    } catch (e) {

    }
};

var mask = function(element, mask, length) {
    try {
        var element = document.querySelector(element);
        VMasker(element).maskPattern(mask[0]);
        if (mask[1])
            element.addEventListener('input', inputHandler.bind(undefined, mask, length), false);
    } catch (e) {

    }
};

Number.prototype.formatPrice = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace(/\./g, c) : num).replace(new RegExp(re, 'g'), '$&' + (s));
};

let doDrag = false;
var Layers = {
    router: {
        'produto-detalhes': {
            template: 'index/produto-detalhes.html',
            controller: 'ProdutoDetalhes',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 1,
            scroll_off: 1,
            add_cabecalho: 1,
            loader: 1
        },
        'verificar-cc': {
            template: 'pages/validar-cc.html',
            controller: 'ValidarCC',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            scroll_off: 1,
            add_cabecalho: 1,
            loader: 1
        },
        'produtos-busca': {
            template: 'index/produtos-busca.html',
            controller: 'ProdutosBusca',
            type: 'left',
            menu_bottom: 0,
            btn_carrinho_full: 1,
            add_cabecalho: 0,
            scroll_off: 0,
            loader_principal: 0
        },
        'feed-perfil': {
            template: 'pages/feed_perfil.html',
            controller: 'FeedPerfilSocial',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 0,
            loader: 1
        },
        'feed-ver-todos': {
            template: 'pages/feed_ver_todos_follows.html',
            controller: 'FeedVerTodosSocial',
            type: 'left',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 0,
            loader: 1
        },
        'feed-requests': {
            template: 'pages/feed_requests_follows.html',
            controller: 'FeedRequestsSocial',
            type: 'left',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 1
        },

        'feed-busca-transferir': {
            template: 'pages/feed_busca_transferir.html',
            controller: 'FeedTransferirSocial',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 0,
            titulo: 'Transferência'
        },
        'feed-minha-carteira': {
            template: 'conecte-se/carteira.html',
            controller: 'MinhaCarteiraLayer',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 1
        },
        'pesquisa-satisfacao-form': {
            template: 'pages/pesquisa-satisfacao-form.html',
            controller: 'FormPesquisaSatisfacao',
            type: 'top',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            scroll_off: 1,
            add_cabecalho: 1,
            loader_principal: 0
        },
        'historico-transacoes-detalhes': {
            template: 'conecte-se/historico-transacoes-detalhes.html',
            controller: 'HistoricoTransacoesGet',
            type: 'left',
            menu_bottom: 0,
            btn_carrinho_full: 0,
            add_cabecalho: 1,
            scroll_off: 1,
            loader_principal: 1
        }

    },
    topLayers: 20,
    cabecalho: function(vars) {
        return `<a class="voltarLayers">
                    <i onclick="Layers.back($(this).closest('li'))" class="mdi mdi-navigation-chevron-left"></i>
                    <span class="title_root_layers">` + (vars ? '{{TITULO_LAYERS}}' : '') + `</span>
                   </a>`;
    },
    bodyAnimate: function (left, semtime) {
        if (semtime)
            $('body, #toolbar, ul#menu-bottom').css('left', left);
        else
            $('body, #toolbar, ul#menu-bottom').animate({left: left}, 200);
    },
    back: function (_li) {
        if (_li) {
            var keyframes = [];
            keyframes['opacity'] = 0.5;
            keyframes[_li.attr('type')] = _li.attr('type') == 'left' ? $(window).width() : $(window).height();
            if (_li.attr('type') == 'top') {
                keyframes['width'] = '80%';
                keyframes['left'] = '10%';
            }
            if ($('#layers > li').length == 1)
                Layers.bodyAnimate(0);
            _li.prev('li').animate({left: 0}, 200);
            _li.animate(keyframes, 200, function () {
                $(this).remove();
                if ($('#layers > li').length) {
                    $('body').attr('menu-bottom', $('#layers > li:last-child').attr('menu-bottom'));
                    var _router = Layers.router[$('#layers > li:last-child').attr('router')];
                    $('body').attr('btn_carrinho_full', _router.btn_carrinho_full);
                } else {
                    Layers.bodyAnimate(0);
                    $('body').attr('menu-bottom', 0);
                    $('body').attr('btn_carrinho_full', 0);
                }
            });
        } else {
            Layers.bodyAnimate(0, true);
            $('#layers > li').remove();
            $('body').attr('menu-bottom', 0);
            $('body').attr('btn_carrinho_full', 0);
        }
    },
    new: function (_router_value, _router) {
        Factory.$rootScope.menuClose();
        if (_router.type == 'left')
            $('#layers > li[type="left"]:last-child').animate({left: '-50px'}, 200);
        var qtde = !$('#layers > li').length;
        var id = random(1, 999999) + '-' + random(1, 999999) + '-' + random(1, 999999);
        _router.type = _router.type ? _router.type : 'left';
        _router.menu_bottom = _router.menu_bottom ? 1 : 0;
        $('body').attr('menu-bottom', _router.menu_bottom);
        $('body').attr('btn_carrinho_full', _router.btn_carrinho_full);
        $('#layers').append('<li router="' + _router_value + '" id="' + id + '" menu-bottom="' + _router.menu_bottom + '" type="' + _router.type + '">' +
            this.cabecalho() +
            (_router.loader?'<img class="loaderLayers" src="' + Factory.BASE + 'img/loader.gif" width="80" border="0">':'') +
            '</li>');

        $('#' + id).draggable({
            axis: _router.type == 'left' ? 'x' : 'y',
            start: function () {
                $('body').attr('drag', _router.scroll_off);
            },
            drag: function (event, ui) {
                let clientPosition = event.clientY;
                let windowH = window.innerHeight;
                let dividedBy = windowH / 4;
                if(clientPosition <= dividedBy || _router.type =='left'){
                    doDrag = true;
                    $('body').attr('drag', _router.scroll_off);
                    if (_router.type == 'left') {
                        if (ui.position.left < 0)
                            ui.position.left = 0;
                        else {
                            var left = -50 + ((ui.position.left / $(window).width()) * 50);
                            if ($('#layers > li').length == 1)
                                Layers.bodyAnimate(left, true);
                            else
                                $('#layers > li:last-child').prev('li').css('left', left);
                        }
                    } else {
                        if (ui.position.top < Layers.topLayers)
                            ui.position.top = Layers.topLayers;
                        else {
                            var top = ((ui.position.top / $(window).height()) * 20);
                            $(this).css('margin-left', (top / 2) + '%').css('width', (100 - top) + '%');
                        }
                    }
                }else if(!doDrag){
                    return false;
                }

            },
            stop: function (event, ui) {
                $('body').attr('drag', 0);
                doDrag = false;
                if (_router.type == 'left') {
                    if (ui.position.left > 80) {
                        Layers.back($(this));
                    } else {
                        ui.position.left = 0;
                        $(this).animate({
                            opacity: '1',
                            left: 0
                        }, 300);
                    }
                } else {
                    if (ui.position.top > 200) {
                        Layers.back($(this));
                    } else {
                        ui.position.top = Layers.topLayers;
                        $(this).animate({
                            opacity: '1',
                            width: '100%',
                            'margin-left': 0,
                            top: Layers.topLayers
                        }, 300);
                    }
                }
            }
        });

        if (qtde && $('#layers > li[type="left"]:last-child').length)
            Layers.bodyAnimate(-50);

        $('#layers > li[type="left"]:last-child').animate({left: '0'}, 200);
        $('#layers > li[type="top"]:last-child').animate({top: Layers.topLayers}, 200);
        return id;
    }
};

function random(par1, par2){
    par1 = parseInt(par1);
    par2 = parseInt(par2);
    return new Date().getTime() + (par1 + (Math.floor(Math.random() * (par2 + 1 - par1))));
}