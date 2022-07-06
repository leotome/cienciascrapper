'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        let recordId = this.getURLParameter('id');
        this.doRunReport(recordId);
    });



})(jQuery);

var global_reportData;
var global_reservedNames;
var global_reportFilters;

function doRunReport(reportId){
    let request_url = getAPIURI() + '/reports/run/' + reportId;
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

        let cienciavitae_report_title = document.getElementById('cienciavitae_report_title');
        cienciavitae_report_title.innerHTML = '<h2>' + result.reportTitle + '</h2>';
        
        let reportData = result.reportData;
        let reportFilters = result.reportFilters;
        global_reportFilters = reportFilters;

        let cienciavitae_report_countresult = document.getElementById('cienciavitae_report_countresult');
        cienciavitae_report_countresult.innerHTML = `<b>Total de resultados:</b>&nbsp;${reportData.length}`;

        if(reportData.length == 0 && reportFilters.length == 0){
            return;
        }
        if(reportData.length == 0 && reportFilters.length > 0){
            let filters_HTML = '';
            reportFilters.forEach((reportFilter) => {
                let fieldLabel = `<label for="filter_param_${reportFilter.ParameterName}">${reportFilter.ParameterLabel}</label>`;
                let fieldInput = '';
                switch (reportFilter.Datatype) {
                    case 'Date':
                        fieldInput = `<input type="date" id="filter_param_${reportFilter.ParameterName}">`;
                        break;
                    case 'String':
                        fieldInput = `<input type="text" id="filter_param_${reportFilter.ParameterName}" placeholder="Lorem ipsum...">`;
                        break;
                    case 'Integer':
                        fieldInput = `<input type="number" id="filter_param_${reportFilter.ParameterName}">`;
                        break;
                    default:
                        break;
                } 
                filters_HTML += '<div class="col-lg-2">' + fieldLabel + fieldInput + '</div>';
            })
            let cienciavitae_report_filters = document.getElementById('cienciavitae_report_filters');
            cienciavitae_report_filters.innerHTML = '<div class="row">' + filters_HTML + '</div>' + '</br><div class="row"><div class="col-lg-12"><button type="button" onclick="doSubmitReport()">Submeter filtros</button></div></div></br>';

            let cienciavitae_report_result = document.getElementById('cienciavitae_report_result');
            cienciavitae_report_result.innerHTML = '<p>Por favor, defina filtros.</p>';
            return;
        }
        helperRenderTable(reportData);
    })
    .catch(async (error) => {
        alert('Um erro ocorreu. Por favor contacte o suporte.');
        console.log(JSON.stringify(error));
    })
}

function helperRenderTable(reportData){
    let reservedNames = ['URL', 'URL_Target'];

    let tableHeader = '';
    let tableLines = '';

    Object.keys(reportData[0]).forEach(column => {
        if(reservedNames.includes(column) == false){
            tableHeader += '<th>' + column + '</th>';
        }
    })

    reportData.forEach(record => {
        let recordURL = record["URL"];
        let columnTarget = record["URL_Target"];

        let tableLine = '';

        Object.keys(record).forEach(column => {
            if(reservedNames.includes(column) == false && columnTarget == column){
                tableLine += '<td>' + '<a href="' + recordURL + '" target="_blank" style="color: blue; text-decoration: underline;">' + record[column] + '</a>' + '</td>';
            } else if(reservedNames.includes(column) == false){
                tableLine += '<td>' + record[column] + '</td>';
            }
        })

        tableLines += '<tr>' + tableLine + '</tr>';
    })

    let result_HTML = '<table style="width: 100%;">' + '<thead><tr>' + tableHeader + '</tr></thead><tbody>' + tableLines + '</tbody></table>';
    let cienciavitae_report_result = document.getElementById('cienciavitae_report_result');
    cienciavitae_report_result.innerHTML = result_HTML;

    global_reportData = reportData;
    global_reservedNames = reservedNames;

    let cienciavitae_export_container = document.getElementById('cienciavitae_export_container');
    cienciavitae_export_container.innerHTML = '<button type="button" onclick="doExportCSV()">Exportar lista</button>';
}

function doSubmitReport(){
    var reportFilters = global_reportFilters;
    var searchParams = [];
    reportFilters.forEach((parameter) => {
        let filter_param = document.getElementById('filter_param' + '_' + parameter.ParameterName);
        searchParams.push({ParameterName : parameter.ParameterName, Value : filter_param.value})
    })
    let reportId = getURLParameter('id');
    let request_url = getAPIURI() + '/reports/run/' + reportId + '/submit';
    let request_params = {
        headers: {
            "Content-Type": "application/json",
        },
        method : "POST",
        body : JSON.stringify(searchParams)
    }
    fetch(request_url, request_params)
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
        let reportData = result.reportData;
        if(reportData.length == 0){
            let cienciavitae_report_result = document.getElementById('cienciavitae_report_result');
            cienciavitae_report_result.innerHTML = '';
            return;
        }
        helperRenderTable(reportData);
    })
    .catch(async (error) => {
        alert('Um erro ocorreu. Por favor contacte o suporte.');
        console.log(JSON.stringify(error));
    })
}

function doExportCSV(){
    let CSV_DATA = 'data:text/csv;charset=utf-8,';
    let CSV_HEADER = [];

    Object.keys(global_reportData[0]).forEach(column => {
        if(global_reservedNames.includes(column) == false){
            CSV_HEADER.push('"' + column + '"');
        }
    })    

    CSV_DATA += CSV_HEADER.join(",") + '\r\n';
    try {
        global_reportData.forEach(record => {

            let CSV_ROW = [];

            Object.keys(record).forEach(column => {
                if(global_reservedNames.includes(column) == false){
                    CSV_ROW.push('"' + record[column] + '"');
                }
            })

            CSV_DATA += CSV_ROW.join(",") + '\r\n';
        })

        var ContentURI = encodeURI(CSV_DATA);
        var ElementContainer = document.createElement("a");
        ElementContainer.setAttribute("href", ContentURI);
        ElementContainer.setAttribute("download", "cienciascrapper_report_" + getFilenameEscapedDatetime(undefined) + ".csv");
        document.body.appendChild(ElementContainer);
        ElementContainer.click();
    } catch (error) {
        alert('Um erro ocorreu. Por favor, contacte o administrador do sistema.');
        console.error(error);
    }
}