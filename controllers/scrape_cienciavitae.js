const puppeteer = require('puppeteer');
const crypto = require('crypto');
const definicao_mapeamento = require('../models/config_models').definicao_mapeamento;
const definicao_url = require('../models/config_models').definicao_url;

exports.doScrapeVitae = async (cienciaID) => {
    // A chave primária da tabela "Curriculo" deve ser gerada neste método, para facilitar a ligação com FK no detalhe do CV.
    let GUID = crypto.randomUUID().toUpperCase();

    // O mapeamento está definido e deve respeitar ao que está configurado nas tabelas "[Definicao_Mapeamento]" e "[Definicao_Mapeamento_Linha]".
    // Como é sabido, esta aplicação funciona com recurso a iteração de uma página HTML através de XPaths.
    // Caso necessário manutenção dos XPaths, deve ser feito nas tabelas mencionadas.
    const mapping = await definicao_mapeamento.cRud_getFullMapeamento();

    // A URL de pesquisa está definida ao nível da tabela "Definicao_PaginaURL"
    // Caso necessário manutenção da URL, deve ser feito na tabela mencionada.
    const allURLs = await definicao_url.cRud_getURLs();
    const activeURL = allURLs.recordset.filter(({IsActive}) => IsActive == true);
    const baseURL = (activeURL.length > 0) ? activeURL[0].URL : null;

    // Métodos implementados pela biblioteca "Puppeteer"
    // Inicia uma sessão do browser "Chrominium"
    const options = { headless : true };
    const browser = await puppeteer.launch(options);

    let scraped = undefined;
    let failedExtract = false;

    try {
        // Métodos implementados pela biblioteca "Puppeteer"
        // Navega para a página
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

        page.on('response', res => {
            if(res.status() > 300){
                return undefined;
            }
        });

        // As tipologias estão definidas e devem respeitar ao que está configurado na tabela "Definicao_Mapeamento_Tipo" do servidor SQL.
        // Cada tipologia identificada requer extração num determinado formato, e por isso cada uma possui um método específico.
        // Caso necessário manutenção, deverá sofrer intervenção nos métodos abaixo listados. Atenção, é necessário conhecimentos sobre JavaScript e XPaths.
        scraped = await Promise.all(mapping.map(async (item) => {
            let result = null;
            switch (item.Tipo) {
                case 'SIMPLES':
                    let myResult = await doSimpleScrape(item, page, GUID);
                    result = {
                        key : item.NomeTabela,
                        value : myResult
                    }
                    if(myResult == undefined){
                        failedExtract = true;
                    }
                    break;            
                case 'POLIMÓRFICO TABELA 1':
                    let myTable1 = await doTableScrape_1(item, page, GUID);
                    result = {
                        key : item.NomeTabela,
                        value : myTable1
                    }
                    break;
                case 'POLIMÓRFICO TABELA 2':
                    let myTable2 = await doTableScrape_2(item, page, GUID);
                    result = {
                        key : item.NomeTabela,
                        value : myTable2
                    }
                    break;
                case 'POLIMÓRFICO TABELA 3':
                    let myTable3 = await doTableScrape_3(item, page, GUID);
                    result = {
                        key : item.NomeTabela,
                        value : myTable3
                    }
                    break;
                case 'POLIMÓRFICO LISTA':
                    let myList = await doListScrape(item, page, GUID);
                    result = {
                        key : item.NomeTabela,
                        value : myList
                    }
                    break;
            }
            return result;
        }))
    } catch(e){
        console.log('Error during Puppeteer execution! ', e);
    } finally {
        // Métodos implementados pela biblioteca "Puppeteer"
        // Encerra a sessão do browser
        await browser.close();
    }
    return (failedExtract == true) ? undefined : scraped;
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
            if(doSearch === undefined || doSearch == null){
                return undefined;
            }

            // Caso contrário, temos de ir à procura pelo "[ElementoEsperado]" nos nós irmãos/vizinhos ao elemento que pesquisamos.
            let searchFound = false;
            let searchResult = undefined;
    
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
        if(doEvaluate != undefined){
            myResult[Linha.NomeCampo] = doEvaluate;
        }
    }));
    // ## PASSO #1 : ITERAR SOBRE CADA LINHA, PESQUISAR NA PÁGINA PELO XPATH, E SE ENCONTRAR GUARDAR A INFORMAÇÃO ## //
    
    // Terminada a extração.
    return (Object.keys(myResult).length == 1) ? undefined : myResult;
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
        if(doSearch === undefined || doSearch == null){
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
        if(doSearch === undefined || doSearch == null){
            return [];
        }

        // Como é sabido, o XPath retorna o elemento agregador dos pares de informação.
        // Por isso, nos interessa iterar os nós filhos do agregador.
        let childNodes = doSearch.childNodes;

        // ## PASSO #1.1 : REMOVER OS ELEMENTOS INDESEJADOS ## //

        // O primeiro passo é remover o "lixo" que está incluído como nó filho.
        // Por isso, declara-se na variável "unexpectedElements" e usamos o método "removeChild()" do objeto "Node" para remover do "NodeList".
        let unexpectedElements = ['#text'];
        
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
    // Para a "doTableScrape_2()" espera-se que cada linha de informação esteja armazenado em apenas 1x <tr></tr> da tabela, como habitual.
    // Aqui espera-se que cada linha de informação esteja armazenado em 2x <tr></tr> da tabela. Por isso, é necessário um workaround.  
    
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
        if(doSearch === undefined || doSearch == null){
            return [];
        }

        // Como é sabido, o XPath retorna o elemento agregador dos pares de informação.
        // Por isso, nos interessa iterar os nós filhos do agregador.
        let childNodes = doSearch.childNodes;

        // ## PASSO #1.1 : REMOVER OS ELEMENTOS INDESEJADOS ## //
        // O primeiro passo é remover o "lixo" que está incluído como nó filho.
        // Por isso, declara-se na variável "unexpectedElements" e usamos o método "removeChild()" do objeto "Node" para remover do "NodeList".
        let unexpectedElements = ['#text'];
        
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
            
            // Como é sabido, espera-se que cada linha de informação esteja armazenado em 2x <tr></tr> da tabela.
            // Por isso, temos que iterar as linhas num incremento 2 a 2.
            // Por outras palavras, esperamos extrair a informação da tabela aos pares.
            // Cada par de <tr></tr><tr></tr> da tabela (2 linhas da tabela) corresponde a 1 registo da BD.
            RetLine.data.forEach((tableRow, rowIndex) => {
                // Podemos utilizar a convenção do X MOD 2 = 0, e ir buscar o X + 1.
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

            // Para cada linha da tabela, vamos iterar as linhas da [Definicao_Mapeamento_Linha]
            RetLine.data.forEach((TableLine, rowIndex) => {
                if(rowIndex % 2 == 0){
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
                }
            })
        }
    })
    // Terminada a extração.
    return myResult;
}

async function doListScrape(mappingItem, pageReference, foreignKey) {
    // Nesta tipologia, o detalhe dos dados são linhas </li> num elemento de lista ordenada, i.e. </ol>.
	// Cada lista ordenada possui uma categoria. Esta categoria precede a lista ordenada.
	// Cada categoria está contida num título.
	// Portanto, um título contém muitas categorias, e uma categoria contém muitos ítens de lista ordenada.
	
    // É esperada uma estrutura do género:
    // <h3>Título 1</h3>
    // <table>
	// 		<td>Categoria</td>
	//      <td>
	//          <ol>
	//				<li></li>
	//				<li></li>
	//				...
	//				<li></li>		
	//		    </ol>
	//      </td>
	// </table>
	// ...
    // <h3>Título N</h3>
	// ...

    // O XPath parametrizado deve ser o elemento agregador destes pares de informação.
    // Por exemplo, 
    // <div>
    //     <h3>Título 1</h3>
    //     <table>...</table>
    //     <h3>Título 2</h3>
    //     <table>...</table>
    //     <h3>Título N</h3>
    //     <table>...</table>
    // </div>

    // Utiliza o campo "[XPath]" da tabela [Definicao_Mapeamento] para encontrar o elemento HTML agregador de todos os pares de informação.
    // O mapeamento das N linhas de informação é fixo. Ainda assim, é obrigatório declarar os campos na tabela "[Definicao_Mapeamento_Linha]".
    // O título é fixo no campo "[Tipo]".
    // A categoria é fixa no campo "[Categoria]".
	// As linhas são fixadas no campo "[Descricao]" e desdobradas em vários registos.

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
        if(doSearch === undefined || doSearch == null){
            return [];
        }

        // Como é sabido, o XPath retorna o elemento agregador dos pares de informação.
        // Por isso, nos interessa iterar os nós filhos do agregador.
		let childNodes = doSearch.childNodes;

        // ## PASSO #1.1 : REMOVER OS ELEMENTOS INDESEJADOS ## //
        // O primeiro passo é remover o "lixo" que está incluído como nó filho.
        // Por isso, declara-se na variável "unexpectedElements" e usamos o método "removeChild()" do objeto "Node" para remover do "NodeList".
        let unexpectedElements = ['#text'];

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
                // Extrai o conteúdo do 1º elemento </td>. Este será a categoria.
				const category = Array.from(node.nextSibling.querySelectorAll('td'))[0].textContent;
                // É feita a iteração por cada linha "<li>". Transorma o "Node" num array simplificado.
				let items = Array.from(node.nextSibling.querySelectorAll('li'));
				let arrayItems = [];
				items.forEach(item => {
					arrayItems.push(item.innerText);
				})
                // O resultado dessa extração é armazenado num formato conveniente para iteração posterior.
                // Armazena-se num objeto JSON, na variável "myData" definida no início do PASSO #2.
				let ret = {
					type : type,
					category : category,
					items : arrayItems
				};
				myData.push(ret);
			}
        })
		// ## PASSO #1.2 : EXTRAIR A INFORMAÇÃO DA ESTRUTURA DA PÁGINA ## //
        return myData;
    }, mappingItem);
    // ## PASSO #1 : EXTRAIR A INFORMAÇÃO DO HTML NUM FORMATO CONVENIENTE ## //

    // ## PASSO #2 : EXTRAIR A INFORMAÇÃO DO FORMATO CONVENIENTE EM REGISTOS DA BD ## //
    // O PASSO #1 extraiu informação num formato JSON { type : string, category : string, items : array }.
    // Vamos iterar cada item, e para cada item, vamos correr a tabela [Definicao_Mapeamento_Linha] de modo a mapear a informação para o formato esperado da BD.
    doEvaluate.forEach((RetLine) => {
        let records = RetLine.items.map((item) => {
            return {
                Curriculo_FK : foreignKey,
                // Mapeia-se o título, de modo fixo, à coluna "Tipo" da tabela da BD.
                Tipo : RetLine.type, 
                // Mapeia-se a categoria, de modo fixo, à coluna "Category" da tabela da BD.
                Categoria : RetLine.category,
                // Mapeia-se o texto do item, de modo fixo, à coluna "Descricao" da tabela da BD.
                Descricao : item
            }
        })
        // E, no fim, finaliza-se e formaliza-se o registo por meio da adição/"concat" da lista de objetos JSON resultante ao array "myResult".
        myResult = myResult.concat(records);
    });
    // Terminada a extração.
    return myResult;
}

function helper_formatTableData(configRow, tableRow){
    // Este método faz a conversão da informação extraída para o formato esperado pela base de dados.
    // O tipo do dado está definido ao nível do campo "[Definicao_Mapeamento_Linha].[TipoDado]".

    // Armazena o resultado da conversão. É esperado que tenha o formato { key : string, value : object }.
    // Na maior parte dos casos, essa lista terá apenas 1 item. Poderá ter 2 num caso em que 1 informação é convertida para 2 campos da BD.
    // No caso em que 1 informação é convertida para 2 campos da BD, obrigatoriamente, o campo [Definicao_Mapeamento_Linha].[NomeCampo] possui vários nomes de campo de BD separados por vírgula (,).
    let result = [];

    switch (configRow.TipoDado) {
        case 'Data':
            // O tipo de data mais comum identificado é aqueles que representa um intervalo de tempo.
            // Por exemplo, na listagem das experiências profissionais, indica o início e fim que esteve envolvido num determinado cargo, numa determinada empresa.
            // O formato nestes casos é, por exemplo, "25/02/2020 - 25/03/2020".

            // Os formatos identificados são:
            // 1. "25/02/2020 - 25/03/2020" : representa início e fim;
            // 2. "25/02/2020 - Atual" : representa início, e indica que ainda está em curso;
            // 3. "25/03/2020" : representa apenas o início ou apenas o fim, i.e. o intervalo de tempo está incompleto.

            // O pedaço de código que segue faz essa identificação do formato, e utiliza o método auxiliar "helper_getDate()" para traduzir em data yyyy-MM-dd.
            
            // Permitirá mapear a informação extraída para N campos da BD.
            // Trata-se do campo [Definicao_Mapeamento_Linha].[NomeCampo], onde estão declarados os vários campos da BD separados por vírgula.
            let awaitedField = configRow.NomeCampo.split(',');

            // Trata-se do formato esperado da data, conforme indicado.
            // Por exemplo, "25/02/2020 - 25/03/2020".
            let datePayload = tableRow[configRow.IndiceEsperado].split(' - ');

            let datePayload_lower = datePayload[0];
            let datePayload_upper = datePayload[1];

            let startDateString = undefined;
            let endDateString = undefined;

            if((datePayload_upper != undefined)){
                if(datePayload_upper.includes('Atual')){
                    // "25/02/2020 - Atual" : representa início, e indica que ainda está em curso;
                    startDateString = datePayload_lower;
                    endDateString = undefined;
                } else {
                    // "25/02/2020 - 25/03/2020" : representa início e fim;
                    startDateString = datePayload_lower;
                    endDateString = datePayload_upper;
                }
            }
            else if((datePayload_upper == undefined)) {
                // "25/03/2020" : representa apenas o início ou apenas o fim, i.e. o intervalo de tempo está incompleto.
                startDateString = undefined;
                endDateString = datePayload_lower;
            }

            if(startDateString){
                // Formatação e finalização do payload no array de retorno.
                result.push({
                    key : awaitedField[0],
                    value : helper_getDate(startDateString)
                });
            }
            if(endDateString){
                // Formatação e finalização do payload no array de retorno.
                result.push({
                    key : awaitedField[1],
                    value : helper_getDate(endDateString)
                });
            }
            break;
        case 'Texto':
            // Para o tipo de "texto", não são feitas conversões.
            result.push({
                key : configRow.NomeCampo,
                value : tableRow[configRow.IndiceEsperado].trim()
            });
            break;
        case 'Boolean':
            // Para o tipo de "boolean", é obrigatório que o campo [Definicao_Mapeamento_Linha].[Boolean_PalavrasChave] esteja preenchido.
            // É verificado o índice esperado do array, e se conter a palavra chave, então é marcado com TRUE.
            result.push({
                key : configRow.NomeCampo,
                value : ((tableRow[configRow.IndiceEsperado].includes(configRow.Boolean_PalavrasChave) == true) ? 1 : 0)
            });
            break;
        case 'Integer':
            // Para o tipo de "integer", é feito apenas a conversão com parseInt().
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
    // Normalização da string, por meio de substituição das palavras indesejadas.
    let innerDateString = dateString.replace('\Concluído','').replace('\Frequentou','').replace('Atual','').trim();
    let result = '';
    // Contempla 4 cenários de data:
    // 1. "25/02/2020". Representa a data completa.
    // 2. "02/2020". Representa "fevereiro de 2020", mas não há dia.
    // 3. "2020". Representa "2020", mas não há dia, nem mês.

    // Nestes casos em que a data está incompleta, é sempre considerado o 1º dia ou 1º mês daquela unidade.
    // Por exemplo, "02/2020" será convertido para "2020-02-01".
    // Por exemplo, "2020" será convertido para "2020-01-01".
    switch (innerDateString.length) {
        case 10:
            let dateString_fullDate = innerDateString;
            result = dateString_fullDate.split('/')[0] + '-' + dateString_fullDate.split('/')[1] + '-' +  dateString_fullDate.split('/')[2];
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