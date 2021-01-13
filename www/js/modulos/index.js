var Payment = {
    DESTRAVAR: 0,
    ATUALIZAR: true,
    QTDE_PRODUTOS: [],
    PRODUTOS_COMPRAS: [],
    CARRINHO_COMPRAS: [],
    timeoutBanner: [],
    clear: function (cancelar, status) {
        if (parseInt(Factory.$rootScope.transacaoId)) {
            // Cancelar transacao
            if (parseInt(cancelar))
                Payment.cancel();

            // Id
            var id_transacao = parseInt(Factory.$rootScope.transacaoId);
            Factory.$rootScope.VOUCHER = 0;
            Factory.$rootScope.transacaoId = 0;
            Factory.$rootScope.transacaoIdCarrinho = false;

            // Redirect
            if (!parseInt(cancelar) && status == 'success') {
                Payment.ATUALIZAR = true;
                Factory.$rootScope.location('#!/');
                if (id_transacao) {
                    setTimeout(function () {
                        Factory.$rootScope.Layers('historico-transacoes-detalhes', id_transacao);
                    }, 3000);
                }
            }
        }
    },
    cancel: function () {
        if (Factory.$rootScope.transacaoId && !Factory.$rootScope.transacaoIdCarrinho) {
            Factory.ajax(
                {
                    action: 'payment/cancel',
                    data: {
                        TRANSACAO_ID: Factory.$rootScope.transacaoId
                    }
                }
            );
        }
    }
};

app.controller('ValidarCC', function($scope, $rootScope) {
    //$scope.VALS = Layers.VALS;
    $scope.TITULO_LAYERS = 'Verificar cartão';
    $scope.ID_LOG = 0;
    $scope.ULTIMOS_DIGITOS = Layers.VALS.cardNumber.toString().replace(/ /g, '').substr(-4, 4);

    $scope.VERIFICAR = false;
    $scope.iniciarVerificacao = function () {
        Factory.ajax(
            {
                action: 'cadastro/iniciarverificacaocc',
                data: {
                    FORMA_PAGAMENTO: Layers.VALS
                }
            },
            function (data) {
                $('[ng-controller="ValidarCC"] button').attr('disabled', false);
                if (parseInt(data.status) == 1) {
                    $scope.ID_LOG = parseInt(data.ID_LOG);
                    $scope.VERIFICAR = true;
                }
            },
            function () {
                $('[ng-controller="ValidarCC"] button').attr('disabled', false);
            }
        );
    };

    $scope.LIMITE_TENTATIVAS = 0;
    $scope.verificar = function () {
        if($('#cod_verificar_cc').val().length) {
            $scope.LIMITE_TENTATIVAS++;
            if ($scope.LIMITE_TENTATIVAS <= 5) {
                Factory.ajax(
                    {
                        action: 'cadastro/verificarcc',
                        data: {
                            ID_LOG: parseInt($scope.ID_LOG),
                            VALOR: $('#cod_verificar_cc').val()
                        }
                    },
                    function (data) {
                        $('[ng-controller="ValidarCC"] button').attr('disabled', false);
                        if (parseInt(data.status) == 1) {
                            Factory.nao_confirmar_pg = true;
                            $rootScope.confirmPayment('saldo');
                            Layers.back($('[router="verificar-cc"]'));
                        }
                    },
                    function () {
                        $('[ng-controller="ValidarCC"] button').attr('disabled', false);
                    }
                );
            } else {
                Factory.alert('Número de tentativas excedido!');
                Layers.back($('[router="verificar-cc"]'));
            }
        }else
            $('#cod_verificar_cc').focus();
    };
});

app.controller('ProdutoDetalhes', function($scope, $rootScope) {
    $scope.VALS = Layers.VALS;
    $scope.TITULO_LAYERS = $scope.VALS.NOME;
    $(()=>{
        $rootScope.initList(['produto_detalhes'], false, 70);
    })
});

app.controller('FormPesquisaSatisfacao', function($rootScope, $scope, $route){
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $rootScope.MenuBottom = true;

    /**
     * Inicia os scopes necessários para funcionar a controller.
     * */
    $scope.initController = function(){
        return  Factory.ajax(
            {
                action:'pesquisa/getpesquisa',
                data: {pesquisa_id: Layers.VALS.ID}
            },
            data => {
                if (parseInt(data.pesquisa.PESQUISA_ID)) {
                    $scope.pesquisa = data.pesquisa;
                    $scope.CLIENTE = data.Login;
                    $rootScope.TITULO_LAYERS = data.pesquisa.PESQUISA_TITULO;
                    $scope.initForm();
                    $scope.initInputsAnim();
                    $rootScope.initList(['fields_content'], false, 90);
                } else
                    Layers.back($('[router="pesquisa-satisfacao-form"]'));
            }
        );
    }();

    /**
     * Inicia os eventos após a criação do DOM do formulário.
     * */
    $scope.initInputsAnim = function (){
        $('.section_field_radio label').live('click',function(){
            let inputHiddenElement =  $(this).find('.input_hidden_changed_listen');
            if(!$(inputHiddenElement).is(':checked')) $(inputHiddenElement).prop('checked', true);
            $(inputHiddenElement).closest('.content_of_radios_pesquisa').find('.custom_checkbox_show').removeClass('custom_pesquisa_selected');
            if($(inputHiddenElement).is(':checked')) $(inputHiddenElement).parent().find('.custom_checkbox_show').addClass('custom_pesquisa_selected');
        });

        $('.content_single_checkbox label').click(function(e){
            e.preventDefault();
            let hidden_input_element = $(this).parent().find('input[type="checkbox"]');
            let custom_input_element = $(this).find('.custom_checkboxes_pesquisas');
            if($(hidden_input_element).is(':checked')){
                $(hidden_input_element).prop('checked', false);
                $(custom_input_element).removeClass('custom_checkboxes_pesquisas_selected');
            }else{
                $(hidden_input_element).prop('checked',true);
                $(custom_input_element).addClass('custom_checkboxes_pesquisas_selected');
            }
        });
        $('.input_text_content.area_of_field:not(.just_show_pesquisa)').click(function () {
            $(this).find('input').focus();
        });

    };

    /**
     * Responsável por criar os inputs do form de acordo com o que vem do banco.
     * */

    $scope.initForm = function(){
        let formElement = $('.form_selected_content').find('form');
        let formHTML='';
        if(Object.values($scope.pesquisa).length){
            let perguntas_arr = Object.values($scope.pesquisa.PERGUNTAS);
            perguntas_arr[0].PERGUNTA_RESPOSTA && $('.content_save_buttons_pesquisa').css('display','none');
            perguntas_arr.forEach((pergunta, key) =>{
                switch (pergunta.PERGUNTA_TIPO) {
                    case'1':
                        formHTML +=`
                    <div class="area_of_field input_radio_content">
                        <div class="title_of_radio_pesquisa ">
                            <span>${key + 1} - ${pergunta.PERGUNTA_TITULO}: ${pergunta.PERGUNTA_OBRIGATORIO === '1' ? '*' :''}</span>
                        </div>
                        <div class="content_of_radios_pesquisa ${pergunta.OPCOES.OPCOES_LABEL == null ? 'content_of_radios_lines_pesquisa' : ''} ${pergunta.PERGUNTA_RESPOSTA || pergunta.PESQUISA_RESP ? 'just_show_pesquisa': ''}">
                            <div class="left_text_lines_radio_pesquisa values_of_lines_radio_pesquisa">
                                <span>${pergunta.OPCOES.OPCOES_TEXTO_ESQUERDO || null}</span>
                            </div>`;

                        for (let i = 0; i < parseInt(pergunta.OPCOES.OPCOES_QTDE); i++){
                            let textValue = pergunta.OPCOES.OPCOES_LABEL != null ? pergunta.OPCOES.OPCOES_LABEL.split('//')[i] : '';
                            formHTML +=`<div class="section_field_radio">
                                <label class="label_toclick_pesquisa">
                                    <div class="custom_checkbox_show ${pergunta.PERGUNTA_RESPOSTA && pergunta.PERGUNTA_RESPOSTA == (i + 1)?'custom_pesquisa_selected' : ''}"></div>
                                    <span>${textValue}</span>
                                <input type="radio" data-chave="${pergunta.PERGUNTA_ID}" data-obrigatorio="${pergunta.PERGUNTA_OBRIGATORIO}" name="radio_pesquisa_${pergunta.PERGUNTA_ID}" class="input_hidden_changed_listen" value="${i + 1}">
                                </label>
                            </div>`;
                        }
                        formHTML +=`  <div class="right_text_lines_radio_pesquisa values_of_lines_radio_pesquisa">
                                <span>${pergunta.OPCOES.OPCOES_TEXTO_DIREITO || null}</span>
                            </div>
                        </div>
                    </div>`;
                        break;
                    case'2':
                        let resposta = pergunta.PERGUNTA_RESPOSTA ? pergunta.PERGUNTA_RESPOSTA.split(',') : pergunta.PERGUNTA_RESPOSTA;
                        formHTML +=`
                        <div class="area_of_field input_checkbox_content">
                            <div class="title_of_radio_pesquisa ">
                                <span>${key + 1} - ${pergunta.PERGUNTA_TITULO}: ${pergunta.PERGUNTA_OBRIGATORIO === '1' ? '*' :''}</span>
                            </div>
                            <div class="content_of_checkboxes_pesquisas ${pergunta.PERGUNTA_RESPOSTA || pergunta.PESQUISA_RESP ? 'just_show_pesquisa': ''}">`;
                        for (let i = 0; i < parseInt(pergunta.OPCOES.OPCOES_QTDE); i++) {
                            let textValue = pergunta.OPCOES.OPCOES_LABEL != null ? pergunta.OPCOES.OPCOES_LABEL.split('//')[i] : '';
                            let class_to_see = '';
                            if(Array.isArray(resposta))
                                if(resposta.find(resp => resp == i + 1)) class_to_see = 'custom_checkboxes_pesquisas_selected';
                                else if(resposta == i+1)
                                    class_to_see = 'custom_checkboxes_pesquisas_selected';
                            formHTML += `   <div class="content_single_checkbox">
                                      <input type="checkbox" data-chave="${pergunta.PERGUNTA_ID}" data-obrigatorio="${pergunta.PERGUNTA_OBRIGATORIO}" name="checkbox_pesquisa_${pergunta.PERGUNTA_ID}" class="hidden_checkboxes_pesquisas" value="${i + 1}">
                                    <label>
                                        <div class="custom_checkboxes_pesquisas ${class_to_see ? class_to_see : ''}"></div>
                                         ${textValue}
                                    </label>
                                </div>`;
                        }
                        formHTML +=`  </div>
                        </div>`;
                        break;
                    case'3':
                        formHTML +=`
                    <div class="input_text_content area_of_field ${pergunta.PERGUNTA_RESPOSTA || pergunta.PESQUISA_RESP ? 'just_show_pesquisa': ''}">
                        <label for="">${key + 1} - ${pergunta.PERGUNTA_TITULO}: ${pergunta.PERGUNTA_OBRIGATORIO === '1' ? '*' :''}</label>
                        <div class="control_animate_input">
                            <input type="text" name="text_pesquisa_${pergunta.PERGUNTA_ID}" data-obrigatorio="${pergunta.PERGUNTA_OBRIGATORIO}" class="input_text_animation" data-chave="${pergunta.PERGUNTA_ID}" value="${pergunta.PERGUNTA_RESPOSTA ? pergunta.PERGUNTA_RESPOSTA : ''}">
                            <span class="focus-border">
                                <i></i>
                            </span>
                        </div>
                    </div> `;
                        break;
                }
            });
            $(formElement).html(formHTML);
        }
    };

    /**
     * Responsável por enviar os inputs preenchidos para o backend.
     * */
    $scope.savePesquisa = function(){
        if($scope.getFormValues(['checkbox', 'radio', 'text']).status){
            let responseObj = $scope.getFormValues(['checkbox', 'radio', 'text']).respostas;
            $scope.closeModalError();
            Factory.ajax(
                {
                    action:'pesquisa/savepesquisa',
                    data:{
                        pesquisaObj: JSON.stringify(responseObj)
                    }
                },
                result =>{
                    Layers.back($('li.ui-draggable'));
                    $route.reload();
                }
            );
        }else{
            $('.modal_show_error_pesquisa').animate({right: 0}, 700);
        }
    };

    /**
     * Responsável por preparar os dados dos inputs para serem enviados para o backend.
     * @param {array} types - tipos de inputs a serem verificados
     * */
    $scope.getFormValues = function(types = []){
        let responseValues = {status: true, respostas:[]};
        types.forEach(type_ =>{
            let radioNodeList = $(`input[type="${type_}"]`);
            for (let i of radioNodeList) {
                if($scope.checkIfNeedSend($(i)).status){
                    if($scope.checkIfNeedSend($(i)).elementAdd){
                        let hasInArray = Object.keys(responseValues.respostas).find((item, key) => {
                            return responseValues.respostas[item].PERGUNTA === $(i).data('chave');
                        });
                        if(!hasInArray){
                            responseValues.respostas.push({
                                'PERGUNTA':$(i).data('chave'),
                                'RESPOSTA': $($scope.checkIfNeedSend($(i)).elementAdd).val(),
                                'CLIENTE':parseInt($scope.CLIENTE.ID),
                                'PESQUISA':parseInt($scope.pesquisa.PESQUISA_ID)
                            });
                        }else{
                            responseValues.respostas[hasInArray].RESPOSTA = [responseValues.respostas[hasInArray].RESPOSTA,$($scope.checkIfNeedSend($(i)).elementAdd).val()].join(',');
                        }
                    }

                }else{
                    responseValues.status = false;
                }
            }
        });
        return responseValues;
    };

    /**
     * Responsável por válidar as informações vindas do input
     * @param {HTMLElement} el - input a ser verificado
     * @returns {object} objeto com status da verificação e o elemento a ser adicionado ao envio.
     * */
    $scope.checkIfNeedSend = function(el){
        let typeOf_ = $(el).attr('type');
        let responseOfVerify = {status:true, elementAdd: null};
        let isObrigatorio = $(el).data('obrigatorio');
        let nameOfInput = $(el).attr('name');
        let parentElement = '';
        switch (typeOf_) {
            case'radio':
            case'checkbox':
                parentElement  = $(el).closest('.area_of_field ').find('.title_of_radio_pesquisa ');
                $(parentElement).css('color','#000');
                if(isObrigatorio && !$(`input[name=${nameOfInput}]:checked`).length){
                    $(parentElement).css('color','red');
                    responseOfVerify = false;
                }else{
                    if($(el).is(':checked'))
                        responseOfVerify.elementAdd = $(el);
                }
                break;
            case'text':
                parentElement = $(el).closest('.area_of_field ').find('label');
                $(parentElement).css('color','#000');
                if(isObrigatorio && !$(el).val()){
                    $(parentElement).css('color','red');
                    responseOfVerify = false;
                }else{
                    if($(el).val())
                        responseOfVerify.elementAdd = $(el);
                }
                break;
        }
        return responseOfVerify
    };

    /**
     * Responsável por fazer o animate de fechamento da modal de erro.
     * */
    $scope.closeModalError = function(){
        $('.modal_show_error_pesquisa').animate({right: '-110vw'}, 700);
    };

});

app.controller('ProdutosBusca', function($scope, $rootScope) {
    $scope.VALS = Layers.VALS;


    $('body').attr('scroll', 0);
    $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO = true;
    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = [];
    $scope.buscaProdutos = function (PESQUISA) {
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.PLACEHOLDER = 'Digite o que você procura';
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.CATEGORIA = 0;
        $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SUBCATEGORIA = 0;
        clearTimeout(Factory.timeout);
        Factory.timeout = setTimeout(function () {
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BANNERS = [];
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = [];
            clearTimeout(Payment.timeoutBanner['BUSCA']);
            Factory.ajax(
                {
                    action: 'payment/compras',
                    data: {
                        BUSCA: 1,
                        PESQUISA: $rootScope.PESQUISA
                    }
                },
                function (data) {
                    if (data.COMPRAS) {
                        if (data.COMPRAS.SUBCATEGORIAS[0]) {
                            $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.BANNERS = data.COMPRAS.BANNERS;
                            $rootScope.BANNERS_MODAL = data.COMPRAS.BANNERS_MODAL;
                            if (data.COMPRAS.BANNERS_MODAL.length) {
                                setTimeout(function () {
                                    $('div#banner_modal').css('display', 'flex');
                                    $scope.banner('MODAL', 'R');
                                }, 1000);
                            }
                            if (data.COMPRAS.BANNERS.length) {
                                setTimeout(function () {
                                    $scope.banner('BUSCA', 'R');
                                }, 1000);
                            }
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL = data.COMPRAS.SCROLL;
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = data.COMPRAS.SUBCATEGORIAS[0]['ITENS'];
                        } else {
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ITENS = [];
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = 0;
                        }
                    }
                }
            );
        }, PESQUISA ? 1000 : 0);
    };
    $scope.buscaProdutos();

    $scope.clearPesquisa = function () {
        $rootScope.PESQUISA = '';
        $scope.buscaProdutos();
    };
});

app.controller('Index', function($scope, $compile, $rootScope, $routeParams, deviceDetector) {
    if(parseInt(Login.getData().ID)) {
        $rootScope.CPF_NA_NFE = true;
        $rootScope.UTILIZAR_VOUCHER = true;
        $rootScope.LOCAIS = $routeParams.STEP == 'LOCAIS' ? 1 : 0;
        $rootScope.TOUR = $routeParams.STEP == 'TOUR' ? 1 : 0;
        $rootScope.ESCANEAR = $routeParams.STEP == 'ESCANEAR' ? 1 : 0;
        $rootScope.CARRINHO = $routeParams.STEP == 'CARRINHO' ? 1 : 0;
        if ($rootScope.TOUR && !parseInt($rootScope.usuario.TOUR)) {
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                Factory.ajax(
                    {
                        action: 'cadastro/tour'
                    }
                );
            }, 1000);
        }
        $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS;
        $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS;
        $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS;
        $rootScope.STEP = parseInt($routeParams.STEP) ? parseInt($routeParams.STEP) : 1;


        $scope.naoEncontrou = function () {
            if (!$('#sugestao').val())
                $('#sugestao').focus();
            else {
                Factory.ajax(
                    {
                        action: 'cadastro/sugestao',
                        data: {
                            DESCRICAO: $('#sugestao').val()
                        }
                    },
                    function (data) {
                        if (data.status == 1)
                            $('#sugestao').val('');
                    }
                );
            }
        };

        $rootScope.scrollLiberado = true;
        $rootScope.LOCAL = $rootScope.LOCAL ? $rootScope.LOCAL : [];
        $scope.scrollLeft = function () {
            setTimeout(function () {
                var width = 0;
                var active = 0;
                $('ul#boxCategorias li').each(function () {
                    if (!active) {
                        active = $(this).hasClass('active') ? 1 : 0;
                        if (!active)
                            width += $(this).innerWidth();
                    }
                });
                $("#boxCategorias").animate({scrollLeft: width}, 500);
                $("#boxProdutos").animate({scrollTop: 0}, 500);
                setTimeout(function () {
                    $rootScope.scrollLiberado = true;
                }, 500);
            }, 500);
        };

        $rootScope.touchBanner = function (TYPE, DIRECTION) {
            clearTimeout(Payment.timeoutBanner[TYPE]);
            $scope.bannerActivate(TYPE, DIRECTION);
        };

        $scope.bannerActivate = function (TYPE, DIRECTION) {
            var banner = $('.banners[type="' + TYPE + '"] > li.active');
            if (banner.length) {
                if ($('.banners[type="' + TYPE + '"]').visible()) {
                    var _this = null;
                    switch (DIRECTION) {
                        case 'R':
                            _this = banner.next('li').length ? banner.next('li') : $('.banners[type="' + TYPE + '"] > li:first-child');
                            break;
                        case 'L':
                            _this = banner.prev('li').length ? banner.prev('li') : $('.banners[type="' + TYPE + '"] > li:last-child');
                            break;
                    }
                    _this.addClass('active');
                    var id = _this.data('id');
                    var view = _this.data('view');

                    if (parseInt(id) && !parseInt(view)) {
                        _this.data('view', 1);
                        Factory.ajax(
                            {
                                action: 'payment/bannercount',
                                data: {
                                    ID: parseInt(id),
                                    TYPE: 'VIEWS'
                                }
                            }
                        );
                    }
                    banner.removeClass('active');
                }
                $scope.banner(TYPE, 'R');
            }
        };
        $scope.banner = function (TYPE, DIRECTION) {
            if ($('.banners[type="' + TYPE + '"] > li').length > 1) {
                clearTimeout(Payment.timeoutBanner[TYPE]);
                Payment.timeoutBanner[TYPE] = setTimeout(function () {
                    $scope.bannerActivate(TYPE, DIRECTION);
                }, parseInt($('.banners[type="' + TYPE + '"] > li.active').data('time')));
            }
        };
        $rootScope.BANNERS_MODAL = $rootScope.BANNERS_MODAL ? $rootScope.BANNERS_MODAL : [];
        $rootScope.getCompras = function (ITEM) {
            if (!parseInt(ITEM.ACTIVE)) {
                clearTimeout(Payment.timeoutBanner['COMPRAS']);
                $rootScope.scrollLiberado = false;
                var getComprasAjax = function (COORDS){
                    Factory.ajax(
                        {
                            action: 'payment/compras',
                            data: {
                                ID: parseInt(ITEM.ID),
                                LOCAL: parseInt(ITEM.LOCAL),
                                PRODUTO: parseInt(ITEM.PRODUTO) || 0,
                                COORDS: COORDS ? COORDS : null,
                                LOADER_CARREGANDO: $('#boxPago:visible').length ? false : true
                            }
                        },
                        function (data) {
                            $('body').attr('scroll', 0);
                            if (data.LOCAL) {
                                localStorage.setItem("WIFI_NOME",data.LOCAL.ITEM.WIFI_NOME);
                                localStorage.setItem("WIFI_SENHA",data.LOCAL.ITEM.WIFI_SENHA);
                                $rootScope.LOCAL = data.LOCAL;
                            }
                            if (data.COMPRAS) {
                                $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS = data.COMPRAS;
                                $rootScope.BANNERS_MODAL = data.COMPRAS.BANNERS_MODAL;
                                if (data.COMPRAS.BANNERS_MODAL.length) {
                                    setTimeout(function () {
                                        $('div#banner_modal').css('display', 'flex');
                                        $scope.banner('MODAL', 'R');
                                    }, 1000);
                                }
                                if (data.COMPRAS.BANNERS.length) {
                                    setTimeout(function () {
                                        $scope.banner('COMPRAS', 'R');
                                    }, 1000);
                                }
                            }
                            $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                            $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data.CARRINHO;
                            $scope.scrollLeft();
                        }
                    );
                };

                var getLocation = function () {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            function (position) {
                                getComprasAjax(position.coords ? position.coords : -1);
                            },
                            function () {
                                getComprasAjax(-1);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 5000,
                                maximumAge: 0
                            }
                        );
                    } else
                        getComprasAjax(-1);
                };

                if ("cordova" in window) {
                    document.addEventListener("deviceready", function () {
                        getLocation();
                    }, false);
                } else
                    getLocation();
            }
        };

        $rootScope.scroll = function (TYPE) {
            switch (TYPE) {
                case 'produtos':
                    Payment.PRODUTOS_COMPRAS.SCROLL['OFFSET'] += parseInt(Payment.PRODUTOS_COMPRAS.SCROLL['LIMIT']);
                    Factory.ajax(
                        {
                            action: 'payment/compras',
                            data: {
                                ID: parseInt(Payment.PRODUTOS_COMPRAS.CATEGORIA),
                                SCROLL: Payment.PRODUTOS_COMPRAS.SCROLL,
                                LOADER_CARREGANDO: false
                            }
                        },
                        function (data) {
                            $rootScope.scrollLiberado = true;
                            if (data.COMPRAS ? data.COMPRAS.SUBCATEGORIAS[0] : false) {
                                $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                $rootScope.PRODUTOS_COMPRAS.SCROLL.ATIVO = parseInt(data.COMPRAS.SCROLL.ATIVO || 0);
                                $.each(data.COMPRAS.SUBCATEGORIAS[0]['ITENS'], function (idx, item) {
                                    Payment.PRODUTOS_COMPRAS.SUBCATEGORIAS[0]['ITENS'].push(item);
                                });
                                $rootScope.PRODUTOS_COMPRAS = Payment.PRODUTOS_COMPRAS;
                            } else
                                $rootScope.PRODUTOS_COMPRAS.SCROLL.ATIVO = 0;
                        }, function () {
                            $rootScope.scrollLiberado = true;
                        }
                    );
                    break;
                case 'produtos_categorias_busca':
                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL['OFFSET'] += parseInt($rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL['LIMIT']);
                    Factory.ajax(
                        {
                            action: 'payment/compras',
                            data: {
                                BUSCA: 1,
                                PESQUISA: $rootScope.PESQUISA,
                                SCROLL: $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL,
                                LOADER_CARREGANDO: false
                            }
                        },
                        function (data) {
                            $rootScope.scrollLiberado = true;
                            if (data.COMPRAS ? data.COMPRAS.SUBCATEGORIAS[0] : false) {
                                $rootScope.QTDE_PRODUTOS = Payment.QTDE_PRODUTOS = data.QTDE_PRODUTOS;
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = parseInt(data.COMPRAS.SCROLL.ATIVO || 0);
                                $.each(data.COMPRAS.SUBCATEGORIAS[0]['ITENS'], function (idx, item) {
                                    $rootScope.PRODUTOS_CATEGORIAS_BUSCA['ITENS'].push(item);
                                });
                            } else
                                $rootScope.PRODUTOS_CATEGORIAS_BUSCA.SCROLL.ATIVO = 0;
                        }, function () {
                            $rootScope.scrollLiberado = true;
                        }
                    );
                    break;
            }
        };

        $('body').attr('origem_index', 'index');
        $('body').attr('scroll', 0);
        $rootScope.BTN_CARRINHO_BOTTOM = false;
        $rootScope.clickItem = function (ORIGEM, VALS) {
            $('body').attr('origem_index', ORIGEM);
            Layers.back();
            switch (ORIGEM) {
                case 'locaisVoltar':
                    $rootScope.toolbar = $rootScope.CARRINHO ? false : true;
                    $rootScope.MenuBottom = true;
                    $('.boxPopup[box="locais"]').hide();
                    break;
                case 'naoEncontrou':
                    $rootScope.toolbar = false;
                    $rootScope.MenuBottom = false;
                    $rootScope.NAO_ENCONTROU = true;
                    break;
                case 'naoEncontrouVoltar':
                    $rootScope.toolbar = $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO ? false : true;
                    $rootScope.MenuBottom = $rootScope.PRODUTOS_CATEGORIAS_BUSCA.ATIVO ? false : true;
                    $rootScope.NAO_ENCONTROU = false;
                    break;
                case 'voltaLocais':
                    $('.boxPopup[box="locais"]').hide();
                    break;
                case 'busca_locais':
                    var getLocais = function (COORDS){
                        Factory.ajax(
                            {
                                action: 'payment/locais',
                                data: {
                                    COORDS: COORDS ? COORDS : null
                                }
                            },
                            function (data) {
                                if (data.LOCAL) {
                                    $('.boxPopup[box="locais"]').show();
                                    localStorage.setItem("WIFI_NOME", data.LOCAL.ITEM.WIFI_NOME);
                                    localStorage.setItem("WIFI_SENHA", data.LOCAL.ITEM.WIFI_SENHA);
                                    $rootScope.LOCAL = data.LOCAL;
                                }
                            }
                        );
                    };

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            function (position) {
                                getLocais(position.coords ? position.coords : -1);
                            },
                            function () {
                                getLocais(-1);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 5000,
                                maximumAge: 0
                            }
                        );
                    } else
                        getLocais(-1);
                    break;
                case 'index':
                    $(".boxPopup:visible:last").animate({
                        opacity: 0.25,
                        left: "+=350"
                    }, 300, function() {
                        $(this).css('left', 0).css('opacity', 1);
                        $scope.$apply(function () {
                            $rootScope.PESQUISA = '';
                            $rootScope.toolbar = true;
                            $rootScope.MenuBottom = true;
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
                            $('.boxPopup[box="locais"]').hide();
                            $rootScope.BTN_CARRINHO_BOTTOM = false;
                            if(Payment.ATUALIZAR) {
                                Payment.ATUALIZAR = false;
                                $rootScope.getCompras({ID: 0});
                            }
                        });
                    });
                    break;
                case 'carrinho':
                    $(".boxPopup:visible:last").animate({
                        opacity: 0.25,
                        left: "+=350"
                    }, 300, function() {
                        $(this).css('left', 0).css('opacity', 1);
                        $scope.$apply(function () {
                            $rootScope.PESQUISA = '';
                            $rootScope.CARRINHO = false;
                            $rootScope.toolbar = true;
                            $rootScope.PRODUTOS_CATEGORIAS_BUSCA = [];
                        });
                    });
                    break;
                case 'carrinho2':
                    $('body').attr('scroll', 0);
                    $rootScope.MenuBottom = true;
                    $rootScope.toolbar = false;
                    $rootScope.CARRINHO = true;
                    setTimeout(function(){
                        $rootScope.BTN_CARRINHO_BOTTOM = false;
                    }, 500);
                    break;
                case 'produto':
                    if(VALS.PROD_ID) {
                        $('body').attr('scroll', 0);
                        $rootScope.Layers('produto-detalhes', VALS);
                    }
                    break;
            }
        };

        $rootScope.TIPO_PG = 'COMPRAR';
        $rootScope.MenuBottom = 1;
        $rootScope.top_0 = 0;
        switch ($rootScope.STEP) {
            case 1:
            case 2:
            case 4:
                $rootScope.MenuBottom = 1;
                break;
            case 3:
                $rootScope.top_0 = 1;
                $rootScope.MenuBottom = 0;
                $rootScope.toolbar = 0;
                break;
        }
        if ($rootScope.STEP > 1)
            $rootScope.TIPO_PG = 'PAGAMENTO';
        if ($rootScope.CARRINHO)
            $rootScope.toolbar = false;

        $scope.verCarrinho = function () {
            $rootScope.location('#!/index/CARRINHO');
        };

        $rootScope.clickBanner = function (BANNER) {
            $rootScope.BANNERS_MODAL = [];
            switch (BANNER.TYPE) {
                case 'PRODUTO':
                    $rootScope.Layers('produto-detalhes', BANNER.VALUE);
                    break;
                case 'CATEGORIA':
                    $rootScope.clickItem('index');
                    $rootScope.getCompras({ID: parseInt(BANNER.VALUE)});
                    break;
                case 'LAYERS':
                    switch (BANNER.VALUE) {
                        case '[MINHA_CARTEIRA]':
                            $rootScope.Layers('feed-minha-carteira');
                            break;
                        default:
                            if (BANNER.VALUE.indexOf('[PESQUISA#') != -1) {
                                $rootScope.Layers(
                                    'pesquisa-satisfacao-form',
                                    {
                                        ID: parseInt(BANNER.VALUE.split('#')[1].replace(']', ''))
                                    }
                                );
                            }
                            break;
                    }
                    break;
                case 'BUSCA_PRODUTOS':
                    $rootScope.STEP = 1;
                    $rootScope.TIPO_PG = 'COMPRAR';
                    $rootScope.Layers('produtos-busca');
                    $rootScope.PESQUISA = BANNER.VALUE;
                    break;
                case 'REDIRECT':
                    if (BANNER.VALUE)
                        $rootScope.location(BANNER.VALUE, BANNER.EXTERNAL ? 1 : 0, 1);
                    break;
            }
            if (!parseInt(BANNER.VIEW)) {
                Factory.ajax(
                    {
                        action: 'payment/bannercount',
                        data: {
                            ID: BANNER.ID,
                            TYPE: 'CLICKS'
                        }
                    }
                );
            }
        };

        $rootScope.setLocal = function (ITEM) {
            $rootScope.LOCAL.TEXTO = ITEM.NOME_ABV;
            $rootScope.clickItem('locaisVoltar');
            $rootScope.getCompras({ID: 0, LOCAL: parseInt(ITEM.ID)});
        };

        $rootScope.SetAddRemoveQtdeProd = function (PROD, QTDE, LOADER_CARREGANDO) {
            clearTimeout(Factory.timeout);
            Factory.timeout = setTimeout(function () {
                var addremoveqtde = function (QTDE) {
                    Factory.ajax(
                        {
                            action: 'payment/addremoveqtde',
                            data: {
                                LOADER_CARREGANDO: LOADER_CARREGANDO ? true : false,
                                ID: PROD == -1 ? -1 : PROD.PROD_ID,
                                TRANSACAO_PRODUTO: parseInt(PROD.TRANSACAO_PRODUTO) || 0,
                                UNIDADE_MEDIDA: PROD.UNIDADE_MEDIDA,
                                QTDE: QTDE
                            }
                        },
                        function (data) {
                            if (!QTDE && parseInt(PROD.PROD_ID)) {
                                PROD.QTDE = 0;
                                $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                            } else if (PROD == -1)
                                $rootScope.QTDE_PRODUTOS = [];
                            $rootScope.CARRINHO_COMPRAS = Payment.CARRINHO_COMPRAS = data;
                        }
                    );
                };
                if (PROD.INVENTARIO !== undefined) {
                    if (parseInt(QTDE) > parseInt(PROD.INVENTARIO)) {
                        var msg = 'Tem certeza que deseja adicionar (' + parseInt(QTDE) + ') quantidade disponivel estimado (' + parseInt(PROD.INVENTARIO) + ')?';
                        try {
                            navigator.notification.confirm(
                                '',
                                function (buttonIndex) {
                                    if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1))
                                        addremoveqtde(QTDE);
                                    else {
                                        $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = parseInt(PROD.INVENTARIO);
                                        addremoveqtde(parseInt(PROD.INVENTARIO));
                                    }
                                },
                                msg,
                                Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
                            );
                        } catch (e) {
                            if (confirm(msg))
                                addremoveqtde(QTDE);
                            else {
                                $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = parseInt(PROD.INVENTARIO);
                                addremoveqtde(parseInt(PROD.INVENTARIO));
                            }
                        }
                    } else
                        addremoveqtde(QTDE);
                } else
                    addremoveqtde(QTDE);
            }, PROD == -1 ? 0 : 500);
        };

        $rootScope.limparCarrinho = function () {
            var msg = 'Tem certeza que deseja limpar sua lista de compra?';
            try {
                navigator.notification.confirm(
                    '',
                    function (buttonIndex) {
                        if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1))
                            $rootScope.SetAddRemoveQtdeProd(-1, 0, true);
                    },
                    msg,
                    Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
                );
            } catch (e) {
                if (confirm(msg))
                    $rootScope.SetAddRemoveQtdeProd(-1, 0, true);
            }
        };
        $rootScope.addMeAvise = function (PROD,PDV,USER) {
            Factory.ajax(
                {
                    action: 'meavise/cadastrar',
                    data: {
                        PRODUTO: PROD,
                        PDV:PDV,
                        USUARIO:USER
                    }
                },
                function (data) {
                    if (data.status == 1){
                        $('#sugestao').val('');
                        $('.modalAviseMeSended').css('display', 'block');

                    }
                }
            );
        };
        $rootScope.disableModalAviseMe = function(){
            $('.modalAviseMeSended').live('click',function(){
                $('.modalAviseMeSended').css('display', 'none');
            });
        }();
        $rootScope.addRemoveQtdeProd = function (PROD, type, LOADER_CARREGANDO) {
            if (!PROD.QTDE_ORIGINAL)
                PROD.QTDE_ORIGINAL = parseFloat($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0);

            switch (type) {
                case '+':
                    PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID] || 0) + 1;
                    $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                    $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE, LOADER_CARREGANDO);
                    break;
                case '-':
                    if (parseFloat(PROD.QTDE)) {
                        if (parseInt(PROD.QTDE) == 1 || PROD.UNIDADE_MEDIDA == 'KG') {
                            try {
                                navigator.notification.confirm(
                                    '',
                                    function (buttonIndex) {
                                        if (buttonIndex == (Factory.$rootScope.device == 'ios' ? 2 : 1))
                                            $rootScope.SetAddRemoveQtdeProd(PROD, 0, LOADER_CARREGANDO);
                                        else {
                                            PROD.QTDE = PROD.QTDE_ORIGINAL;
                                            $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                                        }
                                    },
                                    'Tem certeza que deseja remover este item da sua lista de compra?',
                                    Factory.$rootScope.device == 'ios' ? 'Não,Sim' : 'Sim,Não'
                                );
                            } catch (e) {
                                if (confirm('Tem certeza que deseja remover este item da sua lista de compra?'))
                                    $rootScope.SetAddRemoveQtdeProd(PROD, 0, LOADER_CARREGANDO);
                            }
                        } else {
                            PROD.QTDE = parseInt($rootScope.QTDE_PRODUTOS[PROD.PROD_ID]) - 1;
                            $rootScope.QTDE_PRODUTOS[PROD.PROD_ID] = PROD.QTDE;
                            $rootScope.SetAddRemoveQtdeProd(PROD, PROD.QTDE, LOADER_CARREGANDO);
                        }
                    }
                    break;
            }
        };

        $rootScope.REDIRECT = '';
        $rootScope.BTN_TYPE = 'NEXT';
        $rootScope.NO_WHATSAPP = false;
        $rootScope.TEXTO_BTN = '';
        $rootScope.TOTAL_DE = '';
        $rootScope.TOTAL_POR = '';
        $rootScope.TOTAL_DESCONTO = '';
        $rootScope.PRODUTOS = [];
        $rootScope.FORMAS_PG = [];
        $rootScope.VALOR_PG = 0;
        $rootScope.VALOR_CASHBACK = 0;
        $rootScope.CASHBACK_TEXTO = '';
        $rootScope.PAGO = 0;
        $rootScope.ACTIVE_SALDO = 1;
        $rootScope.BTN_HOME = $rootScope.STEP == 1 ? true : false;
        $rootScope.STEPS =
            [
                {
                    'STEP': 3,
                    'STEP_TEXTO': 2,
                    'TEXTO': 'Finalizar <b>compra</b>'
                }
            ];

        $scope.step = function (step) {
            if (step != 4)
                $rootScope.STEP = step;
            switch (step) {
                case 3:
                case 4:
                    if (!parseInt($rootScope.transacaoId)) {
                        clearTimeout(Factory.timeout);
                        Factory.timeout = setTimeout(function () {
                            $rootScope.location('#!/');
                        }, 500);
                        return;
                    }
                    break;
            }
            switch (step) {
                case 1:
                    $rootScope.BTN_HOME = true;
                    $rootScope.transacaoId = 0;
                    $rootScope.transacaoIdCarrinho = false;
                    $rootScope.TEXTO_BTN = 'Comprar';
                    break;
                case 2:
                    $rootScope.BTN_HOME = false;
                    $rootScope.transacaoId = 0;
                    $rootScope.transacaoIdCarrinho = false;
                    BarCodeScanner.scan('qrcode');
                    break;
                case 3:
                    $rootScope.BTN_HOME = true;
                    $rootScope.BTN_TYPE = 'CANCEL';
                    $rootScope.TEXTO_BTN = 'Cancelar <i class="mdi mdi-navigation-cancel"></i>';
                    $rootScope.STATUS_TEXTO = 'Aguarde por favor, carregando...';
                    break;
                case 4:
                    $rootScope.confirmPayment('compra');
                    break;
                default:
                    clearTimeout(Factory.timeout);
                    Factory.timeout = setTimeout(function () {
                        $rootScope.location('#!/');
                    }, 500);
                    break;
            }
        };
        $scope.step($rootScope.STEP);

        $rootScope.clickBtnHome = function (swipe, type) {
            if (swipe && $rootScope.STEP != 1)
                return;

            switch ($rootScope.BTN_TYPE) {
                case 'INICIO':
                case 'CANCEL':
                    Payment.clear(1);
                    clearTimeout(Factory.timeout);
                    Factory.timeout = setTimeout(function () {
                        Payment.ATUALIZAR = true;
                        Payment.PRODUTOS_COMPRAS = [];
                        $rootScope.location('#!/');
                    }, 500);
                    break;
                default:
                    $scope.step($rootScope.STEP + 1);
                    break;
            }
        };

        $scope.selectVoucher = function (ITENS, V) {
            if (V.ACTIVE) {
                V.ACTIVE = 0;
                $rootScope.VOUCHER = 0;
            } else {
                $.each(ITENS, function (idx, item_each) {
                    item_each.ACTIVE = 0;
                });
                V.ACTIVE = 1;
                $rootScope.VOUCHER = V.ID;
                $rootScope.VOUCHER_VALOR = V.VALOR_FORMAT;
            }
            $rootScope.verifyLimitFormasPg();
        };

        $scope.activeVoucher = function () {
            if ($rootScope.FORMAS_PG['VOUCHER']) {
                $.each($rootScope.FORMAS_PG['VOUCHER']['ITENS'], function (idx, voucher) {
                    if (voucher.ACTIVE) {
                        $rootScope.VOUCHER = voucher.ID;
                        $rootScope.VOUCHER_VALOR = voucher.VALOR_FORMAT;
                    }
                });
            }
        };

        $scope.addVoucher = function () {
            if ($rootScope.ADD_VOUCHER || '') {
                Factory.ajax(
                    {
                        action: 'cadastro/addvoucher',
                        data: {
                            TRANSACAO_ID: parseInt($rootScope.transacaoId),
                            ADD_VOUCHER: $rootScope.ADD_VOUCHER
                        }
                    },
                    function (data) {
                        $rootScope.ADD_VOUCHER = '';
                        if (data.ITENS) {
                            $rootScope.FORMAS_PG['VOUCHER']['ITENS'] = data.ITENS;
                            $scope.activeVoucher();
                        }
                        $rootScope.verifyLimitFormasPg();
                    }
                );
            } else
                $('#ADD_VOUCHER').focus();
        };

        $rootScope.cancel = function () {
            Payment.cancel();
        };

        // Get produtos
        switch ($routeParams.STEP) {
            case 'CAT':
                $rootScope.getCompras({ID: $routeParams.VAL});
                break;
            case 'BUSCA':
                Payment.ATUALIZAR = true;
                $rootScope.PRODUTOS_CATEGORIAS = {};
                $rootScope.PRODUTOS_CATEGORIAS_BUSCA = {};
                $rootScope.STEP = 1;
                $rootScope.TIPO_PG = 'COMPRAR';
                $rootScope.Layers('produtos-busca');
                $rootScope.PESQUISA = $routeParams.VAL?$routeParams.VAL:'';
                break;
            default:
                if (!parseInt(Payment.PRODUTOS_COMPRAS['CATEGORIA']) || Payment.ATUALIZAR || !Payment.PRODUTOS_COMPRAS.SUBCATEGORIAS.length) {
                    Payment.ATUALIZAR = false;
                    var ID_CATEGORIA = parseInt($('ul#boxCategorias li.active').data('id')) || 0;
                    setTimeout(function(){
                        $rootScope.getCompras({ID: ID_CATEGORIA});
                    }, 1000);
                } else
                    $scope.scrollLeft();
                break;
        }

        /*if(parseInt(Login.getData().ID) == 475) {
            var achou_local = false;
            ble.scan(
                [],
                5,
                function (device) {
                    if (device.name.indexOf('mkt') !== -1 && !achou_local) {
                        achou_local = true;
                        setTimeout(function() {
                            Factory.$rootScope.setLocal({ID: parseInt(device.name.split('_')[1])});
                        }, 2000);
                    }
                },
                bluetooth.disconnect
            );
        }*/

        if ($rootScope.STEP == 3) {
            var verify_paymento = null;
            $rootScope.verify = function (time) {
                if (verify_paymento)
                    clearTimeout(verify_paymento);

                verify_paymento = setTimeout(function () {
                    if (parseInt($rootScope.transacaoId)) {
                        Factory.ajax(
                            {
                                action: 'payment/verify',
                                data: {
                                    TRANSACAO_ID: parseInt($rootScope.transacaoId)
                                }
                            },
                            function (data) {
                                if (parseInt($rootScope.transacaoId)) {
                                    if (data.STATUS) {
                                        if (typeof data.STATUS_TEXTO !== 'undefined')
                                            $rootScope.STATUS_TEXTO = data.STATUS_TEXTO;
                                        if (typeof data.BTN_HOME !== 'undefined')
                                            $rootScope.BTN_HOME = data.BTN_HOME;
                                        if (typeof data.BTN_TYPE !== 'undefined')
                                            $rootScope.BTN_TYPE = data.BTN_TYPE;
                                        if (typeof data.TEXTO_BTN !== 'undefined')
                                            $rootScope.TEXTO_BTN = data.TEXTO_BTN;
                                        if (typeof data.FORMAS_PG !== 'undefined') {
                                            var add = false;
                                            var cc = CC.get();
                                            $.each(data.FORMAS_PG, function (idx, f_pg) {
                                                switch (f_pg.GATEWAY) {
                                                    case 'JUNO':
                                                    case 'GETNET':
                                                    case 'VR':
                                                    case 'VA':
                                                        var active = 1;
                                                        var count = 0;
                                                        data.FORMAS_PG[idx]['LST'] = [];
                                                        $.each(cc, function (ID, vals) {
                                                            add = false;
                                                            switch (f_pg.GATEWAY) {
                                                                case 'JUNO':
                                                                case 'GETNET':
                                                                    add = vals.TIPO_CC == 'CC/DEBITO' || !vals.TIPO_CC;
                                                                    break;
                                                                case 'VR':
                                                                    add = vals.TIPO_CC == 'VR';
                                                                    break;
                                                                case 'VA':
                                                                    add = vals.TIPO_CC == 'VA';
                                                                    break;
                                                            }
                                                            if (add) {
                                                                data.FORMAS_PG[idx]['LST'].push({
                                                                    ACTIVE: active,
                                                                    ID: ID,
                                                                    IMG: config.url_api()+"skin/default/images/bandeira_cc/" + vals.BANDEIRA + ".png",
                                                                    TEXT: vals.TEXT,
                                                                    BANDEIRA: vals.BANDEIRA,
                                                                    VALS: {1: vals.HASH}
                                                                });
                                                                active = 0;
                                                                count++;
                                                            }
                                                        });
                                                        if (count) {
                                                            data.FORMAS_PG[idx]['LST'].push({
                                                                'ID': 0,
                                                                'ACTIVE': 0,
                                                                'TEXT': 'Novo cartão'
                                                            });
                                                        }
                                                        break;
                                                }
                                            });
                                            $rootScope.FORMAS_PG = data.FORMAS_PG;
                                        }
                                        if (typeof data.PRODUTOS !== 'undefined')
                                            $rootScope.PRODUTOS = data.PRODUTOS;
                                        if (typeof data.STEP !== 'undefined')
                                            $rootScope.STEP = data.STEP;
                                        if (typeof data.STEPS !== 'undefined')
                                            $rootScope.STEPS = data.STEPS;

                                        switch (data.STATUS) {
                                            case 'authorized':
                                            case 'pg_autorizado':
                                                if (!$rootScope.PAGO) {
                                                    $rootScope.PAGO = 1;
                                                    $('#boxPago span').html('Compra realizada com sucesso');
                                                    $('#boxPago').css('opacity', 1).show();
                                                    var audio = new Audio('audio/song.mp4');
                                                    audio.play();
                                                    setTimeout(function () {
                                                        $('#boxPago').css('opacity', 0).hide();
                                                        if (Payment.DESTRAVAR) {
                                                            var PORTA = parseInt(Payment.DESTRAVAR);
                                                            Payment.DESTRAVAR = 0;
                                                            Factory.$rootScope.QTDE_PRODUTOS = [];
                                                            Payment.QTDE_PRODUTOS = [];
                                                            Factory.$rootScope.CARRINHO_COMPRAS = [];
                                                            Payment.CARRINHO_COMPRAS = [];
                                                            bluetooth.detravar(1, null, PORTA);
                                                        }
                                                    }, 3000);
                                                }
                                                break;
                                            case 'waiting_authorization':
                                                $scope.activeVoucher();

                                                // PagSeguro
                                                $.each(data.FORMAS_PG, function (idx, f_pg) {
                                                    if (f_pg.GATEWAY == 'PAGSEGURO')
                                                        $rootScope.pagseguro(0, null, 1000);
                                                });

                                                // Verify limit formas pg
                                                $rootScope.verifyLimitFormasPg();
                                                break;
                                        }

                                        if (parseInt(data.CLEAR))
                                            Payment.clear(0, data.STATUS);
                                        else
                                            $rootScope.verify(1000);
                                    } else
                                        $rootScope.verify(1000);
                                }
                            }, function () {
                                Factory.$rootScope.verify(1000);
                            }
                        );
                    }
                }, time ? time : 100);
            };
            $rootScope.verify();
        }
    }else
        $rootScope.location('#!/conecte-se');
});

app.controller('FeedSocial', function($rootScope, $scope, $route ,ReturnData)  {

    /*----------------------- SETTINGS VARIABLE-------------------------*/

    $rootScope.border_top = false;
    $rootScope.Titulo = "Rede Social";
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $rootScope.MenuBottom = true;
    $rootScope.MenuSocial = true;
    $rootScope.MenuTop = false;
    $scope.paginateData = 0;
    $scope.loading = true;
    $scope.default_image = 'img/login_default.png';
    $scope.UserID = Login.getData().ID;
    $scope.FOLLOW = [];

    ReturnData.activities.then(item => {
        $scope.FEED =  item.feed;
    });
    ReturnData.follow.then(item => {
        $scope.SEGUIDORES = item.follow.seguidores;
        $scope.SEGUINDO = item.follow.seguindo;
    });
    ReturnData.requests.then(item => {
        $scope.PENDING_REQUESTS = item.pending_requests;
    });

    /*--------------------------FIM------------------------------------*/
    /*--------------------------------------HELPERS METHODS----------------------------------------*/

    /**
     * Função responsável por fazer requisições para buscar dados dinamicamente.
     * @param {string} typeSearch - Subtipo de pesquisa, ex.: seguindo, seguidores, minhas, todas. OBS.: nem todas requisições possuem esse subtipo
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * @param {string} action_ - Endpoint da requisição
     * @param {string} typeReciver - Tipo da requisição ex.: follow, feed
     * @param {object} dataConstruct - Objeto com os dados enviados para o backend.
     */
    $scope.GetAnyData = function(typeSearch, lazyLoading = false, action_, typeReciver, dataConstruct){
        Factory.ajax(
            {
                action: action_,
                data: dataConstruct
            },
            data => {
                let response_data = data[typeReciver.toLowerCase()]; // criando typeReciver com padrão de variavel de escopo, é possivel chamar ele dinamicamente.
                if(response_data[typeSearch]) response_data = response_data[typeSearch]; // verifica se dentro dos dados da requisição existe subtipo, de acordo com o que foi passado.
                if(lazyLoading){
                    $scope[typeReciver] = [...$scope[typeReciver], ...response_data]; // merge dos dados antigos e novos sem formar um array dentro de outro, usando o spread de array.
                    if(response_data.length == dataConstruct.limit) $scope.loading = true;
                }else{
                    $scope[typeReciver] = response_data;
                    if(response_data.length < limit) $scope.loading = false;
                }
                $('#loader_feed').loadingFeed('hidden');
            });
    };

    /**
     * Função responsável por adicionar um evento de scroll no elemento, de acordo com a classe solicitada.
     * OBS.: Essa função é baseada também nas abas da tela, ou seja, qual está ativa ou não, então a partir disso é montado os dados da tela.
     * @param {string} class_ - Classe do elemento que vai receber o evento de scroll. OBS.: note se ele já possiu os atributos para usar corretamente o scroll (overflow, max-height, etc...).
     * @param {string} active_class_ - Classe que sinaliza a aba ativa.
     * @param {string} type_ - Tipo da busca que sera feita ex.: follow, feed
     * @param {number} limit - Limite de registros por requisição.
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * */
    $scope.initFeedScroll = function(class_,active_class_, type_, limit, lazyLoading = false){
        document.getElementsByClassName(class_)[0].addEventListener('scroll',event => {
            let elementToCalc = document.getElementsByClassName(class_)[0];
            let totalHeight = elementToCalc.scrollHeight;
            let ScrollPosition = elementToCalc.scrollTop + elementToCalc.clientHeight;
            if((totalHeight == ScrollPosition || totalHeight == (ScrollPosition + 1)) && $scope.loading){
                // em algumas versões de dispositivos mobile,
                // o valor do atributo scrollTop fica 1 a menos que o valor do atributo scrollHeight,
                // sendo assim, somando 1 no scrollPosition faz a condição acontecer e não afeta outros dispositivos.
                $scope.loading = false;
                $scope.paginateData ++;

                type_ === 'feed' && $('#loader_feed').loadingFeed();

                // chamada da função dinamicamente, de acordo com o @type_, fazendo essa padronização é possivel fazer essa chamada.
                $scope[`Get${$rootScope.capitalizeString(type_)}Data`](
                    limit,
                    $scope.paginateData,
                    $scope.GetTypeOfSearch(type_, active_class_),
                    type_,
                    lazyLoading
                );
            }
        });
    };


    /**
     * Função responsável por determinar o subtipo de busca que vai ser feita.
     * @param {string} type_ - Tipo de busca à ser feita ex.: follow, feed, etc...
     * @param {string} active_class_ - Classe que determina a aba ativa.
     * @returns {string} Subtipo desejado de acordo com a aba selecionada.
     * */
    $scope.GetTypeOfSearch = function(type_, active_class_){
        return $(`.abas_${type_}`).find(`.${active_class_}`).parent().data('search');
    };

    /**
     * Função responsável por verificar se uma imagem está quebrada e colocar uma padrão
     * @param {HTMLElement} img - dom da imagem para verificar
     * */
    $scope.defaultImage = function(img){
        img.onerror = "";
        img.src = $scope.default_image;
    };

    /*-------------------------------------FIM---------------------------*/

    /**
     * Função responsável por alterar os conteúdos de acordo com as aba clicada.
     * @param {HTMLElement} el - elemento de referencia para a animação.
     * */
    $scope.ChangeAbasSocial = function(el){
        let clickedElement = $scope.getClickedElement(el, 'single_aba');
        let parentElement = $(clickedElement).parent();
        let selectedAbaBorderElement = $(clickedElement).find('.border_aba');
        if($(selectedAbaBorderElement).hasClass('active_aba_social')) return false;
        let activeAbaBorderElement = $(parentElement).find('.active_aba_social');
        let offsetAnimate = $($(parentElement).children()[1]).offset().left - $($(parentElement).children()[0]).offset().left; // valor da distância entre os 2 elementos(abas)
        let animateObj = $(clickedElement).hasClass('left') ? {right: offsetAnimate} : {left: offsetAnimate};
        let module = {old: $(activeAbaBorderElement).parent().data('modulo'), new: $(clickedElement).data('modulo')};
        $(activeAbaBorderElement).css('position','relative').animate(animateObj,100, function(){
            $scope.reloadDataAbas(module.new, clickedElement);
            $(activeAbaBorderElement).removeAttr('style').removeClass('active_aba_social');
            $(selectedAbaBorderElement).addClass('active_aba_social');
            $(`.list_social.${module.old}`).css('display','none');
            $(`.list_social.${module.new}`).css('display','flex');
        });
    };

    /**
     * Função responsável por controlar quando os dados serão recarregados nas trocas de abas
     * @param {string} module_ - módulo à ser recarregado.
     * @param {HTMLElement} clickedElement - elemento da aba selecionada pelo usuário.
     * */
    $scope.reloadDataAbas = function(module_, clickedElement){
        const permitted_modules =['all_social', 'seguidores', 'seguindo'];
        let is_permitted = permitted_modules.filter(permission => permission == module_);
        if(is_permitted.length){
            if(module_ =='seguindo' || module_ =='seguidores'){
                $scope.GetFollowData(15,0, "", 'follow');
            }else{
                $(`.${module_}`).scrollTop(0);
                $scope.paginateData = 0;
                $scope.GetFeedData(30, 0, $(clickedElement).data('search'), 'feed');
            }
        }

    };

    /**
     * Função responsável por manusear os dados para pesquisa de feed.
     * @param {number} limit - limite de dados por chamada da função.
     * @param {number} offset - paginção de dados por chamada da função.
     * @param {string} typeSearch - subtipo de pesquisa ex.:todas, minhas, etc...
     * @param {string} [typeReciver_=false] - tipo da pesquisa ex.: follow, feed, etc... OBS.: ela não precisa ser necessariamente enviada, pode ser setada dentro da função.
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * @param {object} extra_args - parametros extras passados.
     * */
    $scope.GetFeedData = function(limit, offset, typeSearch, typeReciver_ = null, lazyLoading = false, extra_args={}){
        let dataConstruct={limit, offset, todos: typeSearch==='todas', LOADER_CARREGANDO: false};
        $scope.GetAnyData(typeSearch, lazyLoading,  'redesocial/feed', typeReciver_.toUpperCase(), dataConstruct)
    };

    /**
     * Função responsável por manusear os dados para pesquisa de follows.
     * @param {number} limit - limite de dados por chamada da função.
     * @param {number} offset - paginção de dados por chamada da função.
     * @param {string} typeSearch - subtipo de pesquisa ex.:todas, minhas, etc...
     * @param {string} [typeReciver_=false] - tipo da pesquisa ex.: follow, feed, etc... OBS.: ela não precisa ser necessariamente enviada, pode ser setada dentro da função.
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * @param {object} extra_args - parametros extras passados.
     * */
    $scope.GetFollowData = function(limit, offset, typeSearch, typeReciver_ = null, lazyLoading = false, extra_args={}){
        var dataConstruct= {limit, offset };
        var action_ = 'redesocial/conexoes';
        if(Object.keys(extra_args).length){
            dataConstruct = extra_args;
            dataConstruct.limit = limit;
            dataConstruct.offset = offset;
            dataConstruct.type = typeSearch == 'seguindo' ? 'following' : 'followers';
            action_ = 'redesocial/usuarios';
        }

        $scope.GetAnyData(typeSearch, lazyLoading,  action_, 'FOLLOW', dataConstruct)
    };

    /**
     * Função reponsável pela ação do like na página.
     * @param {HTMLElement} el - elemento de referencia para coletar os dados necessarios e fazer a ação.
     * */
    $scope.GiveLike = function(el){
        let clickedElement =  $scope.getClickedElement(el, 'single_feed');
        let transacao = $(clickedElement).data('feed');
        let likeElement =  $(clickedElement).find('.like_feed_button > i');
        let qtdLikesElement = $(clickedElement).find('.show_likes_count');
        let classLike ='';
        let checkIfTypeLike = false;
        if($(likeElement).hasClass('no_like')){
            classLike = ['mdi-action-favorite','liked'];
            checkIfTypeLike = true;
        }else{
            classLike = ['mdi-action-favorite-outline','no_like'];
        }
        $(clickedElement).find('.like_feed_button > i').removeAttr('class').addClass(classLike);
        Factory.ajax(
            {
                action:'redesocial/curtir',
                data: {transacao}
            },
            data => {
                $scope.manageCountOfLikes(checkIfTypeLike, qtdLikesElement, likeElement);
            }
        )
    };

    /**
     * Função responsável por gerenciar o contador de likes.
     * @param {boolean} checker - verifica se a ação foi like ou deslike.
     * @param {HTMLElement} qtdLikesElement - elemento da quantidade na tela.
     * @param {HTMLElement} likeElement - elemento do icon do like.
     * */
    $scope.manageCountOfLikes = function(checker, qtdLikesElement, likeElement){
        if(checker){
            qtdLikesElement.length ?
                $(qtdLikesElement).addClass('liked_number').text(parseInt($(qtdLikesElement).text()) + 1) :
                $(likeElement).before('<div class="show_likes_count liked_number">1</div>');
        }else{
            $(qtdLikesElement).removeClass('liked_number').text(parseInt($(qtdLikesElement).text()) - 1);
            if(parseInt($(qtdLikesElement).text()) < 1 )  $(qtdLikesElement).remove();
        }
    };

    /**
     * Função responsável por pegar o elemento de acordo com o clique e a necessidade.
     * @param {HTMLElement} el - elemento de referência para capturar o elemento necessário.
     * @param {string} class_ - classe de referência para capturar o elemento necessário.
     * @returns {HTMLElement} - elemento desejado.
     * */
    $scope.getClickedElement = function(el, class_){
        return $(el).hasClass(class_) ? el : $(el).closest(`.${class_}`);
    };

    /**
     * Função responsável por iniciar os follows ao carregar a tela.
     * */
    $scope.ScrollTransactions = function(){
        $scope.initFeedScroll('all_social', 'active_aba_social', 'feed', 30, true);
    };

    $(()=>{
        $rootScope.initList(['all_social:not(.profile_feed)'], true, 90);
        $scope.ScrollTransactions();
    });

});

app.controller('FeedVerTodosSocial', function($rootScope, $scope, $route)  {
    $scope.FOLLOW = '';
    $scope.TITULO_LAYERS = $rootScope.capitalizeString(Layers.VALS.sub_type);
    $scope.default_image = 'img/login_default.png';
    $scope.TYPEOF_='';
    $scope.SearchFollowsVerTodos = null;
    $scope.UserID = Login.getData().ID;
    $scope.Perfil_id = Layers.VALS.perfil_id;

    $scope.initControllerVer = function(){
        return Factory.ajax(
            {
                action: 'redesocial/conexoes',
                data: {
                    limit:30,
                    offset:0,
                    perfil_id: Layers.VALS.perfil_id
                }
            },
            data =>{
                $scope.FOLLOW = data.follow[Layers.VALS.sub_type];
                $scope.TYPEOF_ = Layers.VALS
            }
        );
    }();

    /**
     * Função responsável por fazer requisições para buscar dados dinamicamente.
     * @param {string} typeSearch - Subtipo de pesquisa, ex.: seguindo, seguidores, minhas, todas. OBS.: nem todas requisições possuem esse subtipo
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * @param {string} action_ - Endpoint da requisição
     * @param {string} typeReciver - Tipo da requisição ex.: follow, feed
     * @param {object} dataConstruct - Objeto com os dados enviados para o backend.
     */
    $scope.GetAnyData = function(typeSearch, lazyLoading = false, action_, typeReciver, dataConstruct){
        Factory.ajax(
            {
                action: action_,
                data: dataConstruct
            },
            data => {
                let response_data = data[typeReciver.toLowerCase()]; // criando typeReciver com padrão de variavel de escopo, é possivel chamar ele dinamicamente.
                if(response_data[typeSearch]) response_data = response_data[typeSearch]; // verifica se dentro dos dados da requisição existe subtipo, de acordo com o que foi passado.
                if(lazyLoading){
                    $scope[typeReciver] = [...$scope[typeReciver], ...response_data]; // merge dos dados antigos e novos sem formar um array dentro de outro, usando o spread de array.
                    if(response_data.length == dataConstruct.limit) $scope.loading = true;
                }else{
                    $scope[typeReciver] = response_data;
                    if(response_data.length < limit) $scope.loading = false;
                }

            });
    };

    /**
     * Função responsável por adicionar um evento de scroll no elemento, de acordo com a classe solicitada.
     * OBS.: Essa função é baseada também nas abas da tela, ou seja, qual está ativa ou não, então a partir disso é montado os dados da tela.
     * @param {string} class_ - Classe do elemento que vai receber o evento de scroll. OBS.: note se ele já possiu os atributos para usar corretamente o scroll (overflow, max-height, etc...).
     * @param {string} active_class_ - Classe que sinaliza a aba ativa.
     * @param {string} type_ - Tipo da busca que sera feita ex.: follow, feed
     * @param {number} limit - Limite de registros por requisição.
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * */
    $scope.initFeedScroll = function(class_,active_class_, type_, limit, lazyLoading = false){
        document.getElementsByClassName(class_)[0].addEventListener('scroll',event => {
            let elementToCalc = document.getElementsByClassName(class_)[0];
            let totalHeight = elementToCalc.scrollHeight;
            let ScrollPosition = elementToCalc.scrollTop + elementToCalc.clientHeight;
            if((totalHeight == ScrollPosition || totalHeight == (ScrollPosition + 1)) && $scope.loading){
                // em algumas versões de dispositivos mobile,
                // o valor do atributo scrollTop fica 1 a menos que o valor do atributo scrollHeight,
                // sendo assim, somando 1 no scrollPosition faz a condição acontecer e não afeta outros dispositivos.
                $scope.loading = false;
                $scope.paginateData ++;
                // chamada da função dinamicamente, de acordo com o @type_, fazendo essa padronização é possivel fazer essa chamada.
                $scope[`Get${$rootScope.capitalizeString(type_)}Data`](
                    limit,
                    $scope.paginateData,
                    $scope.TYPEOF_,
                    type_,
                    lazyLoading,
                    $scope.getValueTextBox()
                );
            }
        });
    };

    /**
     * Função responsável por gerenciar o estado do relacionamento entre o usuário e o follow.
     * @param {number} user_id - id do follow clicado.
     * @param {HTMLElement} element - elemento clicado.
     * @param {boolean} removeElement - verifica de se o elemento vai ou não ser removido.
     * @param {boolean} [unfollow=false] - se vai ou não desfazer o relacionamento.
     * */
    $scope.manageStateFollow = function(user_id, element, removeElement, unfollow = true){
        if($(element).data('status') =='unfollow'){
            let username = $(element).closest('li').find('.name_follow').html();
            let message_text = '';
            switch ($(element).data('type')) {
                case'deixar_seguir':
                    message_text = `Você deseja parar de seguir <span style="color:#00cb00">${username}</span>?`
                    break;
                case'pendente':
                    message_text = `Você deseja cancelar a solicitação?`
                    break;
                case'remover_seguidor':
                case'remover':
                    message_text = `Você deseja remover <span style="color:#00cb00">${username}</span>?`
                    break;
            }

            $('#confirm_action_social').find('.confirm_action_upper').html(message_text);

            $('#confirm_action_social').find('.continue_confirm_action').unbind('click').click(function(){
                $scope.HandleManageStateFlow(user_id, element, removeElement, unfollow);
            });

            $('#confirm_action_social').css('display', 'block');
        }else{
            $scope.HandleManageStateFlow(user_id, element, removeElement, unfollow);
        }
    };

    $scope.HandleManageStateFlow = function(user_id, element, removeElement, unfollow = true){
        let ParentElement = $(element).closest('li');
        let typeOfButton = $(element).data('type');
        let action_ =  $(element).data('status') =='follow' ? 'seguirusuario' : 'deixardeseguir';
        Factory.ajax(
            {
                action:`redesocial/${action_}`,
                data: {user_id, unfollow}
            },
            data => {
                $scope.setManageStateFollow(typeOfButton,element, data);
                if(removeElement) $(ParentElement).remove();
                $('#confirm_action_social').css('display', 'none');
                $route.reload();
            }
        );
    };

    /**
     * Função responsável por fazer as alterações dos elementos da tela pós requisição.
     * @param {string} typeOfButton - estado anterior do botão.
     * @param {HTMLElement} element - elemento clicado.
     * @param {array} data - resposta da requisição.
     * */
    $scope.setManageStateFollow = function(typeOfButton,element, data){
        switch (typeOfButton) {
            case'deixar_seguir':
                $(element)
                    .data({'type':'seguir_denovo', 'status':'follow'})
                    .removeClass('parar_seguir_follow')
                    .addClass('seguir_again_follow')
                    .text('Seguir de volta');
                break;
            case'seguir_denovo':
                let buttonObj ={
                    text:"Deixar de seguir",
                    type:'deixar_seguir',
                    class:'parar_seguir_follow'
                };
                if(data.status_solicitacao =='P'){
                    buttonObj.text ='Pendente';
                    buttonObj.type ='pendente';
                    buttonObj.class ='seguir_again_follow';
                }
                $(element).data({'type':buttonObj.type, 'status':'unfollow'}).removeClass('seguir_again_follow').addClass(buttonObj.class).text(buttonObj.text);
                break;
            case'pendente':
                $(element).data({'type':'seguir_denovo','status':'follow'}).text('Seguir de volta');
                break;
            case'remover_seguidor':
                $(element).closest('li').remove();
                break;
        }
    };

    $scope.GetFollowData = function(limit, offset, typeSearch, typeReciver_ = null, lazyLoading = false, extra_args={}){
        var dataConstruct= {limit, offset };
        var action_ = 'redesocial/conexoes';
        if(Object.keys(extra_args).length){
            dataConstruct = extra_args;
            dataConstruct.limit = limit;
            dataConstruct.offset = offset;
            dataConstruct.type = typeSearch == 'seguindo' ? 'following' : 'followers';
            action_ = 'redesocial/usuarios';
        }

        $scope.GetAnyData(typeSearch, lazyLoading,  action_, 'FOLLOW', dataConstruct);


    };

    $scope.defaultImage = function(img){
        img.onerror = "";
        img.src = $scope.default_image;
    };

    /**
     * Função responsável adicionar o evento de keyup para pesquisa de follows.
     * */
    $scope.SearchFollowsVerTodos = function(){
        var searchble_time_out = null;
        $('.search_in_list_follow').unbind('keyup').live('keyup',function(){
            let username = $scope.getValueTextBox();
            let type_ = Layers.VALS.sub_type;
            if(searchble_time_out != null)
                window.clearTimeout(searchble_time_out);
            searchble_time_out = setTimeout(function(){
                $scope.paginateData = '0';
                $scope.GetFollowData(30, $scope.paginateData, type_, null, false, username);
            }, 500);
        });
    };

    /**
     * Função responsável por pegar o valor do campo de pesquisa dos follows
     * @returns {object} objeto de retorno da pesquisa
     * */
    $scope.getValueTextBox = function(){
        let responseObj = {};
        if($('.search_in_list_follow').val()) responseObj = {username: $('.search_in_list_follow').val()};
        return responseObj;
    };


    $(()=>{
        $scope.SearchFollowsVerTodos();
        $scope.initFeedScroll('list_all_follow', 'active_aba_social', 'follow', 30, true);
        $rootScope.initList(['list_all_follow'], false, 70);
        $('.close_content_all_follow').on('click',function(e){
            e.preventDefault();
            $(this).parent().find('.content_input input').trigger('focus');
        });
    });

});

app.controller('FeedRequestsSocial', function($rootScope, $scope, $route)  {

    $scope.PENDING_REQUESTS = '';
    $scope.TITULO_LAYERS = 'Convites pendentes';
    $scope.default_image = 'img/login_default.png';


    $scope.initControllerRequests = function(){
        Factory.ajax(
            {
                action:'redesocial/solicitacoespendentes',
                data:{
                    limit: 30,
                    offset:0
                }
            },
            data => {
                $scope.PENDING_REQUESTS = data.pending_requests
            }
        )
    }();


    /**
     * Função responsável por manusear os dados para pesquisa de convites pendentes.
     * @param {number} limit - limite de dados por chamada da função.
     * @param {number} offset - paginção de dados por chamada da função.
     * @param {string} typeSearch - subtipo de pesquisa ex.:todas, minhas, etc...
     * @param {string} [typeReciver_=false] - tipo da pesquisa ex.: follow, feed, etc... OBS.: ela não precisa ser necessariamente enviada, pode ser setada dentro da função.
     * @param {boolean} [lazyLoading=false] - Define o tipo de carregamento de dados, caso seja false, ele apenas vai trazer os dados e atribuir à variavel, se não
     *    vai fazer um merge dos dados novos com os antigos, para a execução do lazyloading quando o usuário scrolla a tela.
     * @param {object} extra_args - parametros extras passados.
     * */
    $scope.GetPendentsData = function(limit, offset, typeSearch, typeReciver_ = null, lazyLoading = false, extra_args={}){
        var dataConstruct= {limit, offset };
        var action_ = 'redesocial/solicitacoespendentes';
        $scope.GetAnyData(typeSearch, lazyLoading,  action_, 'PENDING_REQUESTS', dataConstruct);
    };

    /**
     * Função responsável pelas requisições dos convites.
     * @param {string} type_ - tipo de resposta ao convite.
     * @param {number} idRequest - id do convite.
     * @param {HTMLElement} el - elemento de referência.
     * */
    $scope.responseRequest = function(type_, idRequest, el){

        Factory.ajax(
            {
                action: 'redesocial/respondersolicitacao',
                data:{
                    solicitacao: idRequest,
                    resposta: type_
                }
            },
            data =>{
                $route.reload();
                if(!data.amount_pending_requests) {
                    $('.follow_requests').find('.text_content').removeClass('has_requests');
                    Layers.back();
                }
                $(el).closest('li').remove();
            }
        )
    };
    $(()=>{
        $rootScope.initList(['all_social'], true, 90);
    })
});

app.controller('FeedPerfilSocial', function($rootScope, $scope, $route)  {

    /*----------------------- SETTINGS VARIABLE-------------------------*/
    $rootScope.border_top = false;
    $scope.TITULO_LAYERS = 'Perfil';
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $rootScope.MenuBottom = true;
    $rootScope.MenuSocial = true;
    $rootScope.MenuTop = false;
    $scope.paginateData = 0;
    $scope.loading = true;
    $scope.default_image = 'img/login_default.png';
    $scope.UserID = Login.getData().ID;
    $scope.FEED = '';
    $scope.USER = '';
    /*----------------------- FIM -------------------------*/

    $scope.initController = function(){
        return Factory.ajax(
            {
                action: 'redesocial/userprofile',
                data: {
                    user_id: Layers.VALS
                }
            },
            data =>{
                $scope.FEED = data.user.feed;
                $scope.USER = data.user;
            }
        );
    }();


    /**
     * Função responsável por verificar se uma imagem está quebrada e colocar uma padrão
     * @param {HTMLElement} img - dom da imagem para verificar
     * */
    $scope.defaultImage = function(img){
        img.onerror = "";
        img.src = $scope.default_image;
    };

    /**
     * Função responsável por iniciar o scroll do feed.
     * */
    $scope.initProfileFeedScroll = function(){
        document.getElementsByClassName('list_of_profile_content')[0].addEventListener('scroll',function(event){
            let elementToCalc = document.getElementsByClassName('list_of_profile_content')[0];
            let totalHeight = elementToCalc.scrollHeight;
            let ScrollPosition = elementToCalc.scrollTop + elementToCalc.clientHeight;
            if((totalHeight == ScrollPosition || totalHeight == (ScrollPosition + 1)) && $scope.loading){
                $scope.loading = false;
                $scope.paginateData ++;
                $('#loader_feed_social').loadingFeed();
                $scope.getData();
            }
        });
    };

    /**
     * Função responsável por carregar os dados do feed.
     * */
    $scope.getData = function(){
        Factory.ajax(
            {
                action:'redesocial/feed',
                data:{
                    user_id: $scope.USER.ID,
                    limit: 60,
                    offset: $scope.paginateData,
                    LOADER_CARREGANDO: false
                }
            },
            data =>{
                if(data.feed.length > 0){
                    $scope.loading = true;
                    $scope.FEED = [...$scope.FEED, ...data.feed];
                }else{
                    $scope.loading = false;
                }
                $('#loader_feed_social').loadingFeed('hidden');

            }
        )
    };

    /**
     * Função responsável pelo controle do estado do relacionamento no perfil.
     * @param {string} type_ - tipo do estado de follow
     * @param {boolean} unfollow - se vai ou não dar desvincular
     * @returns {boolean} status do follow
     * */
    $scope.manageStateFollowProfile = function(type_, unfollow = true ){
        let action_ =  type_ === 'follow' ? 'redesocial/seguirusuario' :'redesocial/deixardeseguir';
        return Factory.ajax(
            {
                action: action_,
                data:{user_id: $scope.USER.ID, unfollow}
            },
            data=>{
                return data.status;
            }
        );
    };

    /**
     * Função responsável por gerenciar o estado do relacionamento no perfil.
     * @param {HTMLElement} el - elemento de referência do botão.
     * */
    $scope.flowOfFollowsManage = function(el){
        let followButton = $(el).closest('.follow_states');
        let typeOfFollowState = $(followButton).data('followstate');
        let followObj ={};
        typeOfFollowState =='seguir' ?
            followObj = {type: 'follow', unfollow: false} :
            followObj = {type: 'unfollow', unfollow: true};
        new Promise((resolve, reject) => {
            resolve($scope.manageStateFollowProfile(followObj.type, followObj.unfollow));
        })
            .then(status => {
                if(status){
                    let newState ='';
                    switch (typeOfFollowState) {
                        case'seguir':
                            newState =  'pendente';
                            if($scope.USER.TIPO_CONTA == 'PUBLICO'){
                                let old_value = $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text();
                                $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text(parseInt(old_value) + 1);
                                $('.show_follows_count.profile_seguidores').find('span.text_show.ng-binding').text( $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text() == 1 ? 'Seguidor' : 'Seguidores');
                                newState = 'seguindo';
                            }

                            $('.follow_states').removeClass('follow_profile').addClass('followed_profile').text($rootScope.capitalizeString(newState)).data('followstate',newState);
                            break;
                        case'seguindo':
                        case'pendente':
                            newState =  'seguir';
                            $('.follow_states').removeClass('followed_profile').addClass('follow_profile').html(`<i class="mdi-social-person-add"></i> ${$rootScope.capitalizeString(newState)}`).data('followstate',newState);
                            let old_value = $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text();
                            if(typeOfFollowState =='seguindo'){
                                $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text(parseInt(old_value) - 1);
                                $('.show_follows_count.profile_seguidores').find('span.text_show.ng-binding').text( $('.show_follows_count.profile_seguidores').find('span.number_show.ng-binding').text() == 1 ? 'Seguidor' : 'Seguidores');
                            }
                            if($scope.USER.TIPO_CONTA =='PRIVADO' && $scope.USER.PRIVACIDADE =='PUBLICO' && typeOfFollowState =='seguindo'){
                                var html = `<div class="no_permitted_feed">
                                                    <div class="content_icon_no_permitted_feed">
                                                        <i class="mdi mdi-action-lock-outline"></i>
                                                    </div>
                                                    <div class="content_text_no_permitted_feed">
                                                        <span style="font-weight: normal">Conta privada</span>
                                                    </div>
                                                </div>`;

                                $('.list_of_profile_content').find('.list_social').remove();
                                $('.title_feed').after(html);
                            }
                            break;
                    }
                }
                $route.reload();
            });
    };

    /**
     * Função responsável por pegar o elemento de acordo com o clique e a necessidade.
     * @param {HTMLElement} el - elemento de referência para capturar o elemento necessário.
     * @param {string} class_ - classe de referência para capturar o elemento necessário.
     * @returns {HTMLElement} - elemento desejado.
     * */
    $scope.getClickedElement = function(el, class_){
        return $(el).hasClass(class_) ? el : $(el).closest(`.${class_}`);
    };

    /**
     * Função reponsável pela ação do like na página.
     * @param {HTMLElement} el - elemento de referencia para coletar os dados necessarios e fazer a ação.
     * */
    $scope.GiveLike = function(el){
        let clickedElement =  $scope.getClickedElement(el, 'single_feed');
        let transacao = $(clickedElement).data('feed');
        let likeElement =  $(clickedElement).find('.like_feed_button > i');
        let qtdLikesElement = $(clickedElement).find('.show_likes_count');
        let classLike ='';
        let checkIfTypeLike = false;
        if($(likeElement).hasClass('no_like')){
            classLike = ['mdi-action-favorite','liked'];
            checkIfTypeLike = true;
        }else{
            classLike = ['mdi-action-favorite-outline','no_like'];
        }
        $(clickedElement).find('.like_feed_button > i').removeAttr('class').addClass(classLike);
        Factory.ajax(
            {
                action:'redesocial/curtir',
                data: {transacao}
            },
            data => {
                $scope.manageCountOfLikes(checkIfTypeLike, qtdLikesElement, likeElement);
            }
        )
    };

    /**
     * Função responsável por gerenciar o contador de likes.
     * @param {boolean} checker - verifica se a ação foi like ou deslike.
     * @param {HTMLElement} qtdLikesElement - elemento da quantidade na tela.
     * @param {HTMLElement} likeElement - elemento do icon do like.
     * */
    $scope.manageCountOfLikes = function(checker, qtdLikesElement, likeElement){
        if(checker){
            qtdLikesElement.length ?
                $(qtdLikesElement).addClass('liked_number').text(parseInt($(qtdLikesElement).text()) + 1) :
                $(likeElement).before('<div class="show_likes_count liked_number">1</div>');
        }else{
            $(qtdLikesElement).removeClass('liked_number').text(parseInt($(qtdLikesElement).text()) - 1);
            if(parseInt($(qtdLikesElement).text()) < 1 )  $(qtdLikesElement).remove();
        }
    };

    $(()=>{
        $rootScope.initList(['list_of_profile_content'], false, 60);
        $scope.initProfileFeedScroll();
    });

});

app.controller('FeedTransferirSocial', function($rootScope, $scope, $route)  {
    /*----------------------- SETTINGS VARIABLE-------------------------*/
    $rootScope.TITULO_LAYERS = !Layers.VALS ? "Transferir" : "Adicionar";
    $rootScope.PLACEHOLDER = !Layers.VALS ? "Quem você quer transferir?" : "Pesquise um usuário";
    $rootScope.REDIRECT = '';
    $rootScope.NO_WHATSAPP = false;
    $scope.paginateData = 0;
    $scope.loading = true;
    $scope.default_image = 'img/login_default.png';
    $scope.UserID = Login.getData().ID;
    $scope.FOLLOW =[];
    $scope.SearchFollowsTransferirSocial = null;
    $scope.check_type = Layers.VALS;
    /*----------------------- FIM -------------------------*/


    /**
     * Função responsável por iniciar o evento de keyup para pesquisa de usuários.
     * */

    $scope.SearchFollowsTransferirSocial = function(){
        let searchble_time_out = null;
        $('.search_in_list_follow_').unbind('keyup').live('keyup',function(){
            if(searchble_time_out != null)
                window.clearTimeout(searchble_time_out);
            let username = $(this).val();
            if(username){
                searchble_time_out = setTimeout(function(){
                    $scope.paginateData = '0';
                    let has_users = $scope.getData(username);
                    has_users.then(response =>{
                        if(response.follow == ''){
                            $scope.FOLLOW = [];
                            $('.non_user_transfer_found').css('display','block');
                        }else{
                            $('.non_user_transfer_found').css('display','none');
                        }
                        $scope.initObserver();
                    });

                }, 500);
            }else{
                $scope.$apply(function(){
                    $scope.FOLLOW = [];
                });
                $('.non_user_transfer_found').css('display','none');
            }
        });
    };


    /**
     * Função responsável por trazer usuarios de acordo com o solicitado.
     * @param {string} username - string digitada por usuário.
     * */
    $scope.getData = function(username){
        return Factory.ajax(
            {
                action:'redesocial/usuarios',
                data:{
                    limit:60,
                    offset: $scope.paginateData,
                    username
                }
            },
            data =>{
                $scope.loading = data.follow.length > 0;
                if($scope.loading){
                    if($scope.paginateData == 0){
                        $scope.FOLLOW = data.follow;
                    }else{
                        $scope.FOLLOW =[...$scope.FOLLOW, ...data.follow];
                    }
                }

            }
        )
    };

    /**
     * Função responsável por iniciar o Observer em elementos.
     * */
    $scope.initObserver = function(){
        $scope.initObserverElement();
    };

    /**
     * Função responsável instânciar o observer e configurar.
     * */
    $scope.initObserverElement = function(){
        let targetElement = document.querySelector('.list_search_content');
        let observerConfigs ={
            attributes:false,
            childList:true,
            subtree:false
        };
        let mutationObserverObj = new MutationObserver(function(data){
            if($scope.FOLLOW != '') {
                if(!$('.list_reciver_content_search').hasClass('resizedList')) $rootScope.initList(['list_reciver_content_search'], false, 30);
                $scope.initFollowScroll();
            }

        });
        mutationObserverObj.observe(targetElement, observerConfigs);
    };

    /**
     * Função responsável por iniciar o sroll de usuários.
     * */
    $scope.initFollowScroll = function(){
        document.getElementsByClassName('list_reciver_content_search')[0].addEventListener('scroll',function(event){
            let elementToCalc = document.getElementsByClassName('list_reciver_content_search')[0];
            let totalHeight = elementToCalc.scrollHeight;
            let ScrollPosition = elementToCalc.scrollTop + elementToCalc.clientHeight;
            if((totalHeight == ScrollPosition || totalHeight == (ScrollPosition + 1)) && $scope.loading){
                $scope.loading = false;
                $scope.paginateData ++;
                $scope.getData( $('.search_in_list_follow_').val());
            }
        });
    };

    $scope.defaultImage = function(img){
        img.onerror = "";
        img.src = $scope.default_image;
    };

    /**
     * Função responsável por verificar se uma imagem está quebrada e colocar uma padrão
     * @param {HTMLElement} img - dom da imagem para verificar
     * */
    $scope.defaultImage = function(img){
        img.onerror = "";
        img.src = $scope.default_image;
    };


    /**
     * Função responsável por gerenciar o estado do relacionamento entre o usuário e o follow.
     * @param {number} user_id - id do follow clicado.
     * @param {HTMLElement} element - elemento clicado.
     * @param {boolean} [unfollow=false] - se vai ou não desfazer o relacionamento.
     * */
    $scope.manageStateFollow = function(user_id, element, unfollow = true){
        let typeOfButton = $(element).data('type');
        let action_ =  $(element).data('status') === 'follow' ? 'seguirusuario' : 'deixardeseguir';
        Factory.ajax(
            {
                action:`redesocial/${action_}`,
                data: {user_id, unfollow}
            },
            data => {
                $scope.setManageStateFollow(typeOfButton,element, data);

            }
        );
    };

    /**
     * Função responsável por fazer as alterações dos elementos da tela pós requisição.
     * @param {string} typeOfButton - estado anterior do botão.
     * @param {HTMLElement} element - elemento clicado.
     * @param {array} data - resposta da requisição.
     * */
    $scope.setManageStateFollow = function(typeOfButton,element, data){
        switch (typeOfButton) {
            case'deixar_seguir':
                $(element)
                    .data({'type':'seguir', 'status':'follow'})
                    .removeClass('is_relacionated');
                $(element).find('i').removeClass('mdi-social-people').addClass('mdi-social-person-add');
                break;
            case'seguir':
                let buttonObj ={
                    type:'deixar_seguir',
                    class:'mdi-social-people'
                };
                if(data.status_solicitacao === 'P'){
                    buttonObj.type ='pendente';
                    buttonObj.class ='mdi-social-person-outline';
                }
                $(element).data({'type':buttonObj.type, 'status':'unfollow'}).addClass('is_relacionated');
                $(element).find('i').removeClass('mdi-social-person-add').addClass(buttonObj.class);
                break;
            case'pendente':
                $(element).data({'type':'seguir','status':'follow'}).removeClass('is_relacionated');
                $(element).find('i').removeClass('mdi-social-person-outline').addClass('mdi-social-person-add');
                break;
        }

        $route.reload();
    };


    $(()=>{
        $('.search_in_list_follow_').val('');
        $scope.SearchFollowsTransferirSocial();
        $('.search_content').on('click',function(e){
            e.preventDefault();
            $(this).find('.search_box_content input').trigger('focus');
        });
    })
});

app.controller('MinhaCarteiraLayer', async function($rootScope, $scope) {
    $rootScope.BARRA_SALDO = false;
    $scope.PARAMS = Layers.VALS;
    $scope.TITULO_LAYERS = Layers.VALS ? "Finalizar transferência":"Minha Carteira";
    $rootScope.NO_WHATSAPP = false;
    $rootScope.FORMA_PAGAMENTO = null;
    $rootScope.ID_USER_TRANSFER = Layers.VALS || null;
    $scope.initControllerTransferWindow = await function(){
        Factory.ajax(
            {
                action: 'cadastro/minhacarteira',
                data: {
                    ID: $rootScope.ID_USER_TRANSFER
                }
            },
            data =>{
                $rootScope.TRANSFERIR = data.TRANSFERIR;
                $rootScope.FORMAS_PG = data.FORMAS_PG;
                $rootScope.USAR_MEU_SALDO_TRANSFERIR = 1;
                $rootScope.VALOR_PG = 50;
                $rootScope.GANHE_ITEM = data.GANHE_ITEM;
                $rootScope.GANHE = data.GANHE_ITEM[50];
                $scope.itens = [
                    {
                        value: 30,
                        GANHE: 0,
                        outro_valor: 1,
                        GANHE: data.GANHE_ITEM[30]
                    },
                    {
                        value: 50,
                        active: 1,
                        popular: 1,
                        GANHE: data.GANHE_ITEM[50]
                    },
                    {
                        value: 70,
                        GANHE: data.GANHE_ITEM[70]
                    },
                    {
                        value: 100,
                        GANHE: data.GANHE_ITEM[100]
                    },
                    {
                        value: 150,
                        GANHE: data.GANHE_ITEM[150]
                    },
                    {
                        value: 300,
                        GANHE: data.GANHE_ITEM[300]
                    }
                ];

                // PagSeguro
                var cc = CC.get();
                var add = false;
                $.each($rootScope.FORMAS_PG, function (idx, f_pg) {
                    switch (f_pg.GATEWAY) {
                        case 'PAGSEGURO':
                            $rootScope.pagseguro(0, null, 1000);
                            break;
                        case 'JUNO':
                        case 'GETNET':
                        case 'VR':
                        case 'VA':
                            var active = 1;
                            var count = 0;
                            $rootScope.FORMAS_PG[idx]['LST'] = [];
                            $.each(cc, function (ID, vals) {
                                add = false;
                                switch (f_pg.GATEWAY) {
                                    case 'JUNO':
                                    case 'GETNET':
                                        add = vals.TIPO_CC == 'CC/DEBITO' || !vals.TIPO_CC;
                                        break;
                                    case 'VR':
                                        add = vals.TIPO_CC == 'VR';
                                        break;
                                    case 'VA':
                                        add = vals.TIPO_CC == 'VA';
                                        break;
                                }
                                if (add) {
                                    $rootScope.FORMAS_PG[idx]['LST'].push({
                                        ACTIVE: active,
                                        ID: ID,
                                        IMG: config.url_api() + "skin/default/images/bandeira_cc/" + vals.BANDEIRA + ".png",
                                        TEXT: vals.TEXT,
                                        BANDEIRA: vals.BANDEIRA,
                                        VALS: {1: vals.HASH}
                                    });
                                    active = 0;
                                    count++;
                                }
                            });
                            if (count) {
                                $rootScope.FORMAS_PG[idx]['LST'].push({
                                    'ID': 0,
                                    'ACTIVE': 0,
                                    'TEXT': 'Novo cartão'
                                });
                            }
                            break;
                    }
                });
            }
        );
    }();

    $(()=>{
        $scope.outroValor = function (item) {
            var valor = parseInt($('#outro_valor').val());
            if(valor <= 5)
                valor = 5;
            if (valor > 999)
                valor = 999;
            $('#outro_valor').val(valor);
            $rootScope.GANHE = [];
            $.each($rootScope.GANHE_ITEM, function (item_valor, item_each) {
                if (parseInt(valor) >= parseInt(item_valor))
                    $rootScope.GANHE = item_each;
            });
            $rootScope.VALOR_PG = valor;
            item.value = valor;
        };
        $scope.select = function (item) {
            $.each($scope.itens, function (idx, item_each) {
                item_each.active = 0;
            });
            item.active = 1;
            $rootScope.VALOR_PG = item.value;
            $rootScope.GANHE = $rootScope.GANHE_ITEM[item.value];
            if (!$rootScope.GANHE) {
                $rootScope.GANHE = [];
                $.each($rootScope.GANHE_ITEM, function (item_valor, item_each) {
                    if (parseInt(item.value) >= parseInt(item_valor))
                        $rootScope.GANHE = item_each;
                });
            }
            if (item.outro_valor)
                $('#outro_valor').focus();
        };

        $rootScope.initList(['minha_carteira_layer'], true, );
    });
});

app.controller('HistoricoTransacoesGet', function($rootScope, $scope) {
    $rootScope.border_top = 1;
    $rootScope.TITULO_LAYERS = "Compras";

    $scope.initControllerHistorico = function(){
        Factory.ajax(
            {
                action: 'cadastro/historicotransacoes',
                data: {
                    ID: Layers.VALS
                },
            },
            data =>{
                $scope.REG = data;
            }
        );
    }();

    $scope.estornar = function() {
        $rootScope.location('#!/pedido-estorno/' + $scope.REG.ID);
    };

    $scope.redirecionarParaSac = function () {
        $rootScope.location('#!/sac/' + $scope.REG.SAC);
    };
    $(()=>{
        $rootScope.initList(['historico_content'], false, 70);
    });
});