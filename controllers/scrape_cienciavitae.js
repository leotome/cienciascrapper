const puppeteer = require('puppeteer');
const definicao_mapeamento = require('../models/config_models').definicao_mapeamento;

exports.doScrapeVitae = async (cienciaID) => {
    const mapping = await definicao_mapeamento.cRud_getFullMapeamento();
    const baseURL = 'https://www.cienciavitae.pt/portal/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseURL + cienciaID);

    mapping.forEach(async (item) => {
        switch (item.Tipo) {
            case 'SIMPLES':
                let myResult = await doSimpleScrape(item, page);
                console.log(item.NomeTabela, myResult);
                break;            
            case 'POLIMÓRFICO TABELA':
                let myTable = await doTableScrape(item, page);
                console.log(item.NomeTabela, myTable);
                break;            
            case 'POLIMÓRFICO LISTA':
                
                break;
        }

    })
}

async function doSimpleScrape(mappingItem, pageReference) {
    // ## STEP #1 : ITERATE THROUGH EACH LINE, SEARCH THE PAGE, THEN STORE THE RESULT IN A VARIABLE ## //
    let myResult = {};

    await Promise.all(mappingItem.Linhas.map(async (Linha) => {
        const doEvaluate = await pageReference.evaluate((Linha) => {
            let doSearch = document.evaluate(Linha.XPath_Pesquisa, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if(doSearch === undefined){
                return null;
            }
            let searchFound = false;
            let searchResult = null;
    
            while(searchFound != true){
                if(doSearch == null){
                    break;
                }
                if(doSearch.nodeName == Linha.ElementoEsperado){
                    searchFound = true;
                    searchResult = doSearch.innerText;
                } else {
                    doSearch = doSearch.nextSibling;
                }
            }
            return searchResult;
        }, Linha);
        myResult[Linha.NomeCampo] = doEvaluate;
    }));
    // ## STEP #1 : ITERATE THROUGH EACH LINE, SEARCH THE PAGE, THEN STORE THE RESULT IN A VARIABLE ## //

    return myResult;
}

async function doTableScrape(mappingItem, pageReference) {
    let myResult = [];

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        let doSearch = document.evaluate(mappingItem.XPath_Pesquisa, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(doSearch === undefined){
            return [];
        }
        const table =  Array.from(doSearch.querySelectorAll('tr'), row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, column => column.innerText);
        });
        return table;
    }, mappingItem);

    doEvaluate.forEach((TableLine) => {
        if(TableLine.length > 0){
            let myRecord = {};
            mappingItem.Linhas.forEach((Linha) => {
                switch (Linha.TipoDado) {
                    case 'Data':
                        let awaitedField = Linha.NomeCampo.split(',');
                        let datePayload = TableLine[Linha.IndiceEsperado].split(' - ');
                        let startDateString = (datePayload[1]) ? datePayload[0] : undefined;
                        let endDateString = (datePayload[1]) ? datePayload[1] : datePayload[0];
                        if(startDateString){
                            myRecord[awaitedField[0]] = helper_getDate(startDateString);
                        }
                        if(endDateString){
                            myRecord[awaitedField[1]] = helper_getDate(endDateString);
                        }
                        break;
                    case 'Texto':
                        myRecord[Linha.NomeCampo] = TableLine[Linha.IndiceEsperado];
                        break;
                    default:
                        break;
                }
            })
            myResult.push(myRecord);
        }
    })
    return myResult;
}

function helper_getDate(dateString){
    let innerDateString = dateString.replace('\nConcluded','').replace('\nAttended','');
    let result = '';
    switch (innerDateString.length) {
        case 10:
            let dateString_fullDate = innerDateString;
            result = dateString_fullDate.split('/')[0] + '-' + dateString_fullDate.split('/')[1] + '-' + dateString_fullDate.split('/')[2];
            break;
        case 7:
            let dateString_monthYear = innerDateString;
            result = dateString_monthYear.split('/')[0] + '-' + dateString_monthYear.split('/')[1] + '-' + '01';
            break;        
        case 4:
            let dateString_Year = innerDateString;
            result = dateString_Year + '-' + '01' + '-' + '01';
            break;
        default:
            result = null;
            break;
    }
    return result;
}

/*
(async () => {
    const atributoPolimorficoTable_test = await page.evaluate(() => {
      const elemento = document.evaluate('/html/body/div[3]/main/section/div[3]/div/div/div[2]/div/div/table', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      const rows = elemento.querySelectorAll('tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        return Array.from(columns, column => column.innerText);
      });
    });

    if(debug_options.atributoPolimorficoTable_test){
      console.log(atributoPolimorficoTable_test);
    }

    const atributoPolimorficoList_test = await page.evaluate(() => {
      const elemento = document.evaluate('/html/body/div[3]/main/section/div[2]/div/div/div[2]/div/div/ul[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      const items = elemento.querySelectorAll('li');
      return Array.from(items, item => {
        return item.innerText;
      })
    });

    if(debug_options.atributoPolimorficoList_test){
      console.log(atributoPolimorficoList_test);
    }

    await browser.close();
})();
*/