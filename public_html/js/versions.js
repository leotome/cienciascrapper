'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        let cienciaId = this.getURLParameter('cienciaId');
        if(cienciaId != undefined){
            document.title = cienciaId + ' | ' + 'CiênciaScrapper';
            this.retrieveVersions(cienciaId);
        }
    });

})(jQuery);


function retrieveVersions(cienciaId){
    let request_url = getAPIURI() + '/curriculum/versions/' + cienciaId;
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
        let cienciavitae_versions = document.getElementById('cienciavitae_versions');

        if(result.length == 0){
            cienciavitae_versions.innerHTML = '<p>Não foi possível encontrar registos para o identificador indicado. Possivelmente não existem entradas.</p>'
            return;
        }

        var header = result[0];
        let cienciavitae_header_fullname = document.getElementById('cienciavitae_header_fullname');
        cienciavitae_header_fullname.innerHTML = '<h2>' + header.NomeCompleto + '</h2>';

        var result_HTML = '';

        var table_HTML = '<table style="width: 100%;">'
        var tableHeader_HTML = '<thead><tr><th>Data de extração</th><th>Nome completo</th><th>Nomes de citação</th></tr></thead>';

        result_HTML += table_HTML + tableHeader_HTML + '<tbody>';

        result.forEach(item => {
            var dateExtraction = new Date(item.DataExtracao).toUTCString();
            var fullName       = item.NomeCompleto;
            var citationNames  = (item.NomesCitacao != undefined) ? item.NomesCitacao : '';
            var tableLine_HTML = `<tr><td><a href="/curriculum.html?id=${item.Id}" target="_blank" style="color: blue; text-decoration: underline;">${dateExtraction}</a></td><td>${fullName}</td><td>${citationNames}</td></tr>`;
            result_HTML += tableLine_HTML;
        })

        result_HTML += '</tbody></table>';

        cienciavitae_versions.innerHTML = '<div class="col-lg-12">' + result_HTML + '</div>';

        let cienciavitae_download_new_version = document.getElementById('cienciavitae_download_new_version');
        cienciavitae_download_new_version.innerHTML = '<div class="col-lg-12">' + '<button type="button" onclick="doExtractNewVerrsion()">Extrair nova versão</button>' + '</div>';

    })
    .catch(async (error) => {
        alert('retrieveVersions().error = ' + JSON.stringify(error));
    })
}

function doExtractNewVerrsion(){
    $(".loader").fadeIn();
    $("#preloder").delay(200).fadeIn("slow");

    let cienciaId = getURLParameter('cienciaId');
    let request_url = getAPIURI() + '/scrape/cienciavitae';
    let request_params = {
        headers: {
            "Content-Type": "application/json",
        },
        method : "POST",
        body : JSON.stringify([cienciaId])
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        alert('A operação de extrair nova versão foi concluída com sucesso!');
        retrieveVersions(cienciaId);
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");
    })
    .catch(async (error) => {
        alert('doExtractNewVerrsion().error = ' + JSON.stringify(error));
    }) 


}