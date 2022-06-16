'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        this.doShowRows();
    });



})(jQuery);

var global_find_tableHTMLRows = [];
var global_find_IdsToConsider = [];

function doShowRows(){
    let cienciascrapper_queryterms_container = document.getElementById("cienciascrapper_queryterms_container");
    let cienciascrapper_queryterms_button_container = document.getElementById("cienciascrapper_queryterms_button_container");
    let firstLine = doAddRow(false);
    let tableHTML = '<table style="width: 100%;" id="cienciascrapper_queryterms_container_table">' + firstLine + '</table>';
    let addLineButton = '<a onclick="doAddRow(true)"><i class="fa fa-plus"></i></a>';
    let submitButton = '<button type="button" id="cienciascrapper_queryterms_button" onclick="doSubmitScrape()" disabled>Enviar pedido</button>';
    cienciascrapper_queryterms_container.innerHTML = tableHTML + '<br/>' + addLineButton;
    cienciascrapper_queryterms_button_container.innerHTML = submitButton;
}

function doAddRow(addToDOM){
    var nextItem = global_find_tableHTMLRows.length;
    if(nextItem > 9){
        alert('Erro: só pode listar até 10 currículos para inserção, por vez.');
        return;
    }
    var lineHTML = doGetNewRow(nextItem);
    global_find_tableHTMLRows.push(lineHTML);
    global_find_IdsToConsider[nextItem] = undefined;
    doCheckInputData();
    if(addToDOM == true){
        var temporaryContainer = document.createElement('div');
        temporaryContainer.innerHTML = '<table>' + lineHTML + '</table>';
        var lineDOM = temporaryContainer.firstChild.firstChild.firstChild;

        let cienciascrapper_queryterms_container_table = document.getElementById("cienciascrapper_queryterms_container_table");
        cienciascrapper_queryterms_container_table.appendChild(lineDOM);
    }
    return lineHTML;
}

function doGetNewRow(index){
    var fieldInput = `<input type="text" id="field-${index}" style="width: 100%" onchange="doHandleInput(${index})" placeholder="ABCD-1234-DCBA"/>`;
    var firstColumn = '<td id="fieldContainer-' + index + '">' + fieldInput + '</td>';
    var secndColumn = (index > 0) ? `<td><a onclick="doDeleteRow(${index})"><i class="fa fa-trash"></i></a></td>` : '';
    var lineHTML = `<tr id="idrow-${index}">` + firstColumn + secndColumn + '</tr>';
    return lineHTML;
}

function doDeleteRow(index){
    let tableLine = document.getElementById("idrow-" + index);
    tableLine.parentNode.removeChild(tableLine);
    global_find_IdsToConsider[index] = undefined;
    global_find_tableHTMLRows.splice(index, 1);
    doCheckInputData();
}

function doHandleInput(index){
    var queryStringField = 'field-' + index;
    let inputField = document.getElementById(queryStringField);
    let inputFieldValue = inputField.value;
    global_find_IdsToConsider[index] = (inputFieldValue != '') ? inputFieldValue : undefined;
    doCheckInputData();
}

function doCheckInputData(){
    let notUndefItems = global_find_IdsToConsider.filter(item => item != undefined).length;
    let tableRowItems = global_find_tableHTMLRows.length;
    let cienciascrapper_queryterms_button = document.getElementById('cienciascrapper_queryterms_button');
    let disableAttrib = false;
    if(notUndefItems == tableRowItems){
        disableAttrib = false;
    } else {
        disableAttrib = true;
    }
    if(cienciascrapper_queryterms_button != null){
        cienciascrapper_queryterms_button.disabled = disableAttrib;
    }
}

function doSubmitScrape(){
    var criteria = [];
    global_find_IdsToConsider.forEach(item => {
        if(item != undefined){
            criteria.push(item);
        }
    })
    if(criteria.length == 0){
        return;
    }
    let cienciascrapper_queryterms_button = document.getElementById('cienciascrapper_queryterms_button');
    cienciascrapper_queryterms_button.disabled = true;

    let containerPlaceholder = '<div class="row"><div class="col-lg-12"><div class="section-title"><h2>Resultados</h2></div></div></div><br/><div id="cienciascrapper_results_section_container"><div class="row"><b>Por favor aguarde...</b></div></div>';
    let cienciascrapper_results_section = document.getElementById('cienciascrapper_results_section');
    cienciascrapper_results_section.innerHTML = containerPlaceholder;

    let request_url = getAPIURI() + '/scrape/cienciavitae';
    let request_params = {
        headers: {
            "Content-Type": "application/json",
        },
        method : "POST",
        body : JSON.stringify(criteria)
    }

    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }

        let allResultCards = '';

        result.forEach(item => {
            let resultCard = '';
            resultCard += '<div class="row">'
            if(item.success == true){
                resultCard += `<img style="width: 25px; height: 25px;" src="./img/icons/success.png"/>&nbsp;<a href="/curriculum.html?id=${item.recordId}" target="_blank" style="color: blue; text-decoration: underline;">${item.CienciaId} : ${item.records.find(({key}) => key == 'Curriculo').value.NomeCompleto}</a>`;
            } else {
                resultCard += `<img style="width: 25px; height: 25px;" src="./img/icons/error.png"/>&nbsp;${item.CienciaId} : Erro ao extrair. Verifique se o Ciência ID está correto, e tente novamente.`;
            }
            resultCard += '</div>'
            allResultCards += resultCard;
        })
        let cienciascrapper_results_section_container = document.getElementById('cienciascrapper_results_section_container');
        cienciascrapper_results_section_container.innerHTML = allResultCards;
    })
    .catch(async (error) => {
        alert('doSubmitSearch().error = ' + JSON.stringify(error));
    }) 
}