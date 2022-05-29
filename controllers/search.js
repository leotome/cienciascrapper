const utils = require("./config_utils");

exports.cRud_doSearchCVs = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    const body = req.body;
    body.forEach(item => {
        switch (item.table) {
            case "Curriculo":
                var Curriculo_Filter = "";
                if(item.type == "LIKE"){
                    Curriculo_Filter = "[Curriculo].[NomeCompleto] LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] LIKE '%" + item.value + "%' OR [Curriculo].[Emails] LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    Curriculo_Filter = "[Curriculo].[NomeCompleto] NOT LIKE '%" + item.value + "%' OR [Curriculo].[NomesCitacao] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Resumo] NOT LIKE '%" + item.value + "%' OR [Curriculo].[CienciaId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[OrcidId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[GoogleScholarId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ResearcherId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[ScopusAuthorId] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Moradas] NOT LIKE '%" + item.value + "%' OR [Curriculo].[Emails] NOT LIKE '%" + item.value + "%' OR [Curriculo].[DominiosAtuacao] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_Actividade":
                break;
            case "Curriculo_Distincao":
                break;
            case "Curriculo_Formacao":
                break;
            case "Curriculo_PercursoProfissional":
                break;
            case "Curriculo_Producao":
                var Curriculo_Producao_Filter = "";
                if(item.type == "LIKE"){
                    Curriculo_Producao_Filter = "[Curriculo_Producao].[Tipo] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    Curriculo_Producao_Filter = "[Curriculo_Producao].[Tipo] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Categoria] NOT LIKE '%" + item.value + "%' OR [Curriculo_Producao].[Descricao] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_ProeficienciaIdioma":
                var Curriculo_ProeficienciaIdioma_Filter = "";
                if(item.type == "LIKE"){
                    Curriculo_ProeficienciaIdioma_Filter = "[Curriculo_ProeficienciaIdioma].[Idioma] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] LIKE '%" + item.value + "%'";
                }
                if(item.type == "NOT_LIKE"){
                    Curriculo_ProeficienciaIdioma_Filter = "[Curriculo_ProeficienciaIdioma].[Idioma] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Conversacao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Leitura] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Escrita] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[Compreensao] NOT LIKE '%" + item.value + "%' OR [Curriculo_ProeficienciaIdioma].[PeerReview] NOT LIKE '%" + item.value + "%'";
                }
                break;
            case "Curriculo_Projecto":
                break;        
            default:
                break;
        }
    })
    return res.status(200).send(body);
}
