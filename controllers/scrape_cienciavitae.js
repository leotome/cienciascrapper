const puppeteer = require('puppeteer');
const definicao_mapeamento = require('../models/config_models').definicao_mapeamento;

exports.doScrapeVitae = async (cienciaID) => {
    const mapping = await definicao_mapeamento.cRud_getFullMapeamento();
    const baseURL = 'https://www.cienciavitae.pt/portal/en/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    /*
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i){
            console.log(`${i}: ${msg.args()[i]}`);
        }
    });
    */
    await page.goto(baseURL + cienciaID);

    mapping.forEach(async (item) => {
        switch (item.Tipo) {
            case 'SIMPLES':
                let myResult = await doSimpleScrape(item, page);
                //console.log(item.NomeTabela, myResult);
                break;            
            case 'POLIMÓRFICO TABELA 1':
                let myTable1 = await doTableScrape_1(item, page);
                //console.log(item.NomeTabela, myTable1);
                break;
            case 'POLIMÓRFICO TABELA 2':
                let myTable2 = await doTableScrape_2(item, page);
                console.log(item.NomeTabela, myTable2);
                break;
            case 'POLIMÓRFICO LISTA':
                let myList = await doListScrape(item, page);
                //console.log(item.NomeTabela, myList);
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

async function doTableScrape_1(mappingItem, pageReference) {
    let myResult = [];

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        let doSearch = document.evaluate(mappingItem.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
                    case 'Boolean':
                        myRecord[Linha.NomeCampo] = (TableLine[Linha.IndiceEsperado].includes(Linha.Boolean_PalavrasChave) == true) ? 1 : 0;
                        break;
                    case 'Integer':
                        myRecord[Linha.NomeCampo] = parseInt(TableLine[Linha.IndiceEsperado].replace('\n','').trim());
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

async function doTableScrape_2(mappingItem, pageReference) {
    let myResult = [];

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        let doSearch = document.evaluate(mappingItem.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(doSearch === undefined){
            return [];
        }
        let childNodes = doSearch.childNodes;

        // %% STEP #1 : REMOVE UNEXPECTED DOM ELEMENTS %% //
        let unexpectedElements = ['#text'];

        childNodes.forEach((node) => {
			if(unexpectedElements.includes(node.nodeName) == true){
				doSearch.removeChild(node);
			}
        });
        // %% STEP #1 : REMOVE UNEXPECTED DOM ELEMENTS %% //

		// %% STEP #2 : EXTRACT DATA FROM STRUCTURE %% //
		let myData = [];

        childNodes.forEach((node, index) => {
			if(index % 2 == 0){
				let type = node.textContent.replace('\n','').trim();
                let data = node.nextSibling;
                const table =  Array.from(data.querySelectorAll('tr'), row => {
                    const columns = row.querySelectorAll('td');
                    return Array.from(columns, column => column.innerText);
                });                
				let ret = {
					type : type,
					data : table
				};
				myData.push(ret);
			}
        })
		// %% STEP #2 : EXTRACT DATA FROM STRUCTURE %% //
        return myData;
    }, mappingItem);

    doEvaluate.forEach((RetLine) => {
        if(RetLine.data.length > 0){
            console.log(RetLine.data)
            if(RetLine.data[0].length == 0){
                RetLine.data.shift();
            }

            /*
            let mainData = JSON.parse(JSON.stringify(RetLine.data[1]));
            if(RetLine.data[2]){
                RetLine.data[2].forEach((secDataLine_data, secDataLine_index) => {
                    if(secDataLine_data != ''){
                        mainData[secDataLine_index] += ' \n ' + secDataLine_data;
                    }
                })
            }
            let reWorkMainData = [mainData];
            */
           
            RetLine.data.forEach((TableLine) => {
                let myRecord = {};
                myRecord['Tipo'] = RetLine.type;
                mappingItem.Linhas.forEach((Linha) => {
                    switch (Linha.TipoDado) {
                        case 'Data':
                            let awaitedField = Linha.NomeCampo.split(',');
                            let datePayload = TableLine[Linha.IndiceEsperado].split(' - ');
                            let startDateString = undefined;
                            let endDateString = undefined;

                            if(datePayload[1] && (datePayload[1].includes('Current'))){
                                startDateString = datePayload[0];
                                endDateString = undefined;
                            } else
                            if (datePayload[1] && !(datePayload[1].includes('Current'))){
                                startDateString = datePayload[0];
                                endDateString = datePayload[1];
                            } else
                            if(!datePayload[1]) {
                                startDateString = undefined;
                                endDateString = datePayload[0];
                            }

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
                        case 'Boolean':
                            myRecord[Linha.NomeCampo] = (TableLine[Linha.IndiceEsperado].includes(Linha.Boolean_PalavrasChave) == true) ? 1 : 0;
                            break;
                        case 'Integer':
                            myRecord[Linha.NomeCampo] = parseInt(TableLine[Linha.IndiceEsperado].replace('\n','').trim());
                            break;
                        default:
                            break;
                    }
                })
                myResult.push(myRecord);
            })
        }
    })
    return myResult;
}

async function doListScrape(mappingItem, pageReference) {
    let myResult = [];

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        let doSearch = document.evaluate(mappingItem.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if(doSearch === undefined){
            return [];
        }
		let childNodes = doSearch.childNodes;

        // %% STEP #1 : REMOVE UNEXPECTED DOM ELEMENTS %% //
        let unexpectedElements = ['#text'];

        childNodes.forEach((node) => {
			if(unexpectedElements.includes(node.nodeName) == true){
				doSearch.removeChild(node);
			}
        });
        // %% STEP #1 : REMOVE UNEXPECTED DOM ELEMENTS %% //

		// %% STEP #2 : EXTRACT DATA FROM STRUCTURE %% //
		let myData = [];

        childNodes.forEach((node, index) => {
			if(index % 2 == 0){
				let type = node.textContent.replace('\n','').trim();
				const category = Array.from(node.nextSibling.querySelectorAll('td'))[0].textContent;
				let items = Array.from(node.nextSibling.querySelectorAll('li'));
				let arrayItems = [];
				items.forEach(item => {
					arrayItems.push(item.innerText);
				})
				let ret = {
					type : type,
					category : category,
					items : arrayItems
				};
				myData.push(ret);
			}
        })
		// %% STEP #2 : EXTRACT DATA FROM STRUCTURE %% //
        return myData;
    }, mappingItem);

    doEvaluate.forEach((RetLine) => {
        let records = RetLine.items.map((item) => {
            return {
                Tipo : RetLine.type,
                Categoria : RetLine.category,
                Descricao : item
            }
        })
        myResult = myResult.concat(records);
    });

    return myResult;
}

function helper_getDate(dateString){
    let innerDateString = dateString.replace('\nConcluded','').replace('\nAttended','').replace('Current','');
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