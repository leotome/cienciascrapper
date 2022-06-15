const utils = require("./config_utils");

exports.cRud_doSearchCVs = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    const body = req.body;
    let queryContainer = body.map(item => {
        return {
            table : item.table,
            filters : []
        }
    })
    body.forEach(item => {
        var filter = "";
        switch (item.table) {
            case "Curriculo":
                if(item.type == "LIKE"){
                    filter = "[Curriculo].[NomeCompleto] LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] LIKE '%" + item.value + "%' OR [Curriculo].[Emails] LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo].[NomeCompleto] NOT LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] NOT LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Emails] NOT LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_Actividade":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Actividade].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[Descricao] LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[CursoInstituicao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Actividade].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[Descricao] NOT LIKE '%" + item.value + "%' OR [Curriculo_Actividade].[CursoInstituicao] NOT LIKE '%" + item.value + "%'";
                }
                // TODO
                break;
            case "Curriculo_Distincao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Distincao].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Distincao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Distincao].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Distincao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                // TODO
                break;
            case "Curriculo_Formacao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Formacao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Formacao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                // TODO
                break;
            case "Curriculo_PercursoProfissional":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_PercursoProfissional].[Tipo] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[CategoriaInstituicao] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[Empregador] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_PercursoProfissional].[Tipo] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[CategoriaInstituicao] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_PercursoProfissional].[Empregador] NOT LIKE '%" + item.value + "%'";
                }
                // TODO
                break;
            case "Curriculo_Producao":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Producao].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Producao].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_ProeficienciaIdioma":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_ProeficienciaIdioma].[Idioma] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_ProeficienciaIdioma].[Idioma] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_Projecto":
                if(item.type == "LIKE"){
                    filter = "[Curriculo_Projecto].[Tipo] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Financiadores] LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Designacao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    filter = "[Curriculo_Projecto].[Tipo] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Financiadores] NOT LIKE '%" + item.value + "%'" + " OR " + "[Curriculo_Projecto].[Designacao] NOT LIKE '%" + item.value + "%'";
                }
                // TODO
                break;        
            default:
                break;
        }
        let container = queryContainer.find(({table}) => table == item.table);
        container.filters.push(filter);
    })
    return res.status(200).send(queryContainer);
}
