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
        Factory.ajax(
            {
                action: 'login/logout'
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

app.controller('ConecteSe', function($rootScope, $scope, $routeParams, $q) {
    $rootScope.LogoBody = 1;
    $rootScope.NO_WHATSAPP = false;
    $rootScope.BARRA_SALDO = false;
    $rootScope.Titulo = "";

    $scope.entrar = function () {
        var EMAIL = $rootScope.usuario.EMAIL;
        var SENHA = $rootScope.usuario.SENHA;
        var ESQUECEU_SENHA = $rootScope.usuario.ESQUECEU_SENHA;
        if (!$('#formLogin').find('.ng-invalid').length && EMAIL && (ESQUECEU_SENHA ? true : SENHA)) {
            Factory.ajax(
                {
                    action: 'cadastro/login',
                    form: $('#formLogin'),
                    data: {
                        EMAIL: $rootScope.usuario.EMAIL,
                        SENHA: $rootScope.usuario.ESQUECEU_SENHA ? '' : $rootScope.usuario.SENHA,
                        ESQUECEU_SENHA: $rootScope.usuario.ESQUECEU_SENHA ? 1 : 0
                    }
                },
                function (data) {
                    if (data.status == 1) {
                        $rootScope.usuario.EMAIL = EMAIL;
                        $rootScope.usuario.SENHA = SENHA;
                        $rootScope.usuario.ESQUECEU_SENHA = ESQUECEU_SENHA;
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
                    }
                }
            );
        } else if (!EMAIL || $('#formLogin').find('#email.ng-invalid').length)
            $('#email').focus();
        else if (!SENHA || $('#formLogin').find('#senha.ng-invalid').length)
            $('#senha').focus();
    };

    $scope.login = function (action) {
        Factory.ajax(
            {
                action: 'cadastro/' + action
            }
        );
    };
});

app.controller('BoasVindas', function($rootScope, $scope, ReturnData) {
    $rootScope.BARRA_SALDO = false;
    $rootScope.Titulo = "BOAS-VINDAS";
    $rootScope.NO_WHATSAPP = false;
    $scope.CONTENT = ReturnData.CONTENT;
});

app.controller('Cadastro', function($rootScope, $scope) {
    $rootScope.BARRA_SALDO = false;
    $rootScope.LogoBody = 1;
    $rootScope.Titulo = parseInt($rootScope.usuario.ID) ? "AJUSTES" : "CADASTRAR-SE";
    $rootScope.NO_WHATSAPP = false;
    $scope.AJUSTES = ($rootScope.usuario.ID?$rootScope.usuario.DADOS_ATUALIZADO:false);

    // Atualizar dados
    if (parseInt($rootScope.usuario.ID) && parseInt(Login.getData().ID) && !parseInt(Login.getData().DADOS_ATUALIZADO)) {
        clearTimeout(Factory.timeout);
        Factory.timeout = setTimeout(function () {
            $rootScope.Titulo = "ATUALIZE SEUS DADOS";
            Factory.alert("Para continuar, por favor atualize seus dados :)");
        }, 500);
    }

    // Disable
    setTimeout(function () {
        if (parseInt($rootScope.usuario.ID)) {
            if ($rootScope.usuario.CPF)
                $('#cpf').attr('disabled', true);
            if ($rootScope.usuario.DATA_NASCIMENTO_FORMAT)
                $('#data_nascimento').attr('disabled', true);
        }
    }, 500);

    $rootScope.ITENS = [];
    $rootScope.ITENS.push({'ACTIVE': 1, 'SRC': 'view/conecte-se/level-dados-pessoais.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': 'view/conecte-se/level-dados-acesso.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': 'view/conecte-se/level-endereco.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': 'view/conecte-se/level-preferencias.html', 'ITENS': $rootScope.usuario.ITENS_PREFERENCIAS});
    if (!parseInt($rootScope.usuario.ID)) {
        $rootScope.pagseguro();
        $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': 'view/conecte-se/level-cc.html'});
    }
    if(!$scope.AJUSTES)
        $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': 'view/conecte-se/level-confirmar.html'});

    $scope.pref = function (ID) {
        $rootScope.usuario.PREFERENCIAS[ID] = $rootScope.usuario.PREFERENCIAS[ID] ? 0 : ID;
    };

    $scope.salvar = function () {
        $rootScope.usuario.DDI = 55;
        var USUARIO = $.extend({}, $rootScope.usuario);
        USUARIO.ESTADOS = null;
        USUARIO.STREET = $('#street').val();
        USUARIO.DISTRICT = $('#district').val();
        USUARIO.CITY = $('#city').val();
        USUARIO.STATE = $('#state').val();
        USUARIO.ITENS_PREFERENCIAS = null;
        USUARIO.WHATSAPP = null;
        USUARIO.SET_PREFERENCIAS = [];
        $.each(USUARIO.PREFERENCIAS, function (idx, ID) {
            if(parseInt(ID))
                USUARIO.SET_PREFERENCIAS.push(parseInt(ID));
        });
        USUARIO.PREFERENCIAS = null;
        USUARIO.TERMOS_DE_USO = null;
        USUARIO.POLITICA_DE_PRIVACIDADE = null
        if (parseInt($rootScope.usuario.ID)) {
            var EMAIL = $rootScope.usuario.EMAIL;
            var SENHA = $rootScope.usuario.SENHA;
            Factory.ajax(
                {
                    action: 'cadastro/editar',
                    data: {
                        REDIRECT: $rootScope.REDIRECT || '',
                        usuario: USUARIO,
                        AJUSTES: $scope.AJUSTES ? 1 : 0
                    }
                },
                function (data) {
                    if (data.status == 1) {
                        $rootScope.usuario.CONFIRME_DADOS = 1;
                        $rootScope.usuario.SENHA = SENHA;
                        $rootScope.usuario.EMAIL = EMAIL;
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
                        if ($scope.AJUSTES) {
                            $.each($rootScope.ITENS, function (idx, ITEM_IDX) {
                                ITEM_IDX.ACTIVE_AJUSTES = 0;
                            });
                        }
                    }
                }
            );
        } else {
            $rootScope.usuario.NOVO = true;
            Factory.ajax(
                {
                    action: 'cadastro/novo',
                    data: {
                        usuario: USUARIO
                    }
                }, function (data) {
                    if (data.status == 1) {
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
                        if (data.redirect_system)
                            $rootScope.REDIRECT = '';
                    }
                }
            );
        }
    };

    $scope.open = function (LEVEL) {
        if($scope.AJUSTES) {
            var active_ajustes = 0;
            $.each($rootScope.ITENS, function (idx, ITEM_IDX) {
                if (ITEM_IDX.ACTIVE_AJUSTES)
                    active_ajustes = 1;
                if (LEVEL == idx) {
                    ITEM_IDX.ACTIVE_AJUSTES = ITEM_IDX.ACTIVE_AJUSTES ? 0 : 1;
                } else {
                    ITEM_IDX.ACTIVE_AJUSTES = 0;
                }
            });
            if (active_ajustes)
                Login.get('#!/conecte-se', 1);
        }
    };

    $rootScope.btnLevel = function (LEVEL, TYPE) {
        if ($rootScope.ITENS.length == LEVEL)
            $scope.salvar();
        else {
            var focus = false;
            if (TYPE == 'NEXT') {
                $('body[controller="Cadastro"] #formCadastro.form #passo-a-passo > li.active input.ng-invalid').each(function () {
                    if (!focus) {
                        focus = true;
                        $(this).focus();
                    }
                });
                $('body[controller="Cadastro"] #formCadastro.form #passo-a-passo > li.active input.ng-invalid2').each(function () {
                    if (!focus) {
                        focus = true;
                        $(this).focus();
                    }
                });
                $('body[controller="Cadastro"] #formCadastro.form #passo-a-passo > li.active input[obg="1"]').each(function () {
                    if (!$(this).val() && !focus) {
                        focus = true;
                        $(this).focus();
                    }
                });
                $('body[controller="Cadastro"] #formCadastro.form #passo-a-passo > li.active select[obg="1"]').each(function () {
                    if (!$(this).val() && !focus) {
                        focus = true;
                        $(this).focus();
                    }
                });
            }
            if (!focus) {
                $.each($rootScope.ITENS, function (idx, ITEM_IDX) {
                    ITEM_IDX.ACTIVE = 0;
                    if (LEVEL == idx) {
                        ITEM_IDX.ACTIVE = 1;
                        if ($('#cardName:visible').length) {
                            $rootScope.usuario.CC_NAME = $('#cardName').val();
                            $rootScope.usuario.CC_NUMBER = $('#cardNumber').val();
                            $rootScope.usuario.CC_MONTHYEAR = $('#expirationMonthYear').val();
                            $rootScope.usuario.CC_CVV = $('#cvv').val();
                            $rootScope.usuario.CC_BANDEIRA = $('#cardBandeira').val();
                        }
                    }
                });
            }
        }
    };
});

app.controller('ConecteSeCodigo', function($rootScope, $scope, $routeParams) {
    if (Page.active) {
        $rootScope.BARRA_SALDO = false;
        $rootScope.Titulo = "Autenticação de dois fatores";

        $scope.reenviarCodSms = function (DATA) {
            var _function = function () {
                Factory.ajax(
                    {
                        action: 'cadastro/sms',
                        data: DATA
                    },
                    function (data) {
                        Factory.alert("Verifique suas mensagens no seu celular!")
                    }
                );
            };
            try {
                navigator.notification.confirm(
                    'Reenviar código para SMS?',
                    function (buttonIndex) {
                        if (buttonIndex == 1)
                            _function();
                    },
                    'Confirmar',
                    'Sim,Não'
                );
            } catch (e) {
                if (confirm('Enviar código para SMS?'))
                    _function();
            }
        };

        $scope.seguinte = function () {
            Factory.ajax(
                {
                    action: 'login/request',
                    form: $('#formCadastroCodigo'),
                    data: {
                        REDIRECT: $rootScope.REDIRECT || '',
                        EMAIL: $rootScope.usuario.EMAIL,
                        CONFIRME_DADOS: $rootScope.usuario.CONFIRME_DADOS,
                        ESQUECEU_SENHA: $rootScope.usuario.ESQUECEU_SENHA,
                        HASH: $rootScope.usuario.CODIGO,
                        SENHA: $rootScope.usuario.SENHA
                    }
                },
                function (data) {
                    if (data.status == 1)
                        $rootScope.REDIRECT = '';
                }
            );
        };
    } else
        window.history.go(-1);
});

app.controller('Card', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.Titulo = "Meus cartões";
    $scope.LST = ReturnData.LST;

    $scope.remove = function (ID) {
        var _function = function () {
            Factory.ajax(
                {
                    action: 'cadastro/cardremove',
                    data: {
                        ID: ID
                    }
                },
                function (data) {
                    if (typeof data.LST != 'undefined')
                        $scope.LST = data.LST;
                }
            );
        };
        try {
            navigator.notification.confirm(
                'Remover cartão de crédito?',
                function (buttonIndex) {
                    if (buttonIndex == 1)
                        _function();
                },
                'Confirmar',
                'Sim,Não'
            );
        } catch (e) {
            if (confirm('Remover cartão de crédito?'))
                _function();
        }
    };
});

app.controller('AddCard', function($rootScope, $scope) {
    $rootScope.Titulo = "Adicionar";

    $scope.salvar = function () {
        if (!$('#cardName').val().length)
            $('#cardName').focus();
        else if (!$('#cardNumber').val().length)
            $('#cardNumber').focus();
        else if (!$('#expirationMonthYear').val().length)
            $('#expirationMonthYear').focus();
        else if (!$('#cvv').val().length)
            $('#cvv').focus();
        else if(!parseInt($('#formCadastro').attr('invalid'))) {
            Factory.ajax(
                {
                    action: 'cadastro/addcard',
                    data: {
                        CC_NAME: $('#cardName').val(),
                        CC_NUMBER: $('#cardNumber').val(),
                        CC_MONTHYEAR: $('#expirationMonthYear').val(),
                        CC_CVV: $('#cvv').val(),
                        CC_BANDEIRA: $('#cardBandeira').val()
                    }
                },
                function (data) {
                    $rootScope.location('#!/card');
                }
            );
        }
    };

    // PagSeguro
    $rootScope.pagseguro();
});

app.controller('MinhaCarteira', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.BARRA_SALDO = false;
    $rootScope.Titulo = "Minha Carteira";
    $rootScope.NO_WHATSAPP = false;
    $rootScope.FORMA_PAGAMENTO = null;
    $rootScope.FORMAS_PG = ReturnData.FORMAS_PG;

    // PagSeguro
    $.each(ReturnData.FORMAS_PG, function (idx, f_pg) {
        if (f_pg.GATEWAY == 'PAGSEGURO')
            $rootScope.pagseguro(0, null, 1000);
    });

    $rootScope.VALOR_PG = 30;
    $scope.itens = [
        {
            value: 20,
        },
        {
            value: 30,
            active: 1,
            popular: 1
        },
        {
            value: 50,
        },
        {
            value: 100,
        },
        {
            value: 150,
        },
        {
            value: 300,
        }
    ];

    $scope.select = function (item) {
        $.each($scope.itens, function (idx, item_each) {
            item_each.active = 0;
        });
        item.active = 1;
        $rootScope.VALOR_PG = item.value;
    };
});

app.controller('VoucherLst', function($rootScope, $scope, $route, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Vouchers";
    $scope.LST = ReturnData.LST;

    $scope.click = function(reg) {
        $rootScope.location('#!/voucher/' + reg.ID);
    };

    $rootScope.ADD_VOUCHER = '';
    $scope.addVoucher = function () {
        if($rootScope.ADD_VOUCHER || '') {
            Factory.ajax(
                {
                    action: 'cadastro/addvoucher',
                    data: {
                        ADD_VOUCHER: $rootScope.ADD_VOUCHER
                    }
                },
                function (data) {
                    if (data.ATUALIZAR) {
                        $rootScope.ADD_VOUCHER = '';
                        $route.reload();
                    }
                }
            );
        }else
            $('#ADD_VOUCHER').focus();
    };
});

app.controller('VoucherGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Voucher - Detalhes";
    $rootScope.NO_WHATSAPP = false;
    $scope.REG = ReturnData;

    $scope.utilizarVoucher = function (CODIGO) {
        Factory.ajax(
            {
                action: 'cadastro/addvoucher',
                data: {
                    ADD_VOUCHER: CODIGO
                }
            },
            function (data) {
                if (data.ATUALIZAR)
                    $rootScope.location('#!/historico-transacoes');
            }
        );
    };
});

app.controller('HistoricoTransacoesLst', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Histórico de transações";
    $scope.LST = ReturnData.LST;

    $scope.click = function(reg) {
        $rootScope.location('#!/historico-transacoes/' + reg.ID);
    };
});

app.controller('HistoricoTransacoesGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Hist. de transações - Detalhes";
    $scope.REG = ReturnData;
});

app.controller('NotificacoesLst', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Notificações";
    $scope.LST = ReturnData.LST;

    $scope.click = function(reg) {
        switch (reg.TYPE) {
            case 'redirect':
                $rootScope.location(reg.URL);
                break;
            default:
                $rootScope.location('#!/notificacoes/' + reg.ID);
                break;
        }
    };
});

app.controller('NotificacoesGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Notificação - Detalhes";
    $scope.REG = ReturnData;
});

function fotoCadastro(){
    $('#fotoCadastro').change(function(){
        var _campo = $(this);

        //Limite default de 80MB para todos os arquivos menos xlsx e xls.
        var _maxsize = 102400000;
        var _maxsize_msg = 100;

        //Verifica se existe limitação no campo e converte o valor de MB para bytes.
        if(parseInt(_campo.data('maxsize'))){
            _maxsize = parseInt(_campo.data('maxsize')) * 1048576;
            _maxsize_msg = parseInt(_campo.data('maxsize'));
        }

        var i = 0, len = this.files.length;
        for ( ; i < len; i++ ){
            var file = this.files[i];
            var _ok = true;

            var _name_split     = file.name.split('.');
            var _ext            = _name_split[_name_split.length - 1].toLowerCase();

            if(file.size > _maxsize) {
                Factory.alert('Arquivo muito grande, utilizar menor ou igual a ' + _maxsize_msg + 'MB!');
                _campo.val('');
                _ok = false;
            }

            if(_ok === true && _campo.data('ext')){
                var _ext_permitidos = _campo.data('ext').split(',');
                if(_ext_permitidos.indexOf(_ext) == -1){
                    Factory.alert('Tipo de arquivo não aceito. Utilizar:'+' '+_campo.data('ext'));
                    _campo.val('');
                    _ok = false;
                }
            }

            if(_ok) {
                clearTimeout(Factory.timeout);
                Factory.timeout = setTimeout(function(){
                    Factory.ajax(
                        {
                            action: 'cadastro/imagem',
                            data: {
                                IMAGEM: file
                            }
                        },function(){
                            Login.get();
                        }
                    );
                    var oFReader = new FileReader();
                    oFReader.readAsDataURL(file);
                    oFReader.onload = function (oFREvent) {
                        document.getElementById('fotoCadastroImg').src = oFREvent.target.result;
                        $('#fotoCadastroImg').show();
                    };
                }, 1000);
            }
        }
    });
}