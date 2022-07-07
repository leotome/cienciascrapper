const utils = require("./config_utils");
const generic = require("../models/config_models").generic;

exports.cRud_doSearchCVs = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    const body = req.body;
    let queryContainer = [];
    body.forEach(item => {
        let container = queryContainer.find(({table}) => table == item.table);
        if(container == undefined){
            queryContainer.push({
                table : item.table,
                filters : []
            }); 
        }
    })
    // Estes filtros são construídos com base nas escolhas feitas pelos utilizadores na interface gráfica.
    // As consultas são construídas de acordo com o tipo de dados, e no fim é criada um argumento de consulta dinâmico.
    body.forEach(item => {
        var filter = "";
        switch (item.table) {
            // Construir consulta dinâmica para a tabela [Curriculo]
            case "Curriculo":
                if(item.type == "LIKE"){
                    filter = "[Curriculo].[NomeCompleto] LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] LIKE '%" + item.value + "%' OR [Curriculo].[Emails] LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo].[NomeCompleto] NOT LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] NOT LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Emails] NOT LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] NOT LIKE '%" + item.value + "%'";
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_Actividade]
            case "Curriculo_Actividade":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Actividade].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[Descricao] LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[CursoInstituicao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Actividade].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[Descricao] NOT LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[CursoInstituicao] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "MONTHYEAR_GREATER_START"){
                    filter = "[Curriculo_Actividade].[PeriodoInicio] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_GREATER_END"){
                    filter = "[Curriculo_Actividade].[PeriodoFim] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_START"){
                    filter = "[Curriculo_Actividade].[PeriodoInicio] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_END"){
                    filter = "[Curriculo_Actividade].[PeriodoFim] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "IS_ACTUAL"){
                    filter = "[Curriculo_Actividade].[Atual] = " + ((item.value === "SIM") ? "1" : "0" + "");
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_Distincao]
            case "Curriculo_Distincao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Distincao].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Distincao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Distincao].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Distincao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "YEAR_GREATER_START"){
                    filter = "[Curriculo_Distincao].[Ano] >= " + item.value + "";
                }
                if(item.type == "YEAR_LESS_END"){
                    filter = "[Curriculo_Distincao].[Ano] <= " + item.value + "";
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_Formacao]
            case "Curriculo_Formacao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Formacao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Formacao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "MONTHYEAR_GREATER_START"){
                    filter = "[Curriculo_Formacao].[PeriodoInicio] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_GREATER_END"){
                    filter = "[Curriculo_Formacao].[PeriodoFim] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_START"){
                    filter = "[Curriculo_Formacao].[PeriodoInicio] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_END"){
                    filter = "[Curriculo_Formacao].[PeriodoFim] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "IS_ACTUAL"){
                    filter = "[Curriculo_Formacao].[Concluido] = " + ((item.value === "SIM") ? "0" : "1" + "");
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_PercursoProfissional]
            case "Curriculo_PercursoProfissional":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_PercursoProfissional].[Tipo] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[CategoriaInstituicao] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[Empregador] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_PercursoProfissional].[Tipo] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[CategoriaInstituicao] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[Empregador] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "MONTHYEAR_GREATER_START"){
                    filter = "[Curriculo_PercursoProfissional].[PeriodoInicio] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_GREATER_END"){
                    filter = "[Curriculo_PercursoProfissional].[PeriodoFim] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_START"){
                    filter = "[Curriculo_PercursoProfissional].[PeriodoInicio] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_END"){
                    filter = "[Curriculo_PercursoProfissional].[PeriodoFim] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "IS_ACTUAL"){
                    filter = "[Curriculo_PercursoProfissional].[Atual] = " + ((item.value === "SIM") ? "1" : "0" + "");
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_Producao]
            case "Curriculo_Producao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Producao].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Producao].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "RELEASE_YEAR"){
                    filter = "[Curriculo_Producao].[Ano] = " + item.value;
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_ProeficienciaIdioma]
            case "Curriculo_ProeficienciaIdioma":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_ProeficienciaIdioma].[Idioma] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_ProeficienciaIdioma].[Idioma] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] NOT LIKE '%" + item.value + "%'";
                }
                break;
            // Construir consulta dinâmica para a tabela [Curriculo_Projecto]
            case "Curriculo_Projecto":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Projecto].[Tipo] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Financiadores] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Designacao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Projecto].[Tipo] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Financiadores] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Designacao] NOT LIKE '%" + item.value + "%'";
                }
                if(item.type == "MONTHYEAR_GREATER_START"){
                    filter = "[Curriculo_Projecto].[PeriodoInicio] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_GREATER_END"){
                    filter = "[Curriculo_Projecto].[PeriodoFim] >= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_START"){
                    filter = "[Curriculo_Projecto].[PeriodoInicio] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                if(item.type == "MONTHYEAR_LESS_END"){
                    filter = "[Curriculo_Projecto].[PeriodoFim] <= '" + item.value.split('-')[1] + "-" + item.value.split('-')[0] + "-" + "01" + "'";
                }
                break;        
            default:
                break;
        }
        let container = queryContainer.find(({table}) => table == item.table);
        container.filters.push(filter);
    })

    let joins = queryContainer.map(item => {
        // Uma vez que a base da consulta é feita com a tabela [Curriculo], podemos ignorar esta na construção das ligações "LEFT JOIN"
        // Será utilizada, entretanto, na construção da cláusula WHERE
        if(item.table != 'Curriculo'){
            return "LEFT JOIN " + "[" + item.table + "]" + " ON [Curriculo].[Id] = " + "[" + item.table + "]" + ".[Curriculo_FK]"
        }
    })
    let wheres = [];
    queryContainer.forEach(item => {
        item.filters.forEach(filter => {
            wheres.push(filter);
        })
    })

    // A consulta, do tipo "SELECT", terá as seguintes cláusulas: "LEFT JOIN", "WHERE"
    let baseQuery = "SELECT [Curriculo].[Id], [Curriculo].[CienciaId], [dbo].[ToProperCase]([Curriculo].[NomeCompleto]) AS 'NomeCompleto', [Curriculo].[DataExtracao] FROM [Curriculo]"
    // Abaixo é feita a adição da cláusula LEFT JOIN
    let baseAddJoins = joins.join(" ");
    // Abaixo é feita a adição da cláusula WHERE
    let baseAddWheres = "(" + wheres.join(") AND (") + ")";
    // Abaixo é feita a construção dinâmica da consulta
    let fullQuery = baseQuery + " " + baseAddJoins + " WHERE ([UltimaExtracao] = 1) AND (" + baseAddWheres + ") ORDER BY [Curriculo].[NomeCompleto] ASC";

    let result = await generic.cRud_getData(fullQuery);

    let formatResult = [];
    result.recordset.forEach((item) => {
        let container = formatResult.find(({CienciaId}) => CienciaId == item.CienciaId);
        if(container == undefined){
            formatResult.push(item);
        }
    })

    return res.status(200).send(formatResult);
}
