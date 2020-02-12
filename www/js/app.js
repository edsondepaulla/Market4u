app.config(function($routeProvider, $mdThemingProvider, $mdDateLocaleProvider, $httpProvider, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(geo):/);
    $mdThemingProvider.generateThemesOnDemand(true);
    $httpProvider.defaults.withCredentials = true;

    /*
     * Route
     */
    $routeProvider
        .when("/", {
            templateUrl: "view/index/index.html",
            controller: 'Index'
        })
        .when("/index/:STEP", {
            templateUrl: "view/index/index.html",
            controller: 'Index'
        })
        .when("/conecte-se", {
            templateUrl: "view/conecte-se/conecte-se.html",
            controller: 'ConecteSe',
            resolve: {
                ReturnData: function ($route) {
                    return Login.get('#!/cadastro');
                }
            }
        })
        .when("/cadastro", {
            templateUrl: "view/conecte-se/form.html",
            controller: 'Cadastro',
            resolve: {
                ReturnData: function ($route, $rootScope) {
                    return parseInt($rootScope.usuario.ID) || !$rootScope.usuario.NOVO ? Login.get() : null;
                }
            }
        })
        .when("/conecte-se-codigo", {
            templateUrl: "view/conecte-se/codigo.html",
            controller: 'ConecteSeCodigo'
        })
        .when("/card", {
            templateUrl: "view/conecte-se/card.html",
            controller: 'Card',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/card'
                        }
                    );
                }
            }
        })
        .when("/add-card", {
            templateUrl: "view/conecte-se/addcard.html",
            controller: 'AddCard'
        })
        .when("/minha-carteira", {
            templateUrl: "view/conecte-se/carteira.html",
            controller: 'MinhaCarteira',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/minhacarteira'
                        }
                    );
                }
            }
        })
        .when("/voucher", {
            templateUrl: "view/conecte-se/voucher.html",
            controller: 'VoucherLst',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/voucher'
                        }
                    );
                }
            }
        })
        .when("/atualizar-app", {
            templateUrl: "view/pages/atualizar-app.html",
            controller: 'AtualizarApp',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'options/atualizarapp'
                        }
                    );

                    if (Page.active) {
                        return Factory.ajax(
                            {
                                action: 'options/atualizarapp'
                            }
                        );
                    } else
                        window.history.go(-1);
                }
            }
        })
        .when("/token/:TOKEN", {
            templateUrl: "view/pages/token.html",
            controller: 'Token',
            resolve: {
                ReturnData: function ($route, $rootScope) {
                    return Factory.ajax(
                        {
                            action: 'options/token',
                            data: {
                                TOKEN: $route.current.params.TOKEN
                            }
                        }, function (data) {
                            switch ($route.current.params.TOKEN) {
                                case 'checkoutteste':
                                    $rootScope.transacaoId = parseInt(data.TRANSACAO_ID);
                                    $rootScope.location(data.url);
                                    break;
                            }
                        }
                    );
                }
            }
        })
        .when("/voucher/:ID", {
            templateUrl: "view/conecte-se/voucher-detalhes.html",
            controller: 'VoucherGet',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/voucher',
                            data: {
                                ID: $route.current.params.ID
                            }
                        }
                    );
                }
            }
        })
        .when("/historico-transacoes", {
            templateUrl: "view/conecte-se/historico-transacoes.html",
            controller: 'HistoricoTransacoesLst',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/historicotransacoes'
                        }
                    );
                }
            }
        })
        .when("/suporte", {
            templateUrl: "view/pages/suporte.html",
            controller: 'Suporte'
        })
        .when("/faq", {
            templateUrl: "view/pages/faq.html",
            controller: 'Faq',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'options/faq'
                        }
                    );
                }
            }
        })
        .when("/command/:TYPE/:KEY/:SET", {
            templateUrl: "view/pages/command.html",
            controller: 'Command',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'options/command',
                            data: $route.current.params
                        }
                    );
                }
            }
        })
        .when("/historico-transacoes/:ID", {
            templateUrl: "view/conecte-se/historico-transacoes-detalhes.html",
            controller: 'HistoricoTransacoesGet',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'cadastro/historicotransacoes',
                            data: {
                                ID: $route.current.params.ID
                            }
                        }
                    );
                }
            }
        })
        .when("/maquinas", {
            templateUrl: "view/maquinas/lst.html",
            controller: 'MaquinasLst',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'maquinas/lst'
                        }
                    );
                }
            }
        })
        .when("/maquinas-filtros", {
            templateUrl: "view/maquinas/filtros.html",
            controller: 'MaquinasFiltros'
        })
        .when("/maquinas/:ID", {
            templateUrl: "view/maquinas/get.html",
            controller: 'MaquinasGet',
                resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'maquinas/get',
                            data: {
                                ID: $route.current.params.ID
                            }
                        }
                    );
                }
            }
        })
        .when("/produtos/:MAQUINA/:JSON", {
            templateUrl: "view/produtos/get.html",
            controller: 'ProdutosGet',
            resolve: {
                ReturnData: function ($route) {
                    return Factory.ajax(
                        {
                            action: 'produtos/get',
                            data: {
                                MAQUINA: $route.current.params.MAQUINA,
                                JSON: $route.current.params.JSON
                            }
                        }
                    );
                }
            }
        })
        .when("/ajuda", {
            templateUrl: "view/ajuda/index.html",
            controller: 'Ajuda'
        })
        .when("/sem-internet", {
            templateUrl: "view/sem-internet/index.html",
            controller: 'SemInternet'
        });
});

app.controller('SemInternet', function($rootScope, $scope, $routeParams) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Ops...";
});

app.controller('Command', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = ReturnData.TITULO;
    $scope.PARAMS = $routeParams;
    $scope.REG = ReturnData;
    $rootScope.REDIRECT = '';

    switch ($routeParams.TYPE) {
        case 'arduino':
            if ($routeParams.SET == 'BEB_ALC') {
                var seTime = ReturnData.TIME;
                $scope.TIME = '00:' + (seTime < 10 ? '0' : '') + seTime;
                $scope.PERCENTUAL = Math.ceil(100 / seTime);
                var time = seTime;
                var percentual = 0;
                Factory.timeout = setInterval(function () {
                    time--;
                    percentual += Math.ceil(100 / seTime);
                    if (time <= 0 || percentual >= 100)
                        percentual = 100;
                    $scope.$apply(function () {
                        $scope.TIME = '00:' + (time < 10 ? '0' : '') + time;
                        $scope.PERCENTUAL = percentual;
                        if (percentual == 100)
                            $scope.REG.TEXTO = $scope.REG.TEXTO1;
                    });
                    $rootScope.KEY_ARDUINO = $routeParams.KEY;
                    if (time <= 0) {
                        $rootScope.fecharPortaBebidasAlcoolicas();
                        clearInterval(Factory.timeout);
                    }
                }, seTime ? 1000 : 0);
            }
            break;
    }
});

app.controller('Faq', function($rootScope, $scope, $routeParams, ReturnData) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "FAQ";
    $scope.CONTENT = ReturnData.CONTENT;
    $scope.LST = ReturnData.LST;
    $rootScope.REDIRECT = '';
});

app.controller('Token', function($rootScope) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Token";
    $rootScope.REDIRECT = '';
});

app.controller('Suporte', function($rootScope) {
    $rootScope.border_top = 1;
    $rootScope.Titulo = "Suporte";
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
});

app.controller('AtualizarApp', function($rootScope, $scope, ReturnData) {
    $rootScope.BARRA_SALDO = false;
    $rootScope.NO_WHATSAPP = false;
    $rootScope.Titulo = "Nova versão";
    $rootScope.REDIRECT = '';
    $scope.REG = ReturnData;
});

app.controller('Main', function($rootScope, $scope, $http, $routeParams, $route, $mdSelect, $animate, $sce, deviceDetector) {
    $rootScope.usuario = Login.getData();
    navigator.geolocation;
    Factory.prepare();

    $rootScope.device = deviceDetector.os;

    $rootScope.versao_app_mobile = config.versao_app_mobile;
    $rootScope.REDIRECT = '';
    Factory.$http = $http;
    Factory.$rootScope = $rootScope;

    // Get login
    Login.get();

    $rootScope.QRCODE = 0;
    $rootScope.location = function (url, external, active) {
        QRScannerConf.destroy();
        if (active)
            Page.start();
        if (parseInt(external)) {
            $rootScope.swipeLeft();
            try {
                cordova.InAppBrowser.open(url, '_self');
            } catch (e) {
                window.open(url, '_system');
            }
        } else {
            switch (url) {
                case '#!/minha-carteira':
                case '#!/cadastro':
                    if ((!parseInt(Login.getData().ID) && !Page.active)) {
                        $rootScope.REDIRECT = btoa(url);
                        url = '#!/conecte-se';
                    } else if (url == '#!/minha-carteira' && parseInt(Login.getData().ID) && !parseInt(Login.getData().DADOS_ATUALIZADO)) {
                        $rootScope.REDIRECT = btoa(url);
                        url = '#!/cadastro';
                    }
                    break;
            }

            if (url.indexOf('#!/payment') !== -1
                || url.indexOf('#!/conecte-se') !== -1
                || url.indexOf('#!/conecte-se-codigo') !== -1)
                Page.start();

            window.location = url;
            if (url != '#!/conecte-se')
                $route.reload();
        }
    };

    $rootScope.NO_WHATSAPP = true;
    $rootScope.BARRA_SALDO = true;
    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.BARRA_SALDO = true;
        $rootScope.menuClose();
    });

    $rootScope.KEY_ARDUINO = null;
    $rootScope.fecharPortaBebidasAlcoolicas = function () {
        Factory.ajax(
            {
                action: 'options/arduino',
                data: {
                    KEY: $rootScope.KEY_ARDUINO,
                    TYPE: 'BEB_ALC',
                    V: 'FECHAR'
                }
            },function(){
                $rootScope.KEY_ARDUINO = null;
            }
        );
    };

    $rootScope.controller = 'Maps';
    $rootScope.$on('$routeChangeSuccess', function () {
        switch ($route.current.controller) {
            case 'ConecteSe':
            case 'Cadastro':
            case 'Suporte':
            case 'SemInternet':
            case 'AtualizarApp':
            case 'Faq':
            case 'Token':
            case 'ConecteSeCodigo':
                break;
            default:
                clearTimeout(Factory.timeout);
                Factory.timeout = setTimeout(function () {
                    if (parseInt(Login.getData().ID)) {
                        if (!parseInt(Login.getData().DADOS_ATUALIZADO))
                            $rootScope.location('#!/cadastro');
                    } else
                        $rootScope.location('#!/conecte-se');
                }, 1000);
                break;
        }
        $rootScope.NO_WHATSAPP = true;
        $rootScope.border_top = 0;
        $rootScope.controller = $route.current.controller;
        $rootScope.toolbar = true;
        if ($rootScope.controller != 'Index' || (parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1) == 1)
            Payment.clear(1);
        if ($rootScope.KEY_ARDUINO)
            $rootScope.fecharPortaBebidasAlcoolicas();
    });

    $rootScope.trustAsHtml = function (string) {
        return $sce.trustAsHtml(string);
    };

    $rootScope.AppBrowser = function (open_browser) {
        if (open_browser.url)
            Factory.AppBrowser(open_browser.url, open_browser);
    };

    $rootScope.TEXT_WHATSAPP = '';
    $rootScope.whatsapp = function () {
        if ($rootScope.usuario.WHATSAPP.ATIVO) {
            Factory.AppBrowser(
                $rootScope.usuario.WHATSAPP.url + $rootScope.TEXT_WHATSAPP,
                $rootScope.usuario.WHATSAPP
            );
        }
    };

    $rootScope.backpageTop = function () {
        if ($rootScope.controller == 'Cadastro') {
            var level = parseInt($('#formCadastro.form #passo-a-passo > li.active').attr('level'));
            if(level) {
                $rootScope.btnLevel(level - 1);
                return;
            }
        }
        if ($rootScope.QRCODE)
            $rootScope.location('#!/');
        else {
            $('.scrollable:first').attr('backpage', 1);
            window.history.go(-1);
        }
    };

    $rootScope.logout = function () {
        Login.logout();
        $rootScope.location('#!/conecte-se');
    };

    $rootScope.swipeLeft = function () {
        $rootScope.menuClose();
    };

    $rootScope.swipeRight = function () {
        if (!$('[ng-controller="Modal"]').is(':visible'))
            $rootScope.menuOpen();
    };

    // Menu
    $rootScope.MenuLeft = [
        {
            titulo: 'Início',
            url: '#!/',
            icon: 'mdi-action-home',
            logado: 1
        },
        /*{
            titulo: 'Condomínios',
            url: '#!/maquinas',
            icon: 'mdi-social-domain',
            logado: 1
        },*/
        {
            titulo: 'Vouchers',
            url: '#!/voucher',
            icon: 'mdi-action-loyalty',
            logado: 0
        },
        {
            titulo: 'Minha carteira',
            url: '#!/minha-carteira',
            icon: 'mdi-editor-attach-money',
            logado: 0
        },
        {
            titulo: 'Meus cartões',
            url: '#!/card',
            icon: 'mdi-action-credit-card',
            logado: 0
        },
        {
            titulo: 'Histórico de transações',
            url: '#!/historico-transacoes',
            icon: 'mdi-action-history',
            logado: 0
        },
        {
            titulo: 'Suporte',
            url: '#!/suporte',
            icon: 'mdi-communication-live-help',
            logado: 1
        }
    ];

    var menuClose_time = null;
    $rootScope.menuOpen = function () {
        clearTimeout(menuClose_time);
        $('#fundo_transparente').css('display', 'block');
        setTimeout(function () {
            $('#fundo_transparente').css('opacity', '0.5').css('display', 'block');
        }, 1);
        $('.Menuleft').css('left', '0%');
        $('body').attr('menu_left', 1);
    };
    $rootScope.menuClose = function () {
        $('.Menuleft').css('left', '-70%');
        $('#fundo_transparente').css('opacity', '0');
        menuClose_time = setTimeout(function () {
            $('#fundo_transparente').hide();
        }, 1000);
        $('body').removeAttr('menu_left');
    };

    /*
     * Payment
     */
    $rootScope.dadosInvalidosCC = function () {
        Factory.alert('Dados de cartão de créditos inválidos!');
    };
    $rootScope.pagseguro = function (paymentPagSeguro, origem, time) {
        time = time ? time : 0;
        if (!$('#api_pagseguro').length) {
            time = 3000;
            $('body').append('<script id="api_pagseguro" src="https://stc.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js"></script>');
        }
        $(document).ready(function () {
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                $rootScope.PAGSEGURO_SESSIONID = null;
                try {
                    Factory.ajax(
                        {
                            action: 'payment/pagseguro'
                        },
                        function (data) {
                            if (data.SESSIONID) {
                                $rootScope.PAGSEGURO_SESSIONID = data.SESSIONID;
                                PagSeguroDirectPayment.setSessionId($rootScope.PAGSEGURO_SESSIONID);
                                if (parseInt(paymentPagSeguro))
                                    $rootScope.paymentPagSeguro(origem);

                                PagSeguroDirectPayment.getPaymentMethods({
                                    success: function (data) {
                                        if (data.paymentMethods) {
                                            var seq = 0;
                                            $rootScope.BANDEIRAS = {};
                                            $.each(data.paymentMethods.CREDIT_CARD.options, function (idx, item) {
                                                $rootScope.BANDEIRAS[seq] = 'img/bandeira_cc/' + item.name.toLowerCase() + '.png';
                                                seq++;
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    );
                } catch (e) {

                }
            }, time);
        });
    };
    var verifyLimitFormasPg = null;
    $rootScope.verifyLimitFormasPg = function () {
        if ($rootScope.transacaoId) {
            clearTimeout(verifyLimitFormasPg);
            verifyLimitFormasPg = setTimeout(function () {
                Factory.ajax(
                    {
                        action: 'payment/confirm',
                        data: {
                            VERIFICA_LIMITE_FORMAS_PG: 1,
                            UTILIZADO_SALDO: $rootScope.ACTIVE_SALDO ? 1 : 0,
                            VOUCHER: $rootScope.VOUCHER || 0,
                            TRANSACAO_ID: $rootScope.transacaoId
                        }
                    },
                    function (data) {
                        $rootScope.VALOR_PG = parseFloat(data.VALOR_PG || 0);
                        $rootScope.VALOR_PG_FORMAT = data.VALOR_PG_FORMAT;
                        $rootScope.VALOR_CASHBACK = data.VALOR_CASHBACK;
                        $rootScope.CASHBACK_TEXTO = data.CASHBACK_TEXTO;
                        $rootScope.TOTAL_DE = data.TOTAL_DE;
                        $rootScope.TOTAL_POR = data.TOTAL_POR;
                        $rootScope.TOTAL_DESCONTO = data.TOTAL_DESCONTO;
                        $rootScope.PRODUTOS = data.PRODUTOS;
                    }
                );
            }, 50);
        }
    };
    $rootScope.selectFormaPg = function (PG) {
        if (PG.ACTIVE) {
            if (!$('#boxCC:hover').length) {
                PG.ACTIVE = 0;
                $rootScope.FORMA_PAGAMENTO = null;
                $rootScope.CARD = null;
            }
        } else {
            if (PG.TIPO != 'SALDO' && PG.TIPO != 'VOUCHER') {
                $.each($rootScope.FORMAS_PG, function (idx, item_each) {
                    item_each.ACTIVE = 0;
                });
                if (PG.TIPO == 'CC') {
                    if (PG.LST) {
                        $.each(PG.LST, function (idx_cc, item_each_cc) {
                            if (item_each_cc.ACTIVE)
                                $rootScope.CARD = item_each_cc.VALS;
                        });
                    }
                }
                PG.ACTIVE = 1;
                $rootScope.FORMA_PAGAMENTO = PG;
                setTimeout(function () {
                    $('#cardNumber').focus().blur();
                }, 100);
            }
        }
        if (PG.TIPO == 'SALDO' && $('label:hover').length) {
            $rootScope.VALOR_PG_FORMAT = '--';
            $rootScope.ACTIVE_SALDO = PG.ACTIVE_SALDO ? 0 : 1;
            PG.ACTIVE_SALDO = $rootScope.ACTIVE_SALDO;
            $rootScope.verifyLimitFormasPg();
        }
    };
    $rootScope.paymentPagSeguro = function (origem) {
        if (parseInt($rootScope.FORMA_PAGAMENTO.CC)) {
            PagSeguroDirectPayment.getBrand({
                cardBin: $rootScope.FORMA_PAGAMENTO.cardNumber.toString().replace(/ /g, '').substring(0, 6),
                success: function (bandeira) {
                    var expirationMonthYear = $rootScope.FORMA_PAGAMENTO.expirationMonthYear.toString().split('/');
                    var data = {
                        cardNumber: $rootScope.FORMA_PAGAMENTO.cardNumber.toString().replace(/ /g, ''),
                        brand: bandeira.brand.name,
                        cvv: $rootScope.FORMA_PAGAMENTO.cvv.toString(),
                        expirationMonth: expirationMonthYear[0],
                        expirationYear: '20' + expirationMonthYear[1],
                        success: function (data) {
                            if (data.card.token) {
                                $rootScope.processPayment(
                                    origem,
                                    {
                                        PAGSEGURO_HASH: PagSeguroDirectPayment.getSenderHash(),
                                        PAGSEGURO_TOKEN: data.card.token
                                    }
                                );
                            } else
                                $rootScope.dadosInvalidosCC();
                        },
                        error: function (error) {
                            $rootScope.dadosInvalidosCC();
                        }
                    };
                    PagSeguroDirectPayment.createCardToken(data);
                },
                error: function (error) {
                    $rootScope.dadosInvalidosCC();
                }
            });
        } else {
            $rootScope.processPayment(
                origem,
                {
                    PAGSEGURO_HASH: PagSeguroDirectPayment.getSenderHash()
                }
            );
        }
    };
    var clearTimeoutProcessPayment = null;
    $rootScope.processPayment = function (origem, extra) {
        clearTimeout(clearTimeoutProcessPayment);
        clearTimeoutProcessPayment = setTimeout(function () {
            $('.btnConfirme').attr('disabled', true);
            switch (origem) {
                case 'saldo':
                    Factory.ajax(
                        {
                            action: 'cadastro/addsaldo',
                            data: {
                                FORMA_PAGAMENTO: $rootScope.FORMA_PAGAMENTO,
                                VALOR_PG: $rootScope.VALOR_PG,
                                EXTRA: extra
                            }
                        },
                        function () {
                            $('.btnConfirme').attr('disabled', false);
                        },
                        function () {
                            $('.btnConfirme').attr('disabled', false);
                        }
                    );
                    break;
                case 'compra':
                    Factory.ajax(
                        {
                            action: 'payment/confirm',
                            data: {
                                UTILIZADO_SALDO: $rootScope.ACTIVE_SALDO,
                                VOUCHER: $rootScope.VOUCHER || 0,
                                FORMA_PAGAMENTO: $rootScope.FORMA_PAGAMENTO,
                                TRANSACAO_ID: $rootScope.transacaoId,
                                EXTRA: extra
                            }
                        },
                        function (data) {
                            $('.btnConfirme').attr('disabled', false);

                            switch (parseInt(data.status)) {
                                case 1:
                                    $rootScope.verify();
                                    break;
                                case 2:

                                    break;
                                default:
                                    Payment.cancel();
                                    break;
                            }
                        },
                        function () {
                            $('.btnConfirme').attr('disabled', false);
                        }
                    );
                    break;
            }

        }, 100);
    };
    $rootScope.confirmPayment = function (origem) {
        var valido = false;
        if ($rootScope.FORMA_PAGAMENTO && $('#boxPg > ul > li.active').length) {
            $.each($rootScope.FORMAS_PG, function (idx, item_each) {
                if (parseInt(item_each.ACTIVE))
                    $rootScope.FORMA_PAGAMENTO = item_each;
            });
            if (parseInt($rootScope.FORMA_PAGAMENTO.CC)) {
                if ($rootScope.CARD) {
                    $rootScope.FORMA_PAGAMENTO.cardNumber = $rootScope.CARD[1];
                    $rootScope.FORMA_PAGAMENTO.expirationMonthYear = $rootScope.CARD[2];
                    $rootScope.FORMA_PAGAMENTO.cvv = $rootScope.CARD[3];
                    $rootScope.FORMA_PAGAMENTO.cardName = $rootScope.CARD[5];
                    valido = true;
                } else {
                    $rootScope.FORMA_PAGAMENTO.CC_BANDEIRA = $('#cardBandeira').val();
                    $rootScope.FORMA_PAGAMENTO.cvv = $('#cvv:visible').val();
                    if (!$rootScope.FORMA_PAGAMENTO.cardName)
                        $('#cardName:visible').focus();
                    else if (!$rootScope.FORMA_PAGAMENTO.cardNumber)
                        $('#cardNumber:visible').focus();
                    else if (!$rootScope.FORMA_PAGAMENTO.expirationMonthYear)
                        $('#expirationMonthYear:visible').focus();
                    else if (!$rootScope.FORMA_PAGAMENTO.cvv)
                        $('#cvv:visible').focus();
                    else
                        valido = true;
                }
            } else
                valido = true;
        } else if ($rootScope.VALOR_PG)
            Factory.alert('Selecione um meio de pagamento!');
        else {
            $rootScope.FORMA_PAGAMENTO = null;
            valido = true;
        }

        if (valido) {
            if ($rootScope.FORMA_PAGAMENTO) {
                if ($('#cvv:visible').val())
                    $rootScope.FORMA_PAGAMENTO.cvv = $('#cvv:visible').val();
                switch ($rootScope.FORMA_PAGAMENTO.GATEWAY) {
                    case 'PAGSEGURO':
                        if ($rootScope.PAGSEGURO_SESSIONID)
                            $rootScope.paymentPagSeguro(origem);
                        else
                            $rootScope.pagseguro(1, origem);
                        break;
                    default:
                        $rootScope.processPayment(origem);
                        break;
                }
            } else
                $rootScope.processPayment(origem);
        }
    };
    $rootScope.STEPS = [];
    $rootScope.transacaoId = 0;
    $scope.selectCard = function (ITENS, V) {
        if (!V.ACTIVE) {
            $rootScope.FORMA_PAGAMENTO.cardNumber = '';
            $rootScope.FORMA_PAGAMENTO.cardName = '';
            $rootScope.FORMA_PAGAMENTO.expirationMonthYear = '';
            $rootScope.FORMA_PAGAMENTO.cvv = '';
        }
        $.each(ITENS, function (idx, item_each) {
            item_each.ACTIVE = 0;
        });
        V.ACTIVE = 1;
        $rootScope.CARD = V.ID ? V.VALS : null;
    };

    $rootScope.clickQrcode = function (type) {
        $rootScope.TYPE_QRCODE = type;
        $rootScope.BTN_HOME = false;
        $rootScope.transacaoId = 0;
        QRScannerConf.show();
    };
});

app.directive('onErrorSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function () {
                attrs.$set('src', 'img/login_default.png');
            });
        }
    }
});

app.directive('selectSearch', function() {
    return {
        restrict: 'A',
        controllerAs: '$selectSearch',
        bindToController: {},
        controller: selectSearchController
    };
});

app.directive('label', function() {
    return function (scope, element, attrs) {
        element.bind("click", function (event) {
            if ($(this).attr('for'))
                $(this).find('input').focus();
        });
    };
});

var timeoutBlurInput = null;
app.directive('input', function() {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                $(this).blur();
                $(this).closest('form').find('.btn-salvar[type="submit"]').trigger('click');
            } else if ($(this).attr('id') == 'postalcode' || $(this).attr('id') == 'cpf' || $(this).attr('id') == 'senha')
                inputEvents(this, 'key');
        });
        element.bind("blur", function (event) {
            timeoutBlurInput = setTimeout(function(){
                $('.scrollable-content').css('padding-bottom', 0);
            }, 2000);
            inputEvents(this, 'blur');
        });
        element.bind("focus", function (event) {
            if(Factory.$rootScope.device == 'ios') {
                clearTimeout(timeoutBlurInput);
                var position = $('.scrollable-content').position();
                if (position) $('.scrollable-content').css('padding-bottom', position.top + 320);
            }
        });
    };
});

app.directive('select', function() {
    return function (scope, element, attrs) {
        element.bind("blur", function (event) {
            $('.scrollable-content').css('padding-bottom', 0);
        });
        element.bind("focus", function (event) {
            if(Factory.$rootScope.device == 'ios') {
                clearTimeout(timeoutBlurInput);
                var position = $('.scrollable-content').position();
                if (position) $('.scrollable-content').css('padding-bottom', position.top + 320);
            }
        });
    };
});

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
                            }
                            $('#boxEnderecoCompleto').show();
                        },
                        beforeSend: function () {
                            $('#carregando').show();
                        },
                        complete: function () {
                            $('#carregando').hide();
                        },
                        error: function () {
                            $('#carregando').hide();
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
            case 'cpf':
                if (!validaCpf(_value.substring(0, 14)) && _value.length) {
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
                            _this.attr('value-old', _value);
                            if (data.NOME) {
                                $('#nome_completo').val(data.NOME);
                                Factory.$rootScope.usuario.NOME = data.NOME;
                            }
                            if (data.MAE) {
                                $('#nome_mae').val(data.MAE);
                                Factory.$rootScope.usuario.MAE = data.MAE;
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
                    );
                }
                break;
            case 'expirationMonthYear':
                var length = _value.length;
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
                if (_value.length < 14 && _value.length)
                    _invalid = 1;
                break;
            case 'cardNumber':
                _value = _value.replace(/ /g, '');
                if (_value.length >= 6) {
                    if (Factory.$rootScope.PAGSEGURO_SESSIONID) {
                        PagSeguroDirectPayment.getBrand({
                            cardBin: _value.substring(0, 6),
                            success: function (data) {
                                if (data.brand.name) {
                                    _invalid = 0;
                                    $('#cardBandeira').val(data.brand.name);
                                    $('#imgBandeira').show().attr('src', 'img/bandeira_cc/' + data.brand.name + '.png');
                                } else {
                                    $('#cardBandeira').val('');
                                    $('#imgBandeira').hide();
                                    _invalid = 1;
                                }
                                verifyMsg(_verify, _invalid, _this);
                            },
                            error: function () {
                                verifyMsg(_verify, 1, _this);
                            }
                        });
                    }
                } else {
                    $('#cardBandeira').val('');
                    $('#imgBandeira').hide();
                    _invalid = 0;
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
    }, _bind == 'blur' ? 0 : 500);
}

function verifyMsg(_verify, _invalid, _this, type) {
    if (_verify) {
        if (_invalid)
            _this.addClass('ng-invalid' + (type == 2 ? '2' : ''));
        else
            _this.removeClass('ng-invalid' + (type == 2 ? '2' : ''));

        _this.closest('form').attr('invalid', _this.closest('form').find('input.ng-invalid').length ? 1 : 0);
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
    ]
    for (var i = 0; i < specialChars.length; i++) {
        regex = new RegExp("["+specialChars[i].let+"]", "g");
        returnString = returnString.replace(regex, specialChars[i].val);
        regex = null;
    }

    var sourceString = returnString.replace(/\s/g,$spaceSymbol);

    return sourceString.replace(/[` ´~!@#$%^&*()|_+\-=?;:¨'",.<>\{\}\[\]\\\/]/gi, '');
};

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

var mask = function(element, mask, length) {
    try {
        function inputHandler(masks, max, event) {
            var c = event.target;
            var v = c.value.replace(/\D/g, '');
            var m = c.value.length > max ? 1 : 0;
            VMasker(c).unMask();
            VMasker(c).maskPattern(masks[m]);
            c.value = VMasker.toPattern(v, masks[m]);
        }

        var element = document.querySelector(element);
        VMasker(element).maskPattern(mask[0]);
        if (mask[1])
            element.addEventListener('input', inputHandler.bind(undefined, mask, length), false);
    } catch (e) {

    }
};