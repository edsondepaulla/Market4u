var Login = {
    data: {
        ID: 0,
        url_avatar: 'img/login_default.png',
        MEUSALDO_ATIVADO: 0,
        WHATSAPP: [],
        MEUSALDO: 0,
        MEUSALDO_FORMAT: 'R$ 0,00'
    },
    set: function (data) {
        // OLD
        var ID_OLD = data.ID;

        // ID
        data.ID = data.ID ? data.ID : 0;

        // Disconectado
        if(parseInt(ID_OLD) && !parseInt(data.ID))
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
    },
    getData: function () {
        return Login.data;
    },
    setTimeoutLoginGet: null,
    get: function (redirect) {
        clearTimeout(this.setTimeoutLoginGet);
        this.setTimeoutLoginGet = setTimeout(function () {
            return Factory.ajax(
                {
                    action: 'login/get'
                },
                function (data) {
                    if (data.Login.ID && redirect)
                        Factory.$rootScope.location(redirect, 0, 1);
                }
            );
        }, 500);
    },
    logout: function () {
        Factory.ajax(
            {
                action: 'login/logout'
            }
        );
    }
};

app.controller('ConecteSe', function($rootScope, $scope, $routeParams, $q) {
    $rootScope.LogoBody = 1;
    if(parseInt(Login.getData().ID)) {
        $rootScope.location('#!/');
    }else {
        $rootScope.border_top = 1;
        $rootScope.Titulo = "CONECTE-SE";
        QRScannerConf.destroy();

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
    }
});

app.controller('Cadastro', function($rootScope, $scope) {
    $rootScope.border_top = 1;
    $rootScope.LogoBody = 1;
    $rootScope.Titulo = parseInt($rootScope.usuario.ID) ? "EDITAR SEUS DADOS" : "CADASTRA-SE";
    QRScannerConf.destroy();

    // Atualizar dados
    if (parseInt($rootScope.usuario.ID) && parseInt(Login.getData().ID) && !parseInt(Login.getData().DADOS_ATUALIZADO))
        Factory.alert('Por favor, atualize seus dados!');

    $scope.salvar = function () {
        $rootScope.usuario.DDI = 55;
        var USUARIO = $.extend({}, $rootScope.usuario);
        USUARIO.ESTADOS = null;
        USUARIO.STREET = $('#street').val();
        USUARIO.DISTRICT = $('#district').val();
        USUARIO.CITY = $('#city').val();
        USUARIO.STATE = $('#state').val();
        if (parseInt($rootScope.usuario.ID)) {
            var EMAIL = $rootScope.usuario.EMAIL;
            var SENHA = $rootScope.usuario.SENHA;
            Factory.ajax(
                {
                    action: 'cadastro/editar',
                    data: {
                        REDIRECT: $rootScope.REDIRECT || '',
                        usuario: USUARIO
                    }
                },
                function (data) {
                    if (data.status == 1) {
                        $rootScope.usuario.CONFIRME_DADOS = 1;
                        $rootScope.usuario.SENHA = SENHA;
                        $rootScope.usuario.EMAIL = EMAIL;
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
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
                        if(data.redirect_system)
                            $rootScope.REDIRECT = '';
                    }
                }
            );
        }
    };
});

app.controller('ConecteSeCodigo', function($rootScope, $scope, $routeParams) {
    if (Page.active) {
        $rootScope.border_top = 1;
        $rootScope.Titulo = "Insira seu código";
        QRScannerConf.destroy();

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

app.controller('MinhaCarteira', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Minha Carteira";
    QRScannerConf.destroy();

    $rootScope.FORMA_PAGAMENTO = null;
    $rootScope.FORMAS_PG = ReturnData.FORMAS_PG;

    $rootScope.VALOR_PG = 20;
    $scope.itens = [
        {
            value: 10,
        },
        {
            value: 20,
            active: 1,
            popular: 1
        },
        {
            value: 30,
        },
        {
            value: 50,
        },
        {
            value: 100,
        },
        {
            value: 150,
        }
    ];

    $scope.select = function (item) {
        $.each($scope.itens, function (idx, item_each) {
            item_each.active = 0;
        });
        item.active = 1;
        $rootScope.VALOR_PG = item.value;
    };

    // PagSeguro
    $rootScope.pagseguro();
});

app.controller('VoucherLst', function($rootScope, $scope, $route, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Vouchers";
    QRScannerConf.destroy();
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
    QRScannerConf.destroy();
    $scope.REG = ReturnData;
});

app.controller('HistoricoTransacoesLst', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Histórico de transações";
    QRScannerConf.destroy();
    $scope.LST = ReturnData.LST;

    $scope.click = function(reg) {
        $rootScope.location('#!/historico-transacoes/' + reg.ID);
    };
});

app.controller('HistoricoTransacoesGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Histórico de transações - Detalhes";
    QRScannerConf.destroy();
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
                Factory.$rootScope.usuario.IMAGEM = file;

                // Preview
                var oFReader = new FileReader();
                oFReader.readAsDataURL(file);
                oFReader.onload = function (oFREvent) {
                    document.getElementById('fotoCadastroImg').src = oFREvent.target.result;
                    $('#fotoCadastroImg').show();
                };
            }
        }
    });
}