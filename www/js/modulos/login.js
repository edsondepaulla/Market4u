
app.controller('ConecteSe', function($rootScope, $scope, $routeParams, $q) {
    $rootScope.LogoBody = 1;
    $rootScope.NO_WHATSAPP = false;
    $rootScope.BARRA_SALDO = false;
    $rootScope.Titulo = "";

    $scope.entrar = function () {
        var EMAIL_CPF = $rootScope.usuario.EMAIL_CPF;
        var SENHA = $rootScope.usuario.SENHA;
        var ESQUECEU_SENHA = $rootScope.usuario.ESQUECEU_SENHA;
        if (!$('#formLogin').find('.ng-invalid').length && EMAIL_CPF && (ESQUECEU_SENHA ? true : SENHA)) {
            Factory.ajax(
                {
                    action: 'cadastro/login',
                    form: $('#formLogin'),
                    data: {
                        EMAIL_CPF: $rootScope.usuario.EMAIL_CPF,
                        SENHA: $rootScope.usuario.ESQUECEU_SENHA ? '' : $rootScope.usuario.SENHA,
                        ESQUECEU_SENHA: $rootScope.usuario.ESQUECEU_SENHA ? 1 : 0
                    }
                },
                function (data) {
                    if (data.status == 1) {
                        if(EMAIL_CPF.indexOf('@') !== -1)
                            $rootScope.usuario.EMAIL = EMAIL_CPF;
                        $rootScope.usuario.SENHA = SENHA;
                        $rootScope.usuario.ESQUECEU_SENHA = ESQUECEU_SENHA;
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
                    }
                }
            );
        } else if (!EMAIL_CPF || $('#formLogin').find('#email_cpf.ng-invalid').length)
            $('#email_cpf').focus();
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
    $rootScope.Titulo = parseInt($rootScope.usuario.ID) ? "PERFIL" : "CADASTRAR-SE";
    $rootScope.NO_WHATSAPP = false;
    $scope.AJUSTES = ($rootScope.usuario.ID ? $rootScope.usuario.DADOS_ATUALIZADO : false);

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
    var base = config.url_api();

    $rootScope.ITENS.push({'ACTIVE': 1, 'SRC': base + 'Mobile/www/view/conecte-se/level-dados-pessoais.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-dados-acesso.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-privacidade.html'});
    $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-endereco.html'});
    $rootScope.ITENS.push({
        'ACTIVE': 0,
        'SRC': base + 'Mobile/www/view/conecte-se/level-preferencias.html',
        'ITENS': $rootScope.usuario.ITENS_PREFERENCIAS
    });
    if (!$scope.AJUSTES) {
        $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-foto.html'});
        $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-confirmar.html'});
    } else {
        if (parseInt($rootScope.usuario.ID))
            $rootScope.ITENS.push({'ACTIVE': 0, 'SRC': base + 'Mobile/www/view/conecte-se/level-termos-politica.html'});
        $rootScope.MenuBottom = true;
    }

    $scope.pref = function (ID) {
        if (!$rootScope.usuario.PREFERENCIAS)
            $rootScope.usuario.PREFERENCIAS = [];
        $rootScope.usuario.PREFERENCIAS[ID] = $rootScope.usuario.PREFERENCIAS[ID] ? 0 : ID;
    };

    $scope.validar = function () {
        $rootScope.usuario.DDI = $('#numero_ddi').val() ? $('#numero_ddi').val() : $rootScope.usuario.DDI;
        $rootScope.usuario.CELULAR = $('#numero_celular').val() ? $('#numero_celular').val() : $rootScope.usuario.CELULAR;
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
            if (parseInt(ID))
                USUARIO.SET_PREFERENCIAS.push(parseInt(ID));
        });
        USUARIO.PREFERENCIAS = null;
        USUARIO.TERMOS_DE_USO = null;
        USUARIO.POLITICA_DE_PRIVACIDADE = null;
        USUARIO.DOC_NOVO = documento_cadastro_novo ? 1 : 0;
        return USUARIO;
    };

    $scope.salvar = function () {
        var USUARIO = $scope.validar();
        if (parseInt($rootScope.usuario.ID)) {
            var EMAIL = $rootScope.usuario.EMAIL;
            var SENHA = $rootScope.usuario.SENHA;
            Factory.ajax(
                {
                    action: 'cadastro/editar',
                    data: {
                        REDIRECT: $rootScope.REDIRECT || '',
                        usuario: USUARIO,
                        DOCUMENTO: documento_cadastro_novo,
                        AJUSTES: $scope.AJUSTES ? 1 : 0
                    }
                },
                function (data) {
                    if (data.status == 1) {
                        documento_cadastro_novo = null;
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
                        usuario: USUARIO,
                        IMAGEM: foto_cadastro_novo,
                        DOCUMENTO: documento_cadastro_novo
                    }
                }, function (data) {
                    if (data.status == 1) {
                        foto_cadastro_novo = null;
                        documento_cadastro_novo = null;
                        $rootScope.usuario.ENVIADO_PARA = data.ENVIADO_PARA;
                        if (data.redirect_system)
                            $rootScope.REDIRECT = '';
                    }
                }
            );
        }
    };

    $scope.checkAndSavePrivacidade = function (type_, el) {
        el = $(el).hasClass('check_Nprivacidade') ? el : $(el).closest('.check_privacidade');
        var check_el = $(el).find('h3');
        if ($(check_el).hasClass('active_checkbox')) {
            $(check_el).removeClass('active_checkbox');
            $rootScope.usuario[type_.toUpperCase()] = 'PUBLICO';
        } else {
            $(check_el).addClass('active_checkbox');
            $rootScope.usuario[type_.toUpperCase()] = 'PRIVADO';
        }
    };

    $scope.open = function (LEVEL) {
        if ($scope.AJUSTES) {
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
            if (TYPE == 'NEXT') {
                Factory.ajax(
                    {
                        action: 'cadastro/validar',
                        data: {
                            usuario: $scope.validar()
                        }
                    }, function (data) {
                        if (data.status == 1) {
                            var focus = false;
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
                            if (!focus) {
                                $.each($rootScope.ITENS, function (idx, ITEM_IDX) {
                                    ITEM_IDX.ACTIVE = 0;
                                    if (LEVEL == idx) {
                                        ITEM_IDX.ACTIVE = 1;
                                    }
                                });
                            }
                        }
                    }
                );
            } else {
                $.each($rootScope.ITENS, function (idx, ITEM_IDX) {
                    ITEM_IDX.ACTIVE = 0;
                    if (LEVEL == idx) {
                        ITEM_IDX.ACTIVE = 1;
                    }
                });
            }
        }
    };
});

app.controller('ConecteSeCodigo', function($rootScope, $scope, $routeParams) {
    if (Page.active) {
        $rootScope.BARRA_SALDO = false;
        $rootScope.Titulo = "Validação";

        $scope.reenviarCodSms = function (DATA) {
            var _function = function () {
                Factory.ajax(
                    {
                        action: 'cadastro/sms',
                        data: DATA
                    },
                    function (data) {
                        Factory.alert("Verifique suas mensagens no seu celular!");
                    }
                );
            };
            try {
                navigator.notification.confirm(
                    '',
                    function (buttonIndex) {
                        if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1))
                            _function();
                    },
                    'Reenviar código para SMS?',
                    Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
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
                        ENVIADO_PARA: $rootScope.usuario.ENVIADO_PARA,
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

app.controller('CardNew', function($rootScope, $scope, $routeParams) {
    $rootScope.Titulo = "Meus cartões";
    var cc = CC.get();
    $scope.LST = {};
    $.each(cc, function (ID_CC, VALS_CC) {
        switch (VALS_CC.TIPO_CC) {
            case 'VR':
                VALS_CC.TIPO_CC_VALUE = 'Vale-refeição';
                break;
            case 'VA':
                VALS_CC.TIPO_CC_VALUE = 'Vale-alimentação';
                break;
            default:
            case 'CC/DEBITO':
                VALS_CC.TIPO_CC_VALUE = 1 ? 'Crédito' : 'Crédito/débito';
                break;
        }
        VALS_CC.IMG = config.url_api() + 'skin/default/images/bandeira_cc/' + VALS_CC.BANDEIRA + '.png';
        $scope.LST[ID_CC] = VALS_CC;
    });

    $rootScope.MenuBottom = true;
    $rootScope.NO_WHATSAPP = false;

    $scope.remove = function (ID) {
        var _function = function () {
            var cc_new = {};
            $.each(cc, function (ID_CC, VALS_CC) {
                if (parseInt(ID_CC) != parseInt(ID))
                    cc_new[ID_CC] = VALS_CC;
            });
            $scope.LST = cc = cc_new;
            CC.set(cc_new);
        };
        try {
            navigator.notification.confirm(
                '',
                function (buttonIndex) {
                    if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1))
                        _function();
                },
                'Remover cartão de crédito?',
                Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
            );
        } catch (e) {
            if (confirm('Remover cartão de crédito?'))
                _function();
        }
    };
});

app.controller('AddCardNew', function($rootScope, $scope, ReturnData) {
    $rootScope.Titulo = "Adicionar";
    $rootScope.MenuBottom = true;
    $rootScope.NO_WHATSAPP = false;
    $rootScope.TIPOS = ReturnData.TIPOS;
    $rootScope.PG = {'TIPO':'CC/DEBITO', 'cardBandeira': 'VR'};

    $scope.salvar = function () {
        if (!$('#cardNumber').val().length)
            $('#cardNumber').focus();
        else if (!$('#expirationMonthYear').val().length)
            $('#expirationMonthYear').focus();
        else if (!$('#cvv').val().length)
            $('#cvv').focus();
        else if (!$('#cardName').val().length)
            $('#cardName').focus();
        else if (!$('#cardCpfCnpj').val().length)
            $('#cardCpfCnpj').focus();
        else if (!parseInt($('#formCadastro').attr('invalid'))) {
            var expirationMonthYear = $('#expirationMonthYear').val().toString().split('/');
            var cardData = {
                cardNumber: $('#cardNumber').val().toString().replace(/ /g, ''),
                holderName: $('#cardName').val().toString(),
                CpfCnpj: $('#cardCpfCnpj').val().toString(),
                securityCode: $('#cvv').val().toString(),
                expirationMonth: expirationMonthYear[0],
                expirationYear: expirationMonthYear[1],
                TIPO_CC: $('[name="TIPO"]:checked').val().toString()
            };
            switch (cardData.TIPO_CC) {
                case 'VA':
                case 'VR':
                case 'CC/DEBITO':
                    var valido_year_month = false;
                    var anoatual = parseInt(new Date().getFullYear());
                    var mesatual = parseInt(new Date().getMonth()) + 1;
                    if (parseInt(cardData.expirationMonth) >= 1 && parseInt(cardData.expirationMonth) <= 12 && parseInt('20' + cardData.expirationYear) >= anoatual) {
                        if (anoatual == parseInt('20' + cardData.expirationYear)) {
                            if (parseInt(cardData.expirationMonth) >= mesatual)
                                valido_year_month = true;
                        } else
                            valido_year_month = true;
                    }
                    if (valido_year_month) {
                        if (cardData.securityCode) {
                            var valido = false;
                            var bandeira = false;
                            switch (cardData.TIPO_CC) {
                                case 'VA':
                                case 'VR':
                                    bandeira = $('[name="cardBandeira"]:checked').length ? $('[name="cardBandeira"]:checked').val().toString() : false;
                                    switch (bandeira) {
                                        case 'VR':
                                            switch (cardData.TIPO_CC) {
                                                case 'VR':
                                                    valido = cardData.cardNumber.substring(0, 6) == '627416' && cardData.cardNumber.length == 16 ? true : false;
                                                    break;
                                                case 'VA':
                                                    valido = cardData.cardNumber.substring(0, 6) == '637036' && cardData.cardNumber.length == 16 ? true : false;
                                                    break;
                                            }
                                            break;
                                    }
                                    if (valido) {
                                        CC.add(cardData, bandeira);
                                        $rootScope.location('#!/card-new');
                                    } else {
                                        $('#cardNumber').focus();
                                        $rootScope.dadosInvalidosCC('Número do cartão inválido');
                                    }
                                    break;
                                case 'CC/DEBITO':
                                    Factory.ajax(
                                        {
                                            action: 'cadastro/cc',
                                            data: {
                                                VALUE: cardData.cardNumber.substr(0, 6)
                                            }
                                        },
                                        function (data) {
                                            if (data.bandeira) {
                                                CC.add(cardData, data.bandeira);
                                                $rootScope.location('#!/card-new');
                                            } else {
                                                $('#cardNumber').focus();
                                                $rootScope.dadosInvalidosCC('Número do cartão inválido');
                                            }
                                        }
                                    );
                                    break;
                            }
                        } else {
                            $('#cvv').focus();
                            $rootScope.dadosInvalidosCC('Cód. de segurança inválido');
                        }
                    } else {
                        $('#expirationMonthYear').focus();
                        $rootScope.dadosInvalidosCC('Validade inválido');
                    }
                    break;
                default:
                    $rootScope.dadosInvalidosCC();
                    break;
            }
        } else
            $rootScope.dadosInvalidosCC();
    };
});

app.controller('VoucherLst', function($rootScope, $scope, $route, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Cupons de desconto";
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
    $rootScope.Titulo = "Compras";
    $scope.LST = ReturnData.LST;
    $rootScope.NO_WHATSAPP = true;

    $scope.click = function(reg) {
        $rootScope.location('#!/historico-transacoes/' + reg.ID);
    };
});


app.controller('EstornoItensPedidoGet', function ($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Estorno";
    $rootScope.NO_WHATSAPP = false;
    $rootScope.VALOR_TOTAL_ESTORNO = 0;
    $rootScope.PEDIDO = ReturnData.PEDIDO;

    $scope.calcularKG = function(produto) {
        if(produto.UNIDADE_MEDIDA === 'KG') {
            if(produto.ITEMESTORNO === true) {
                produto.QTDE_ESTORNO = produto.QTDE;
                produto.VALOR_ESTORNO = produto.UNITARIO;
                $rootScope.VALOR_TOTAL_ESTORNO += produto.UNITARIO;
            }else{
                produto.QTDE_ESTORNO = 0;
                produto.VALOR_ESTORNO = 0;
                $rootScope.VALOR_TOTAL_ESTORNO -= produto.UNITARIO;
            }
        }else{
            if(produto.ITEMESTORNO === false) {
                $rootScope.VALOR_TOTAL_ESTORNO -= (produto.UNITARIO * produto.QTDE_ESTORNO);
                produto.QTDE_ESTORNO = 0;
                produto.VALOR_ESTORNO = 0;
            }
        }
    };

    $scope.addQtdeProduto = function (produto) {
        if(produto.QTDE_ESTORNO < produto.QTDE) {
            produto.QTDE_ESTORNO = parseInt(produto.QTDE_ESTORNO) + 1;
            produto.VALOR_ESTORNO = produto.UNITARIO * produto.QTDE_ESTORNO;
            $rootScope.VALOR_TOTAL_ESTORNO += produto.UNITARIO * produto.QTDE_ESTORNO;
        }
    };

    $scope.removeQtdeProduto = function (produto) {
        if(produto.QTDE_ESTORNO > 0) {
            $rootScope.VALOR_TOTAL_ESTORNO -= (produto.UNITARIO * produto.QTDE_ESTORNO);
            produto.QTDE_ESTORNO = parseInt(produto.QTDE_ESTORNO) - 1;
            produto.VALOR_ESTORNO = produto.UNITARIO * produto.QTDE_ESTORNO;
        }
    };

    $scope.solicitarEstorno = function (pedido) {
        $scope.data = pedido.PRODUTOS.filter(function (item) {
            return item.ITEMESTORNO === true;
        });

        if($scope.data.length) {
            pedido.NENHUM = false;

            var validador = $scope.validarDados(pedido.MOTIVO, $scope.data);

            pedido.PRODUTOS.map(function (produto)
            {
                produto.ERRO_QTD_ESTORNO = !!validador.PRODUTOS.find(element => element === produto.PRODUTOID);
            });

            pedido.MOTIVO_NULO = validador.MOTIVO === true;

            if(validador.MOTIVO !== true && validador.PRODUTOS.length <= 0) {
                try {
                    navigator.notification.confirm('',
                        function (buttonIndex) {
                            if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1)) {
                                $scope.enviarSolicitacaoEstorno(pedido);
                            }
                        },
                        'Realmente deseja fazer esta solicitação de estorno?',
                        Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
                    );
                } catch (e) {
                    if (confirm('Realmente deseja fazer esta solicitação de estorno?')) {
                        $scope.enviarSolicitacaoEstorno(pedido);
                    }
                }
            }else{
                $('.scrollable').animate({scrollTop: 0}, 1000);
            }
        }else{
            pedido.PRODUTOS.map(function (produto) {
                produto.ERRO_QTD_ESTORNO = false;
            });

            pedido.NENHUM = true;

            $('.scrollable').animate({scrollTop: 0}, 1000);
        }
    };

    $scope.validarDados = function (motivo, produtosParaEstorno) {
        var errors, erroMotivo = false, errorsProduto = [];

        produtosParaEstorno.map(function (value) {
            if(value.UNIDADE_MEDIDA === 'KG') value.QTDE_ESTORNO = value.QTDE;
            if(value.QTDE_ESTORNO <= 0 && value.UNIDADE_MEDIDA !== 'KG') errorsProduto.push(value.PRODUTOID);
        });

        if(motivo === undefined || motivo.length <= 3) erroMotivo = true;

        errors = {"MOTIVO" : erroMotivo, "PRODUTOS" : errorsProduto};

        return errors;
    };

    $scope.enviarSolicitacaoEstorno = function (pedido) {
        Factory.ajax({
                action: 'estorno/solicitarestorno',
                data: {
                    'PEDIDO' : {
                        'ID'        : pedido.ID,
                        'DATAHORA'  : pedido.DATAHORA,
                        'MOTIVO'    : pedido.MOTIVO,
                        'PRODUTOS'  : JSON.stringify($scope.data)
                    }
                }
            },
            function (data) {
                if (data.status === 0){
                    $rootScope.PEDIDO.ERROESTORNO = true;
                    $rootScope.PEDIDO = '';

                }else if (data.status === 1){
                    window.history.go(-1);

                }else if(data.status === 2){
                    $rootScope.PEDIDO = data.PEDIDO;

                }
            }
        );
    }
});

app.controller('NotificacoesLst', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Notificações";
    $scope.LST = ReturnData.LST;

    $scope.click = function(reg) {
        $rootScope.location('#!/notificacoes/' + reg.ID);
    };
});

app.controller('NotificacoesGet', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = 'Notificação';
    $scope.REG = ReturnData;

    $scope.click = function(data) {
        switch (data.TYPE) {
            case 'BP': // Busca de produtos
                Factory.$rootScope.STEP = 1;
                Factory.$rootScope.TIPO_PG = 'COMPRAR';
                Factory.$rootScope.Layers('produtos-busca');
                Factory.$rootScope.PESQUISA = data.URL;
                break;
            case 'L': // Layers
                switch (data.URL) {
                    case '[MINHA_CARTEIRA]':
                        Factory.$rootScope.Layers('feed-minha-carteira');
                        break;
                    default:
                        if (data.URL.indexOf('[PESQUISA#') != -1) {
                            Factory.$rootScope.Layers(
                                'pesquisa-satisfacao-form',
                                {
                                    ID: parseInt(data.URL.split('#')[1].replace(']', ''))
                                }
                            );
                        }
                        break;
                }
                break;
            case 'C': // Categorias
                Factory.$rootScope.location('#!/');
                setTimeout(function () {
                    Factory.$rootScope.clickItem('index');
                    Factory.$rootScope.getCompras({ID: parseInt(data.URL)});
                }, 2000);
                break;
            case 'P': // Produto
                Factory.$rootScope.getProduto(data.URL);
                break;
            case 'LI':
            case 'LE':
                if (data.URL)
                    Factory.$rootScope.location(data.URL, 1, 1);
                break;
            case 'redirect':
                if (data.URL)
                    Factory.$rootScope.location(data.URL, 0, 1);
                break;
            default:
                if (data.ID)
                    Factory.$rootScope.location('#!/notificacoes/' + data.ID);
                break;
        }
    };
});

documento_cadastro_novo = null;
function documentoCadastroNovo(){
    $('#documentoCadastro').change(function(){
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
                    documento_cadastro_novo = file;
                    var oFReader = new FileReader();
                    oFReader.readAsDataURL(file);
                    oFReader.onload = function (oFREvent) {
                        document.getElementById('documentoCadastroImg').src = oFREvent.target.result;
                        $('#documentoCadastroImg').show();
                    };
                }, 1000);
            }
        }
    });
}

foto_cadastro_novo = null;
function fotoCadastroNovo(){
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
                    foto_cadastro_novo = file;
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

function fotoCadastroAtualizar(){
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