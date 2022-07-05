const utils = require("./config_utils");
const report_definition = require('../models/config_models').report_definition;
const generic = require("../models/config_models").generic;

exports.cRud_getDefinitions = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    // Este método obtém todas as definições de relatório ativas em sistema
    // É utilizado na página de listagem dos relatórios, permite ao utilizador escolher qual relatório quer ver
    report_definition.cRud_getDefinitions()
    .then(result => {
        return res.status(200).send(result.recordset);
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}

exports.cRud_runReport = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if(req.params.Id === null){
        return res.status(400).send({ status : 400, message: "Missing parameter Id." });
    }
    // Apesar de não existir um campo que indique esta tipologia, um relatório pode ser de dois tipos:
    // - Relatório estático/simples
    //   Os relatórios estáticos/simples são aqueles que é apenas obtida uma listagem de informação com base em
    //   parâmetros de filtragem pré-definidos pelo administrador do sistema.
    
    // - Relatório dinâmico
    //   Os relatórios dinâmicos são aqueles em que, para mostrar alguma informação, é necessário que o utilizador
    //   defina parâmetros de filtragem. Estes são inseridos na query de consulta, e então apresentados os resultados
    //   aos utilizadores.
    try {
        // Faz consulta à base de dados para obter os metadados que correspondem à definição de relatório
        let definition = await report_definition.cRud_getDefinition({ Id : req.params.Id });
        // Faz consulta à base de dados para obter os metadados que correspondem aos parâmetros do relatório
        // Esta variável pode retornar 0 registos, que é nos casos em que o relatório é simples/estático.
        let definition_items = await report_definition.cRud_getDefinitionItems({ Id : req.params.Id });

        // Este é o pedaço de código responsável por devolver, ao front-end, as configurações do relatório estático/simples.
        if(definition.recordset.length > 0 && definition_items.recordset.length == 0){
            // Como não será necessário nenhuma intervenção pelo utilizador, com este método devolvemos o resultado da consulta 
            // SQL à base de dados, no atributo "reportData" da resposta.
            let reportData = await generic.cRud_getData(definition.recordset[0].SQLStatement);
            let finalResponse = {
                reportTitle : definition.recordset[0].Name,
                reportFilters : [],
                reportData : reportData.recordset
            }
            return res.status(200).send(finalResponse);
        // Este é o pedaço de código responsável por devolver, ao front-end, as configurações do relatório dinâmico.
        } else if(definition.recordset.length > 0 && definition_items.recordset.length > 0) {
            // Como será necessário uma intervenção pelo utilizador, com este método devolvemos o atributo "reportData" vazio.
            let finalResponse = {
                reportTitle : definition.recordset[0].Name,
                reportFilters : definition_items.recordset,
                reportData : []
            }
            return res.status(200).send(finalResponse);
        } else {
            return res.status(404).send({status : 404, message: 'This report definition does not exist. Please try again, or contact support.'});
        }
    } catch (error) {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    }
}

exports.cRud_runReportWithFilters = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if(req.params.Id === null){
        return res.status(400).send({ status : 400, message: "Missing parameter Id." });
    }
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    // Este método só é executado quando o utilizador submeter os parâmetros de pesquisa de um relatório dinâmico.
    // Portanto, só se aplica quando é um relatório dinâmico!
    console.log(req.body)
    try {
        // Faz consulta à base de dados para obter os metadados que correspondem à definição de relatório
        let definition = await report_definition.cRud_getDefinition({ Id : req.params.Id });
        // Esta variável pode retornar 0 registos, que é nos casos em que o relatório é simples/estático.
        // Ao contrário do que é verificado no método "cRud_runReport", neste caso, é esperado que SEMPRE retorne resultados.
        let definition_items = await report_definition.cRud_getDefinitionItems({ Id : req.params.Id });
        console.log(definition)
        console.log(definition_items)
        if(definition.recordset.length > 0 && definition_items.recordset.length > 0){
            let error_paramMapping = false;
            // Verificação de segurança, para garantir que não há injeção de código malicioso.
            // Só permite definir parâmetros se o mesmo constar na definição/metadados.
            let bodyParameters = req.body.map((parameter) => {
                let definition_item = definition_items.recordset.filter(({ParameterName}) => ParameterName == parameter.ParameterName);
                // Se o parâmetro indicado no corpo da requisição não existir nos metadados, então retorna erro.
                if(definition_item.length == 0){
                    error_paramMapping = true;    
                }
                // Caso contrário, cria o objeto com o parâmetro e valor.
                else {
                    return {ParameterName : parameter.ParameterName, Value : parameter.Value, Definition : definition_item};
                }
            })
            console.log(bodyParameters)
            if(error_paramMapping == true){
                return res.status(404).send({status : 404, message: 'This report definition does not exist. Please try again, or contact support.'});
            }
            // Busca a definição de query SQL, dos metadados
            let SQLStatement = definition.recordset[0].SQLStatement;
            console.log(SQLStatement)
            // Para cada parâmetro, substituir na query original
            // Aqui é feita a criação dinâmica da consulta
            bodyParameters.forEach((parameter) => {
                let ParameterName = parameter.ParameterName;
                let Value = parameter.Value;
                SQLStatement = SQLStatement.replaceAll(ParameterName, Value);
            })
            console.log(SQLStatement)
            // Obter os dados para retornar ao front-end
            let reportData = await generic.cRud_getData(SQLStatement);
            console.log(reportData)
            // Devolve os dados ao front-end
            let finalResponse = {
                reportData : reportData.recordset
            }
            return res.status(200).send(finalResponse);
        } else {
            return res.status(404).send({status : 404, message: 'This report definition does not exist. Please try again, or contact support.'});
        }
    } catch (error) {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    }
}