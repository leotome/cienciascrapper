'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        let recordId = this.getURLParameter('id');
        this.retrieveCurriculum(recordId);
    });



})(jQuery);


function retrieveCurriculum(recordId){
    retrieveHeader(recordId);
    retrieveLanguages(recordId);
    retrieveEducation(recordId);
    retrieveAffiliations(recordId);
    retrieveProjects(recordId);
    retrieveOutputs(recordId);
    retrieveActivities(recordId);
    retrieveDistinctions(recordId);
}

function retrieveHeader(recordId){
    let request_url = getAPIURI() + '/curriculum/header/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }

        var header = result[0];
        document.title = header.NomeCompleto + ' | ' + 'CiênciaScrapper';

        let cienciavitae_header_fullname = document.getElementById('cienciavitae_header_fullname');
        cienciavitae_header_fullname.innerHTML = '<h2>' + header.NomeCompleto + '</h2>';
        let cienciavitae_header_resumo = document.getElementById('cienciavitae_header_resumo');
        cienciavitae_header_resumo.innerHTML = (header.Resumo != undefined) ? '<h6 style="text-align:justify;">' + header.Resumo + '</h6>' : '';

        
        let dataExtracao = new Date(header.DataExtracao);
        let dataExtracao_Text = 'Data de extração: ' + dataExtracao.toUTCString() + ((header.UltimaExtracao) ? ' (última extração)' : '') + ''
        let allVersions_Text = `<a href="/versions.html?cienciaId=${header.CienciaId}" target="_blank" style="color: blue; text-decoration: underline;">Ver lista de versões deste currículo</a>`;

        var headerInfo = `<table style="width:100%; border-bottom: 0px;"><tr style="border-bottom: 0px;"><td>${dataExtracao_Text}</td><td style="text-align:right;">${allVersions_Text}</td></tr></table><br/>`;

        let cienciavitae_header_auditinfo = document.getElementById('cienciavitae_header_auditinfo');
        cienciavitae_header_auditinfo.innerHTML = headerInfo;
        

        const summaryText = 'Identificação';
        let details_Header = `<details open><summary>${summaryText}</summary>`;

        const header_TypeElement_Open = '<h5>';
        const header_TypeElement_Close = '</h5>';

        const attribute_TypeElement_Open = '<h6>';
        const attribute_TypeElement_Close = '</h6>';

        const attributeValue_TypeElement_Open = '<p>';
        const attributeValue_TypeElement_Close = '</p>';
        
        let personalIdentification_Header = header_TypeElement_Open + 'IDENTIFICAÇÃO PESSOAL'    + header_TypeElement_Close;
        let citationNames_Header          = header_TypeElement_Open + 'NOMES DE CITAÇÃO'         + header_TypeElement_Close;
        let identifiers_Header            = header_TypeElement_Open + 'IDENTIFICADORES DE AUTOR' + header_TypeElement_Close;
        let addresses_Header              = header_TypeElement_Open + 'MORADAS'                  + header_TypeElement_Close;
        let emails_Header                 = header_TypeElement_Open + 'E-MAILS'                  + header_TypeElement_Close;
        let websites_Header               = header_TypeElement_Open + 'WEBSITES'                 + header_TypeElement_Close;
        let fields_Header                 = header_TypeElement_Open + 'DOMÍNIOS DE ATUAÇÃO'      + header_TypeElement_Close;

        let personalIdentification_FullName = attribute_TypeElement_Open + 'Nome completo' + attribute_TypeElement_Close;

        let identifiers_CienciaId    = attribute_TypeElement_Open + 'Ciência ID' + attribute_TypeElement_Close;
        let identifiers_OrcidId      = attribute_TypeElement_Open + 'ORCID iD' + attribute_TypeElement_Close;
        let identifiers_GScholarId   = attribute_TypeElement_Open + 'Google Scholar ID' + attribute_TypeElement_Close;
        let identifiers_ResearcherId = attribute_TypeElement_Open + 'Researcher Id' + attribute_TypeElement_Close;
        let identifiers_ScopusId     = attribute_TypeElement_Open + 'Scopus Author Id' + attribute_TypeElement_Close;

        let personalIdentification_Container = '<div>' + personalIdentification_Header + 
                                               personalIdentification_FullName + 
                                               attributeValue_TypeElement_Open + header.NomeCompleto + attributeValue_TypeElement_Close +
                                               '</div>';

        let citationNames_Container = (header.NomesCitacao != undefined) ? '<div>' + citationNames_Header + attributeValue_TypeElement_Open + header.NomesCitacao + attributeValue_TypeElement_Close + '</div>' : '';
        
        let identifiers_Container = '<div>' + identifiers_Header +
                                    ((header.CienciaId != undefined)       ? identifiers_CienciaId    + attributeValue_TypeElement_Open + header.CienciaId       + attributeValue_TypeElement_Close : '') + 
                                    ((header.OrcidId != undefined)         ? identifiers_OrcidId      + attributeValue_TypeElement_Open + header.OrcidId         + attributeValue_TypeElement_Close : '') + 
                                    ((header.GoogleScholarId != undefined) ? identifiers_GScholarId   + attributeValue_TypeElement_Open + header.GoogleScholarId + attributeValue_TypeElement_Close : '') + 
                                    ((header.ResearcherId != undefined)    ? identifiers_ResearcherId + attributeValue_TypeElement_Open + header.ResearcherId    + attributeValue_TypeElement_Close : '') + 
                                    ((header.ScopusAuthorId != undefined)  ? identifiers_ScopusId     + attributeValue_TypeElement_Open + header.ScopusAuthorId  + attributeValue_TypeElement_Close : '') + 
                                    '</div>';

        let addresses_Container = (header.Moradas != undefined) ? '<div>' + addresses_Header + attributeValue_TypeElement_Open + header.Moradas + attributeValue_TypeElement_Close + '</div>' : '';

        let emails_Container = (header.Emails != undefined) ? '<div>' + emails_Header + attributeValue_TypeElement_Open + header.Emails + attributeValue_TypeElement_Close + '</div>' : '';

        /*
        let websites_Container = '<div>' + websites_Header +
                                 header.Websites + 
                                 '</div>';
        */
        let fields_Container = (header.DominiosAtuacao != undefined) ? '<div>' + fields_Header + attributeValue_TypeElement_Open + header.DominiosAtuacao + attributeValue_TypeElement_Close + '</div>' : '';
        
        let result_HTML = '';
        result_HTML += details_Header + personalIdentification_Container + citationNames_Container + identifiers_Container + addresses_Container + emails_Container + fields_Container + '</details>';
        let cienciavitae_header = document.getElementById('cienciavitae_header');
        cienciavitae_header.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
    })
    .catch(async (error) => {
        alert('retrieveHeader().error = ' + JSON.stringify(error));
    })
}

function retrieveLanguages(recordId){
    let request_url = getAPIURI() + '/curriculum/languages/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Idiomas';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let table_Header = '<thead><tr><th>Idioma</th><th>Conversação</th><th>Leitura</th><th>Escrita</th><th>Compreensão</th><th>Peer-review</th></tr></thead>';
            let table_Lines = '';

            result.forEach(record => {
                let language = (record.Idioma != undefined) ? record.Idioma : '';
                let convers = (record.Conversacao != undefined) ? record.Conversacao : '';
                let read = (record.Leitura != undefined) ? record.Leitura : '';
                let write = (record.Escrita != undefined) ? record.Escrita : '';
                let coompr = (record.Compreensao != undefined) ? record.Compreensao : '';
                let peerR = (record.PeerReview != undefined) ? record.PeerReview : '';
                let table_Line = `<tr><td>${language}</td><td>${convers}</td><td>${read}</td><td>${write}</td><td>${coompr}</td><td>${peerR}</td></tr>`;
                table_Lines += table_Line;
            })

            let result_HTML = details_Header + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table>' + '</details>';
            let cienciavitae_idioma = document.getElementById('cienciavitae_idioma');
            cienciavitae_idioma.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveLanguages().error = ' + JSON.stringify(error));
    })
}

function retrieveEducation(recordId){
    let request_url = getAPIURI() + '/curriculum/education/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Formação';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let table_Header = '<thead><tr><th>Período</th><th>Descrição</th><th>Classificação</th></tr></thead>';
            let table_Lines = '';

            result.forEach(record => {
                let periodoInicio_Text = (record.PeriodoInicio != undefined) ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoInicio).getFullYear()) : undefined;
                let periodoFim_Text    = (record.PeriodoFim != undefined)    ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoFim).getFullYear())       : undefined;
                let periodoText = (periodoInicio_Text != undefined) ? `${periodoInicio_Text} - ${periodoFim_Text}` : `${periodoFim_Text}`;
                if(record.Concluido){
                    periodoText += '<br/><sub>Concluído</sub>';
                }
                let classificacaoText = (record.Classificacao != undefined) ? record.Classificacao : '';
                let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;">${periodoText}</td><td style="vertical-align:top; width: 70%;">${record.Descricao}</td><td style="white-space:nowrap; vertical-align:top;">${classificacaoText}</td></tr>`;
                table_Lines += table_Line;
            })

            let result_HTML = details_Header + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table>' + '</details>';
            let cienciavitae_formacao = document.getElementById('cienciavitae_formacao');
            cienciavitae_formacao.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveEducation().error = ' + JSON.stringify(error));
    })
}

function retrieveAffiliations(recordId){
    let request_url = getAPIURI() + '/curriculum/affiliations/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Percurso profissional';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let allTypes_Container = '';

            let GroupedTypes = [];
            result.forEach(record => {
                let item = GroupedTypes.find(({type}) => type == record.Tipo);
                if(item != undefined){
                    item.values.push(record);
                } else {
                    let newItem = {type : record.Tipo, values : []};
                    newItem.values.push(record);
                    GroupedTypes.push(newItem);
                }
            })

            GroupedTypes.forEach(item => {
                let type_Title = '<h5><b>' + item.type + '</b></h5>';
                let table_Header = '<thead><tr><th>Período</th><th>Descrição</th><th>Empregador</th></tr></thead>';
                let table_Lines = '';
                item.values.forEach(record => {
                    let periodoInicio_Text = (record.PeriodoInicio != undefined) ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoInicio).getFullYear()) : undefined;
                    let periodoFim_Text    = (record.PeriodoFim != undefined)    ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoFim).getFullYear())       : undefined;
                    let periodoText = (periodoFim_Text != undefined) ? `${periodoInicio_Text} - ${periodoFim_Text}` : `${periodoInicio_Text} - Atual`;
                    if(record.Atual){
                        periodoText += '<br/><sub>Atual</sub>';
                    }
                    let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;width: 20%;">${periodoText}</td><td style="vertical-align:top; width: 60%;">${record.CategoriaInstituicao}</td><td style="vertical-align:top;width: 20%;">${record.Empregador}</td></tr>`;
                    table_Lines += table_Line;
                })
                allTypes_Container += type_Title + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table><br/>';
            })

            let result_HTML = details_Header + allTypes_Container + '</details>';
            let cienciavitae_percurso_profissional = document.getElementById('cienciavitae_percurso_profissional');
            cienciavitae_percurso_profissional.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveAffiliations().error = ' + JSON.stringify(error));
    })
}

function retrieveProjects(recordId){
    let request_url = getAPIURI() + '/curriculum/projects/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Projetos';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let allTypes_Container = '';

            let GroupedTypes = [];
            result.forEach(record => {
                let item = GroupedTypes.find(({type}) => type == record.Tipo);
                if(item != undefined){
                    item.values.push(record);
                } else {
                    let newItem = {type : record.Tipo, values : []};
                    newItem.values.push(record);
                    GroupedTypes.push(newItem);
                }
            })

            GroupedTypes.forEach(item => {
                let type_Title = '<h5><b>' + item.type + '</b></h5>';
                let table_Header = '<thead><tr><th>Período</th><th>Designação</th><th>Financiadores</th></tr></thead>';
                let table_Lines = '';
                item.values.forEach(record => {
                    let periodoInicio_Text = (record.PeriodoInicio != undefined) ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoInicio).getFullYear()) : undefined;
                    let periodoFim_Text    = (record.PeriodoFim != undefined)    ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoFim).getFullYear())       : undefined;
                    let periodoText = (periodoFim_Text != undefined) ? `${periodoInicio_Text} - ${periodoFim_Text}` : `${periodoInicio_Text} - Atual`;
                    let financiadores_Text = (record.Financiadores != undefined) ? record.Financiadores : '';
                    let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;width: 20%;">${periodoText}</td><td style="vertical-align:top; width: 60%;">${record.Designacao}</td><td style="vertical-align:top;width: 20%;">${financiadores_Text}</td></tr>`;
                    table_Lines += table_Line;
                })
                allTypes_Container += type_Title + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table><br/>';
            })

            let result_HTML = details_Header + allTypes_Container + '</details>';
            let cienciavitae_projetos = document.getElementById('cienciavitae_projetos');
            cienciavitae_projetos.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }        
    })
    .catch(async (error) => {
        alert('retrieveProjects().error = ' + JSON.stringify(error));
    })
}

function retrieveOutputs(recordId){
    let request_url = getAPIURI() + '/curriculum/outputs/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length == 0){
            return;
        }

        // To facilitate the iteration of records, we will group them by type and categories.

        // A type has many categories. A category has multiple items/outputs.
        // A item/output has one category. A category is contained in a type.
        
        // We will then reflect this data structure.

        let outputItems = [];

        // Step #1: Get distinct Types

        result.forEach(record => {
            let item = outputItems.find(({Tipo}) => Tipo == record.Tipo);
            if(item == undefined){
                let newItem = {
                    Tipo : record.Tipo,
                    Categorias : []
                }
                outputItems.push(newItem);
            }
        })

        // Step #2: Get distinct Categories per Type

        result.forEach(record => {
            let item = outputItems.find(({Tipo}) => Tipo == record.Tipo);
            let categories = item.Categorias.find(({Categoria}) => Categoria == record.Categoria);
            if(categories == undefined){
                let newItem = {
                    Categoria : record.Categoria,
                    Publicacoes : []
                }
                item.Categorias.push(newItem);
            }
        })

        // Step #3: Add items/outputs for each type + category

        result.forEach(record => {
            let item = outputItems.find(({Tipo}) => Tipo == record.Tipo);
            let categories = item.Categorias.find(({Categoria}) => Categoria == record.Categoria);
            categories.Publicacoes.push(record.Descricao);
        })

        // Step #4: Add to DOM

        let result_HTML = '';

        outputItems.forEach(item => {
            let type_Title = '<h5><b>' + item.Tipo + '</b></h5>';
            let type_Table = '<table style="width: 100%;"><tbody>';
            item.Categorias.forEach(categoria => {
                let category_Line = `<tr><td style="width: 40%; vertical-align:top;">${categoria.Categoria}</td><td style="width: 60%;"><ul>`
                let outputs = categoria.Publicacoes.map(output => {
                    return `<li>${output}</li>`
                })
                category_Line += outputs.join("");
                category_Line += '</ul></td></tr>';
                type_Table += category_Line;
            })
            type_Table += '</tbody></table>'
            result_HTML += type_Title + type_Table;
        })

        const summaryText = 'Produções';
        let details_Header = `<details open><summary>${summaryText}</summary>`;

        let cienciavitae_producoes = document.getElementById('cienciavitae_producoes');
        cienciavitae_producoes.innerHTML = '<div class="col-lg-12">' + details_Header + result_HTML + '</details>' + '</div>';
    })
    .catch(async (error) => {
        alert('retrieveOutputs().error = ' + JSON.stringify(error));
    })
}

function retrieveActivities(recordId){
    let request_url = getAPIURI() + '/curriculum/activities/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Atividades';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let allTypes_Container = '';

            let GroupedTypes = [];
            result.forEach(record => {
                let item = GroupedTypes.find(({type}) => type == record.Tipo);
                if(item != undefined){
                    item.values.push(record);
                } else {
                    let newItem = {type : record.Tipo, values : []};
                    newItem.values.push(record);
                    GroupedTypes.push(newItem);
                }
            })

            GroupedTypes.forEach(item => {
                let type_Title = '<h5><b>' + item.type + '</b></h5>';
                let table_Header = '<thead><tr><th>Período</th><th>Descrição</th><th>Instituição/Organização</th></tr></thead>';
                let table_Lines = '';
                item.values.forEach(record => {
                    let periodoInicio_Text = (record.PeriodoInicio != undefined) ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoInicio).getFullYear()) : undefined;
                    let periodoFim_Text    = (record.PeriodoFim != undefined)    ? String(new Date(record.PeriodoInicio).getMonth()+1).padStart(2, "0") + '-' + String(new Date(record.PeriodoFim).getFullYear())       : undefined;
                    let periodoText = (periodoFim_Text != undefined) ? `${periodoInicio_Text} - ${periodoFim_Text}` : `${periodoInicio_Text} - Atual`;
                    let cursoInstituicao_Text = (record.CursoInstituicao != undefined) ? record.CursoInstituicao : '';
                    if(record.Atual){
                        periodoText += '<br/><sub>Atual</sub>';
                    }
                    let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;width: 20%;">${periodoText}</td><td style="vertical-align:top; width: 60%;">${record.Descricao}</td><td style="vertical-align:top;width: 20%;">${cursoInstituicao_Text}</td></tr>`;
                    table_Lines += table_Line;
                })
                allTypes_Container += type_Title + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table><br/>';
            })

            let result_HTML = details_Header + allTypes_Container + '</details>';
            let cienciavitae_atividades = document.getElementById('cienciavitae_atividades');
            cienciavitae_atividades.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveActivities().error = ' + JSON.stringify(error));
    })
}

function retrieveDistinctions(recordId){
    let request_url = getAPIURI() + '/curriculum/distinctions/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
            return;
        }
        if(result.length > 0){
            const summaryText = 'Distinções';
            let details_Header = `<details open><summary>${summaryText}</summary>`;
            let allTypes_Container = '';

            let GroupedTypes = [];
            result.forEach(record => {
                let item = GroupedTypes.find(({type}) => type == record.Tipo);
                if(item != undefined){
                    item.values.push(record);
                } else {
                    let newItem = {type : record.Tipo, values : []};
                    newItem.values.push(record);
                    GroupedTypes.push(newItem);
                }
            })

            GroupedTypes.forEach(item => {
                let type_Title = '<h5><b>' + item.type + '</b></h5>';
                let table_Header = '<thead><tr><th>Ano</th><th>Descrição</th></tr></thead>';
                let table_Lines = '';
                item.values.forEach(record => {
                    let year_Text = (record.Ano != undefined) ? record.Ano : '';
                    let description_Text = (record.Descricao != undefined) ? record.Descricao : '';
                    let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;width: 30%;">${year_Text}</td><td style="vertical-align:top; width: 70%;">${description_Text}</td></tr>`;
                    table_Lines += table_Line;
                })
                allTypes_Container += type_Title + '<table style="width: 100%;">' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table><br/>';
            })

            let result_HTML = details_Header + allTypes_Container + '</details>';
            let cienciavitae_distincoes = document.getElementById('cienciavitae_distincoes');
            cienciavitae_distincoes.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveDistinctions().error = ' + JSON.stringify(error));
    })
}