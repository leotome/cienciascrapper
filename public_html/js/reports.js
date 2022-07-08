'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        this.doGetReportDefinitions();
    });



})(jQuery);

function doGetReportDefinitions(){
    let request_url = getAPIURI() + '/reports/definitions';
    fetch(request_url)
    .then(async (response) => {
        var result = await response.json();
        var success = response.ok;
        if(result.message && success == false){
            alert(result.message);
            return;
        } else if(success == false){
            alert('Um erro ocorreu. Por favor contacte o suporte.');
            return;
        }

        var table_HTML = '<table style="width: 100%;">'
        var tableHeader_HTML = '<thead><tr><th>#</th><th>Nome do relatório</th><th>Descrição</th></tr></thead>';
        var tableLines_HTML = '';

        result.forEach((item, index) => {
            let allVersions_Text = `<a href="/reportrun.html?id=${item.Id}" target="_self" style="color: blue; text-decoration: underline;">${item.Name}</a>`;
            let description_Text = (item.Description != undefined) ? item.Description : ''; 
            var tableLine_HTML = `<tr><td>${index+1}</td><td>${allVersions_Text}</td><td>${description_Text}</td></tr>`;
            tableLines_HTML += tableLine_HTML;
        })
        var result_HTML = '<div class="col-lg-12">' + table_HTML + tableHeader_HTML + '<tbody>' + tableLines_HTML + '</tbody>' + '</table>' + '</div>';
        var cienciavitae_reports_list = document.getElementById('cienciavitae_reports_list');
        cienciavitae_reports_list.innerHTML = result_HTML;

    })
    .catch(async (error) => {
        alert('Um erro ocorreu. Por favor contacte o suporte.');
        console.log(JSON.stringify(error));
    })
}