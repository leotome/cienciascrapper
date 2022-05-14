const puppeteer = require('puppeteer');
const crypto = require('crypto');
const definicao_mapeamento = require('../models/config_models').definicao_mapeamento;

exports.doScrapeVitae = async (cienciaID) => {
    // A chave primária da tabela "Curriculo" deve ser gerada neste método, para facilitar a ligação com FK no detalhe do CV.
    let GUID = crypto.randomUUID().toUpperCase();

    // O mapeamento está definido e deve respeitar ao que está configurado nas tabelas "Definicao_Mapeamento" e "Definicao_Mapeamento_Linha".
    // Como é sabido, esta aplicação funciona com recurso a iteração de uma página HTML através de XPaths.
    // Caso necessário manutenção dos XPaths, deve ser feito nas tabelas mencionadas.
    const mapping = await definicao_mapeamento.cRud_getFullMapeamento();

    // A URL de pesquisa está definida ao nível da tabela "Definicao_PaginaURL"
    // Caso necessário manutenção da URL, deve ser feito na tabela mencionada.
    const baseURL = 'https://www.cienciavitae.pt/portal/en/'; //TODO

    // Métodos específicos da engine Chrominium
    // Inicia e navega para a página
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseURL + cienciaID);

    // Para debugging dentro do document.evaluate
    /*
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i){
            console.log(`${i}: ${msg.args()[i]}`);
        }
    });
    */

    // As tipologias estão definidas e devem respeitar ao que está configurado na tabela "Definicao_Mapeamento_Tipo" do servidor SQL.
    // Cada tipologia identificada requer extração num determinado formato, e por isso cada uma possui um método específico.
    // Caso necessário manutenção, deverá sofrer intervenção nos métodos abaixo listados. Atenção, é necessário conhecimentos sobre JavaScript e XPaths.
    mapping.forEach(async (item) => {
        switch (item.Tipo) {
            case 'SIMPLES':
                let myResult = await doSimpleScrape(item, page, GUID);
                //console.log(item.NomeTabela, myResult);
                break;            
            case 'POLIMÓRFICO TABELA 1':
                let myTable1 = await doTableScrape_1(item, page, GUID);
                //console.log(item.NomeTabela, myTable1);
                break;
            case 'POLIMÓRFICO TABELA 2':
                let myTable2 = await doTableScrape_2(item, page, GUID);
                //console.log(item.NomeTabela, myTable2);
                break;
            case 'POLIMÓRFICO TABELA 3':
                let myTable3 = await doTableScrape_3(item, page, GUID);
                //console.log(item.NomeTabela, myTable3);
                break;
            case 'POLIMÓRFICO LISTA':
                let myList = await doListScrape(item, page, GUID);
                //console.log(item.NomeTabela, myList);
                break;
        }

    })

    // Métodos específicos da engine Chrominium
    // Finaliza a sessão do browser
    await page.close();

}

async function doSimpleScrape(mappingItem, pageReference, primaryKey) {
    // Nesta tipologia, os dados não são polimórficos, isto é, não está estruturado numa tabela ou lista com N items.
    // Utiliza os campos "[XPath_Pesquisa]" e "[ElementoEsperado]" da tabela [Definicao_Mapeamento_Linha] para mapeamento da informação.

    // O "[XPath_Pesquisa]" serve para localizar o cabeçalho/título do dado na página.
    // Espera-se que o dado em si estará no elemento HTML logo a seguir do título.
    // Portanto, supondo que o cabeçalho é "X", o dado poderá estar no elemento "X + 1".

    // O campo "ElementoEsperado" serve como controlo, isto é, só vai buscar o conteúdo do elemento "X + 1" se for do tipo esperado.
    // Por exemplo:
    // <h3>Título</h3>
    // <dd>Informação</dd>
    // Teremos [XPath_Pesquisa] = "//h3[contains(., 'Título')]" e [ElementoEsperado] = "DD"

    // Define o registo final no formato JSON. Iremos armazenar a informação extraída aqui.
    // O resultado dará origem a 1 registo na BD.
    let myResult = {
        Id : primaryKey
    };
    
    // ## PASSO #1 : ITERAR SOBRE CADA LINHA, PESQUISAR NA PÁGINA PELO XPATH, E SE ENCONTRAR GUARDAR A INFORMAÇÃO ## //
    await Promise.all(mappingItem.Linhas.map(async (Linha) => {
        const doEvaluate = await pageReference.evaluate((Linha) => {
            // Fazer N pesquisas pelo XPath que está armazenado no [Definicao_Mapeamento_Linha].[XPath_Pesquisa]
            // Isto é, para cada [Definicao_Mapeamento_Linha], é feita 1 pesquisa

            // Este método "document.evaluate()" retorna um objeto do tipo "XPathResult".
            // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate

            // Para conveniência, utilizamos a property/parâmetro "singleNodeValue", que retorna um objeto do tipo "Node".
            // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Node            
            let doSearch = document.evaluate(Linha.XPath_Pesquisa, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            
            // Se "document.evaluate()" retornar "undefined", então significa que a pesquisa pelo XPath retornou 0 elementos HTML.
            if(doSearch === undefined){
                return null;
            }

            // Caso contrário, temos de ir à procura pelo "[ElementoEsperado]" nos nós irmãos/vizinhos ao elemento que pesquisamos.
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
    // ## PASSO #1 : ITERAR SOBRE CADA LINHA, PESQUISAR NA PÁGINA PELO XPATH, E SE ENCONTRAR GUARDAR A INFORMAÇÃO ## //
    
    // Terminada a extração.
    return myResult;
}

async function doTableScrape_1(mappingItem, pageReference, foreignKey) {
    // Nesta tipologia, é esperado que os dados estejam num elemento <table> da página.
    // Utiliza o campo "[XPath]" da tabela [Definicao_Mapeamento] para encontrar o elemento HTML <table>
    // Utiliza os campos "[TipoDado]", "[IndiceEsperado]" e "[Boolean_PalavrasChave]" para mapeamento da informação.

    // Define o registo final no formato JSON. Iremos armazenar a informação extraída aqui.
    // O resultado dará origem a N registos na BD. Por isso, foi inicializada uma lista/array.
    let myResult = [];

    // Em resumo, a tabela é lida pelo motor de extração e cada linha é transformada num array/lista
    // Cada coluna/index da lista é mapeado para um ou mais campos da BD, com o tipo de dado esperado
    // A depender do tipo de dado, é feito o tratamento da informação/string para o formato esperado na BD.

    // O tratamento/conversão da informação é feito no método auxiliar "helper_formatTableData()"

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        // Fazer 1 pesquisa pelo XPath que está armazenado no [Definicao_Mapeamento].[XPath].
        
        // Este método "document.evaluate()" retorna um objeto do tipo "XPathResult".
        // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate

        // Para conveniência, utilizamos a property/parâmetro "singleNodeValue", que retorna um objeto do tipo "Node".
        // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Node
        let doSearch = document.evaluate(mappingItem.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        
        // Se "document.evaluate()" retornar "undefined", então significa que a pesquisa pelo XPath retornou 0 elementos HTML.
        if(doSearch === undefined){
            return [];
        }

        // Caso contrário, transforma os objetos "Node" num array simplificado.
        // É feita a iteração por cada linha "<tr>", e para cada coluna da linha "<td>" é mapeado o texto para um index no array.
        const table =  Array.from(doSearch.querySelectorAll('tr'), row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText);
        });

        return table;
    }, mappingItem);

    doEvaluate.forEach((TableLine) => {
        if(TableLine.length > 0){
            let myRecord = {
                Curriculo_FK : foreignKey
            };
            // Em seguida, itera-se sobre as linhas definidas em [Definicao_Mapeamento_Linha].
            // Por isso é importante o valor do campo "[IndiceEsperado]", uma vez que é assim que fazemos o mapeamento para os campos da BD.
            // Para cada informação extraída, passar pelo método "helper_formatTableData()" de modo a converter o tipo de dado
            // E, no fim, finaliza-se e formaliza-se o registo por meio da adição/"push" do objeto JSON resultante ao array "myResult".
            mappingItem.Linhas.forEach((Linha) => {
                let innerResult = helper_formatTableData(Linha, TableLine);
                innerResult.forEach((innerResultLine) => {
                    if(innerResultLine.key != undefined){
                        myRecord[innerResultLine.key] = innerResultLine.value;
                    }
                })
            })
            myResult.push(myRecord);
        }
    })
    // Terminada a extração.
    return myResult;
}

async function doTableScrape_2(mappingItem, pageReference, foreignKey) {
    // Nesta tipologia, o detalhe dos dados estão num elemento <table> da página. Além disso, cada <table> é precedido de um título.
    // Portanto, é esperado que a informação esteja em pares, numa estrutura do género:
    // <h3>Título da tabela</h3>
    // <table>...</table>

    // O XPath parametrizado deve ser o elemento agregador destes pares de informação.
    // Por exemplo, 
    // <div>
    //     <h3>Título da tabela 1</h3>
    //     <table>...</table>
    //     <h3>Título da tabela 2</h3>
    //     <table>...</table>
    //     <h3>Título da tabela N</h3>
    //     <table>...</table>
    // </div>

    // Utiliza o campo "[XPath]" da tabela [Definicao_Mapeamento] para encontrar o elemento HTML agregador de todos os pares de informação.
    // Utiliza os campos "[TipoDado]", "[IndiceEsperado]" e "[Boolean_PalavrasChave]" para mapeamento do detalhe, i.e. informação do <table>.
    // O título é fixo no campo "[Tipo]".

    // Define o registo final no formato JSON. Iremos armazenar a informação extraída aqui.
    // O resultado dará origem a N registos na BD. Por isso, foi inicializada uma lista/array.
    let myResult = [];

    // Neste caso, a extração da informação é feita em dois grandes passos.
    // Em resumo:
    // O Passo #1 extrai a informação do HTML num formato conveniente.
    // O Passo #2 extrai a informação do formato conveniente para registos da BD.

    // ## PASSO #1 : EXTRAIR A INFORMAÇÃO DO HTML NUM FORMATO CONVENIENTE ## //

    const doEvaluate = await pageReference.evaluate((mappingItem) => {
        // Fazer 1 pesquisa pelo XPath que está armazenado no [Definicao_Mapeamento].[XPath].
        
        // Este método "document.evaluate()" retorna um objeto do tipo "XPathResult".
        // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate

        // Para conveniência, utilizamos a property/parâmetro "singleNodeValue", que retorna um objeto do tipo "Node".
        // Para mais informações, consultar a documentação em https://developer.mozilla.org/en-US/docs/Web/API/Node        
        let doSearch = document.evaluate(mappingItem.XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        // Se "document.evaluate()" retornar "undefined", então significa que a pesquisa pelo XPath retornou 0 elementos HTML.
        if(doSearch === undefined){
            return [];
        }

        // Como é sabido, o XPath retorna o elemento agregador dos pares de informação.
        // Por isso, nos interessa iterar os nós filhos do agregador.
        let childNodes = doSearch.childNodes;

        // ## PASSO #1.1 : REMOVER OS ELEMENTOS INDESEJADOS ## //

        // O primeiro passo é remover o "lixo" que está incluído como nó filho.
        let unexpectedElements = ['#text'];
        
        // Por isso, declara-se na variável "unexpectedElements" e usamos o método "removeChild()" do objeto "Node" para remover do "NodeList".
        childNodes.forEach((node) => {
			if(unexpectedElements.includes(node.nodeName) == true){
				doSearch.removeChild(node);
			}
        });
        // ## PASSO #1.1 : REMOVER OS ELEMENTOS INDESEJADOS ## //

        // ## PASSO #1.2 : EXTRAIR A INFORMAÇÃO DA ESTRUTURA DA PÁGINA ## //
		let myData = [];

        childNodes.forEach((node, index) => {
            // Como é sabido, espera-se que a informação esteja em pares.
            // Por isso, vamos obter o título, e iterar o nó vizinho ao título.
            // Como está em pares, vamos fazer a operação X MOD 2, onde X é o índice do nó na lista.
            // Convenção: se "X MOD 2 = 0", então é título.
			if(index % 2 == 0){
                // Extrai o conteúdo do título, numa string formatada.
				let type = node.textContent.replace('\n','').trim();
                // Vai buscar o nó vizinho. Espera-se que "nextSibling" retorne um "Node" que mapeia para um elemento "<table>"
                let data = node.nextSibling;

                // É feita a iteração por cada linha "<tr>", e para cada coluna da linha "<td>" é mapeado o texto para um index no array.
                // Transorma o "Node" num array simplificado.
                const table =  Array.from(data.querySelectorAll('tr'), row => {
                    const columns = row.querySelectorAll('td');
                    return Array.from(columns, column => column.innerText);
                });

                // O resultado dessa extração é armazenado num formato conveniente para iteração posterior.
                // Armazena-se num objeto JSON, na variável "myData" definida no início do PASSO #2.
				let ret = {
					type : type,
					data : table
				};
				myData.push(ret);
			}
        })
		// ## PASSO #1.2 : EXTRAIR A INFORMAÇÃO DA ESTRUTURA DA PÁGINA ## //
        return myData;
    }, mappingItem);

    // ## PASSO #1 : EXTRAIR A INFORMAÇÃO DO HTML NUM FORMATO CONVENIENTE ## //

    // ## PASSO #2 : EXTRAIR A INFORMAÇÃO DO FORMATO CONVENIENTE EM REGISTOS DA BD ## //


    // O PASSO #1 extraiu informação num formato JSON { type : string, data : array }.
    // Vamos iterar cada item, e para cada item, vamos correr a tabela [Definicao_Mapeamento_Linha] de modo a mapear a informação para o formato esperado da BD.
    doEvaluate.forEach((RetLine) => {
        if(RetLine.data.length > 0){
            // Remove a 1ª linha onde não há colunas. É uma simples normalização.
            if(RetLine.data[0].length == 0){
                RetLine.data.shift();
            }
            
            // Para cada linha da tabela, vamos iterar as linhas da [Definicao_Mapeamento_Linha]
            RetLine.data.forEach((TableLine) => {
                // Este é o registo linha resultante.
                let myRecord = {
                    Curriculo_FK : foreignKey
                };
                // Mapeia-se o título, de modo fixo, à coluna "Tipo" da tabela da BD.
                myRecord['Tipo'] = RetLine.type;
                
                // Para cada linha da [Definicao_Mapeamento_Linha]...
                mappingItem.Linhas.forEach((Linha) => {
                    // Para cada informação extraída, passar pelo método "helper_formatTableData()" de modo a converter o tipo de dado
                    let innerResult = helper_formatTableData(Linha, TableLine);
                    innerResult.forEach((innerResultLine) => {
                        if(innerResultLine.key != undefined){
                            myRecord[innerResultLine.key] = innerResultLine.value;
                        }
                    })
                })
                // E, no fim, finaliza-se e formaliza-se o registo por meio da adição/"push" do objeto JSON resultante ao array "myResult".
                myResult.push(myRecord);
            })
        }
    })
    // Terminada a extração.
    return myResult;
}

async function doTableScrape_3(mappingItem, pageReference, foreignKey) {
    // Nesta tipologia, o detalhe dos dados estão num elemento <table> da página. Além disso, cada <table> é precedido de um título.
    // Portanto, é esperado que a informação esteja em pares, numa estrutura do género:
    // <h3>Título da tabela</h3>
    // <table>...</table>

    // O XPath parametrizado deve ser o elemento agregador destes pares de informação.
    // Por exemplo, 
    // <div>
    //     <h3>Título da tabela 1</h3>
    //     <table>...</table>
    //     <h3>Título da tabela 2</h3>
    //     <table>...</table>
    //     <h3>Título da tabela N</h3>
    //     <table>...</table>
    // </div>

    // A principal diferença entre o método "doTableScrape_2()" e este método "doTableScrape_3()" é a seguinte:
    // Para a "doTableScrape_2()" espera-se que cada linha de informação esteja armazenado em apenas 1 <tr></tr> da tabela, como habitual.
    // Aqui espera-se que cada linha de informação esteja armazenado em dois <tr></tr> da tabela. Por isso, é necessário um workaround.  
    
    // Utiliza o campo "[XPath]" da tabela [Definicao_Mapeamento] para encontrar o elemento HTML agregador de todos os pares de informação.
    // Utiliza os campos "[TipoDado]", "[IndiceEsperado]" e "[Boolean_PalavrasChave]" para mapeamento do detalhe, i.e. informação do <table>.
    // O título é fixo no campo "[Tipo]".

    // Define o registo final no formato JSON. Iremos armazenar a informação extraída aqui.
    // O resultado dará origem a N registos na BD. Por isso, foi inicializada uma lista/array.
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
            if(RetLine.data[0].length == 0){
                RetLine.data.shift();
            }
            
            RetLine.data.forEach((tableRow, rowIndex) => {
                if(rowIndex % 2 == 0){
                    let nextIndex = rowIndex + 1;
                    let lineBottom = RetLine.data[nextIndex];
                    lineBottom.forEach((lineBottom_data, lineBottom_index) => {
                        if(lineBottom_data != ''){
                            tableRow[lineBottom_index] += ' \n ' + lineBottom_data;
                        }
                    })
                }
            })

            RetLine.data.forEach((TableLine, rowIndex) => {
                if(rowIndex % 2 == 0){
                    let myRecord = {
                        Curriculo_FK : foreignKey
                    };
                    myRecord['Tipo'] = RetLine.type;
                    mappingItem.Linhas.forEach((Linha) => {
                        let innerResult = helper_formatTableData(Linha, TableLine);
                        innerResult.forEach((innerResultLine) => {
                            if(innerResultLine.key != undefined){
                                myRecord[innerResultLine.key] = innerResultLine.value;
                            }
                        })
                    })
                    myResult.push(myRecord);
                }
            })
        }
    })
    return myResult;
}

async function doListScrape(mappingItem, pageReference, foreignKey) {
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
                Curriculo_FK : foreignKey,
                Tipo : RetLine.type,
                Categoria : RetLine.category,
                Descricao : item
            }
        })
        myResult = myResult.concat(records);
    });

    return myResult;
}

function helper_formatTableData(configRow, tableRow){
    let result = [];
    switch (configRow.TipoDado) {
        case 'Data':
            let awaitedField = configRow.NomeCampo.split(',');

            let datePayload = tableRow[configRow.IndiceEsperado].split(' - ');

            let datePayload_lower = datePayload[0];
            let datePayload_upper = datePayload[1];

            let startDateString = undefined;
            let endDateString = undefined;

            if((datePayload_upper != undefined)){
                if(datePayload_upper.includes('Current')){
                    startDateString = datePayload_lower;
                    endDateString = undefined;
                } else {
                    startDateString = datePayload_lower;
                    endDateString = datePayload_upper;
                }
            }
            else if((datePayload_upper == undefined)) {
                startDateString = undefined;
                endDateString = datePayload_lower;
            }

            if(startDateString){
                result.push({
                    key : awaitedField[0],
                    value : helper_getDate(startDateString)
                });
            }
            if(endDateString){
                result.push({
                    key : awaitedField[1],
                    value : helper_getDate(endDateString)
                });
            }
            break;
        case 'Texto':
            result.push({
                key : configRow.NomeCampo,
                value : tableRow[configRow.IndiceEsperado]
            });
            break;
        case 'Boolean':
            result.push({
                key : configRow.NomeCampo,
                value : ((tableRow[configRow.IndiceEsperado].includes(configRow.Boolean_PalavrasChave) == true) ? 1 : 0)
            });
            break;
        case 'Integer':
            result.push({
                key : configRow.NomeCampo,
                value : parseInt(tableRow[configRow.IndiceEsperado].replace('\n','').trim())
            });            
            break;
        default:
            break;
    }
	return result;
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