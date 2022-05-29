'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        $("#tbl_username").empty().append(localStorage.getItem('cienciavitae_user'));
        this.doShowFilters();
    });



})(jQuery);

var global_find_tableFilter = [];
var global_find_criteriaToConsider = [];

function doShowFilters(){
    let cienciavitae_filters_container = document.getElementById("cienciavitae_filters_container");
    let cienciavitae_filters_button_container = document.getElementById("cienciavitae_filters_button_container");
    let firstLine = doAddFilterLine(false);
    let tableHTML = '<table style="width: 100%;" id="cienciavitae_filters_container_table">' + firstLine + '</table>';
    let addLineButton = '<a onclick="doAddFilterLine(true)"><i class="fa fa-plus"></i></a>';
    let submitButton = '<button type="button" id="cienciavitae_filters_button" onclick="doSubmitSearch()" disabled>Pesquisar</button>';
    cienciavitae_filters_container.innerHTML = tableHTML + '<br/>' + addLineButton;
    cienciavitae_filters_button_container.innerHTML = submitButton;
}

function doAddFilterLine(addToDOM){
    var nextItem = global_find_tableFilter.length;
    var lineHTML = doGetNewFilterLine(nextItem);
    global_find_tableFilter.push(lineHTML);
    if(addToDOM == true){
        var temporaryContainer = document.createElement('div');
        temporaryContainer.innerHTML = '<table>' + lineHTML + '</table>';
        var lineDOM = temporaryContainer.firstChild.firstChild.firstChild;
        let cienciavitae_filters_container_table = document.getElementById("cienciavitae_filters_container_table");
        cienciavitae_filters_container_table.appendChild(lineDOM);
    }
    return lineHTML;
}

function doDeleteFilter(index){
    let tableLine = document.getElementById("filter-" + index);
    tableLine.parentNode.removeChild(tableLine);
    global_find_criteriaToConsider[index] = undefined;
    global_find_tableFilter.splice(index, 1);
    console.log(global_find_criteriaToConsider)
}

function doGetNewFilterLine(index){
    const filters = doGetFilters();

    let allFilterOptions = '';
    filters.forEach((filter) => {
        var filterOption = `<option value="${filter.value}">${filter.label}</option>`;
        allFilterOptions += filterOption;
    })

    var firstColumn = '<td><select onchange="doChooseFilterTable(' + index + ')" style="width: 100%;" id="filter-' + index + '-table">' + '<option hidden>Escolha uma opção</option>' + allFilterOptions + '</select></td>';
    var secndColumn = '<td><select onchange="doChooseFilterType(' + index + ')" style="width: 100%;" id="filter-' + index + '-type"></select></td>';
    var thirdColumn = '<td id="filter-' + index + '-fieldContainer"><input type="text" style="width: 100%" disabled/></td>';
    var forthColumn = (index > 0) ? `<td><a onclick="doDeleteFilter(${index})"><i class="fa fa-trash"></i></a></td>` : '';

    var lineHTML = `<tr id="filter-${index}">` + firstColumn + secndColumn + thirdColumn + forthColumn + '</tr>';
    
    return lineHTML;
}

function doGetFilters(){
    const Type1 = [
        { label : "Contém", value : "LIKE", type : "text" },
        { label : "Não contém", value : "NOT_LIKE", type : "text" },
        { label : "Iniciado em (mês-ano)", value : "MONTHYEAR_GREATER_START", type : "month-year" },
        { label : "Concluído em (mês-ano)", value : "MONTHYEAR_GREATER_END", type : "month-year"},
        { label : "Iniciado até (mês-ano)", value : "MONTHYEAR_LESS_START", type : "month-year" },
        { label : "Concluído até (mês-ano)", value : "MONTHYEAR_LESS_END", type : "month-year"},
        { label : "Iniciado em (ano)", value : "YEAR_GREATER_START", type : "year" },
        { label : "Concluído em (ano)", value : "YEAR_GREATER_END", type : "year"},
        { label : "Iniciado até (ano)", value : "YEAR_LESS_START", type : "year" },
        { label : "Concluído até (ano)", value : "YEAR_LESS_END", type : "year"}

    ]
    
    const Type2 = [
        { label : "Contém", value : "LIKE", type : "text" },
        { label : "Não contém", value : "NOT_LIKE", type : "text" }
    ]
    
    const criteria = [
        { label : 'Cabeçalho do currículo', value : 'Curriculo', options : Type2 },
        { label : 'Atividade', value : 'Curriculo_Actividade', options : Type1 },
        { label : 'Distinção', value : 'Curriculo_Distincao', options : Type1 },
        { label : 'Formação', value : 'Curriculo_Formacao', options : Type1 },
        { label : 'Percurso Profissional', value : 'Curriculo_PercursoProfissional', options : Type1 },
        { label : 'Produção', value : 'Curriculo_Producao', options : Type2 },
        { label : 'Idioma', value : 'Curriculo_ProeficienciaIdioma', options : Type2 },
        { label : 'Projeto', value : 'Curriculo_Projecto', options : Type1 }
    ]
    return criteria;
}

function doChooseFilterTable(index){
    var queryStringOuter = 'filter-' + index + '-table';
    var queryStringInner = 'filter-' + index + '-type';
    var queryStringField = 'filter-' + index + '-fieldContainer';

    let selectField = document.getElementById(queryStringOuter);
    let selectedValue = selectField.value;

    let allCriteria = doGetFilters();
    let optionsForCriteria = allCriteria.find(({value}) => value == selectedValue).options;

    let allFilterOptions = '';
    optionsForCriteria.forEach((filter) => {
        var filterOption = `<option value="${filter.value}">${filter.label}</option>`;
        allFilterOptions += filterOption;
    })

    let innerSelectField = document.getElementById(queryStringInner);
    innerSelectField.innerHTML = '<option hidden>Escolha uma opção</option>' + allFilterOptions;

    let inputField = document.getElementById(queryStringField);
    inputField.innerHTML = '<input type="text" style="width: 100%" disabled/>';
    global_find_criteriaToConsider[index] = undefined;
    doCheckAllowSearch();
}

function doChooseFilterType(index){
    var queryStringOuter = 'filter-' + index + '-table';
    let selectFieldOuter = document.getElementById(queryStringOuter);
    let selectedValueOuter = selectFieldOuter.value;

    let allCriteria = doGetFilters();
    let optionsForCriteria = allCriteria.find(({value}) => value == selectedValueOuter).options;

    var queryStringInner = 'filter-' + index + '-type';
    let selectFieldInner  = document.getElementById(queryStringInner);
    let selectedValueInner = selectFieldInner.value;

    let optionLineItem = optionsForCriteria.find(({value}) => value == selectedValueInner);
    let placeholder = '';

    switch (optionLineItem.type) {
        case 'text':
            placeholder = 'Lorem ipsum dolor sit amet...';
            break;
        case 'month-year':
            placeholder = 'MM-YYYY';
            break;
        case 'year':
            placeholder = 'YYYY';
            break;
        default:
            break;
    }

    let inputHTML = '<input type="text" style="width: 100%" id="filter-' + index + '-field" onchange="doSetFilterValue(' + index + ')" data-expected="' + optionLineItem.type +'" placeholder="' + placeholder + '"/>';
    
    var queryStringField = 'filter-' + index + '-fieldContainer';
    let inputField = document.getElementById(queryStringField);
    inputField.innerHTML = inputHTML;
    global_find_criteriaToConsider[index] = undefined;
    doCheckAllowSearch();
}

function doSetFilterValue(index){
    var queryStringOuter = 'filter-' + index + '-table';
    let selectFieldOuter = document.getElementById(queryStringOuter);
    let selectedValueOuter = selectFieldOuter.value;

    var queryStringInner = 'filter-' + index + '-type';
    let selectFieldInner  = document.getElementById(queryStringInner);
    let selectedValueInner = selectFieldInner.value;

    var queryStringField = 'filter-' + index + '-field';
    let inputField = document.getElementById(queryStringField);
    let inputFieldValue = inputField.value;

    let filteritem = {
        table : selectedValueOuter,
        type : selectedValueInner,
        value : inputFieldValue
    }
    global_find_criteriaToConsider[index] = filteritem;
    doCheckAllowSearch();
}

function doCheckAllowSearch(){
    let items = 0;
    let erroritems = 0;
    global_find_criteriaToConsider.forEach(item => {
        if(item != undefined){
            items++;
            let allCriteria = doGetFilters();
            let optionsForCriteria = allCriteria.find(({value}) => value == item.table).options;
            let optionLineItem = optionsForCriteria.find(({value}) => value == item.type);
            switch (optionLineItem.type) {
                case 'text':
                    if(item.value == ''){
                        erroritems++;
                    }
                    break;
                case 'month-year':
                    if(/^(0[1-9]|1[0-2])\-?([0-9]{4})$/.test(item.value) == false){
                        erroritems++;
                    }
                    break;
                case 'year':
                    if(/^([0-9]{4})$/.test(item.value) == false){
                        erroritems++;
                    }
                    break;
                default:
                    break;
            }
        }
    })

    let cienciavitae_filters_button = document.getElementById('cienciavitae_filters_button');

    if(items > 0 && erroritems == 0){
        cienciavitae_filters_button.disabled = false;
    } else {
        cienciavitae_filters_button.disabled = true;
    }
}

function doSubmitSearch(){
    var criteria = [];
    global_find_criteriaToConsider.forEach(item => {
        if(item != undefined){
            criteria.push(item);
        }
    })
    if(criteria.length == 0){
        return;
    }
    let cienciavitae_filters_button = document.getElementById('cienciavitae_filters_button');
    cienciavitae_filters_button.disabled = true;
    let request_url = getAPIURI() + '/search/find';
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
        console.log('doSubmitSearch().result', result);
    })
    .catch(async (error) => {
        alert('doSubmitSearch().error = ' + JSON.stringify(error));
    }) 
}