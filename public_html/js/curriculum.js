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
    console.log('id => ' + recordId);
    retrieveHeader(recordId);
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
        cienciavitae_header_resumo.innerHTML = (header.Resumo != undefined) ? '<h6>' + header.Resumo + '</h6>' : '';

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

        let citationNames_Container = '<div>' + citationNames_Header + 
                                      attributeValue_TypeElement_Open + header.NomesCitacao + attributeValue_TypeElement_Close +
                                      '</div>';                                               
        
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
                let periodoInicio_Text = (record.PeriodoInicio != undefined) ? new Date(record.PeriodoInicio).toLocaleDateString() : undefined;
                let periodoFim_Text    = (record.PeriodoFim != undefined)    ? new Date(record.PeriodoFim).toLocaleDateString()    : undefined;
                let periodoText = (periodoInicio_Text != undefined) ? `${periodoInicio_Text} - ${periodoFim_Text}` : `${periodoFim_Text}`;
                if(record.Concluido){
                    periodoText += '<br/><sub>Concluído</sub>';
                }
                let classificacaoText = (record.Classificacao != undefined) ? record.Classificacao : '';
                let table_Line = `<tr><td style="white-space:nowrap; vertical-align:top;">${periodoText}</td><td style="vertical-align:top; width: 70%;">${record.Descricao}</td><td style="white-space:nowrap; vertical-align:top;">${classificacaoText}</td></tr>`;
                table_Lines += table_Line;
            })

            let result_HTML = details_Header + '<table>' + table_Header + '<tbody>' + table_Lines + '</tbody>' + '</table>' + '</details>';
            let cienciavitae_formacao = document.getElementById('cienciavitae_formacao');
            cienciavitae_formacao.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';
        }
    })
    .catch(async (error) => {
        alert('retrieveEducation().error = ' + JSON.stringify(error));
    })
}

function retrieveAffiliations(recordId){
    let cienciavitae_percurso_profissional = document.getElementById('cienciavitae_percurso_profissional');
    let request_url = getAPIURI() + '/curriculum/affiliations/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveAffiliations().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveAffiliations().error = ' + JSON.stringify(error));
    })
}

function retrieveProjects(recordId){
    let cienciavitae_projetos = document.getElementById('cienciavitae_projetos');
    let request_url = getAPIURI() + '/curriculum/projects/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveProjects().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveProjects().error = ' + JSON.stringify(error));
    })
}

function retrieveOutputs(recordId){
    let cienciavitae_producoes = document.getElementById('cienciavitae_producoes');
    let request_url = getAPIURI() + '/curriculum/outputs/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveOutputs().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveOutputs().error = ' + JSON.stringify(error));
    })
}

function retrieveActivities(recordId){
    let cienciavitae_atividades = document.getElementById('cienciavitae_atividades');
    let request_url = getAPIURI() + '/curriculum/activities/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveActivities().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveActivities().error = ' + JSON.stringify(error));
    })
}

function retrieveDistinctions(recordId){
    let cienciavitae_distincoes = document.getElementById('cienciavitae_distincoes');
    let request_url = getAPIURI() + '/curriculum/distinctions/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveDistinctions().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveDistinctions().error = ' + JSON.stringify(error));
    })
}