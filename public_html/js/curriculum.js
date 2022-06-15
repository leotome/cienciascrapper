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
    let cienciavitae_header = document.getElementById('cienciavitae_header');
    let request_url = getAPIURI() + '/curriculum/header/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveHeader().result => ', result);
    })
    .catch(async (error) => {
        alert('retrieveHeader().error = ' + JSON.stringify(error));
    })
}

function retrieveEducation(recordId){
    let cienciavitae_formacao = document.getElementById('cienciavitae_formacao');
    let request_url = getAPIURI() + '/curriculum/education/' + recordId;
    let request_params = {
        method : "GET"
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('retrieveEducation().result => ', result);
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