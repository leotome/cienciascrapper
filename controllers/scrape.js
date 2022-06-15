const utils = require("./config_utils");
const scrape_cienciavitae = require("./scrape_cienciavitae");
const models = require('../models/config_models');

exports.Crud_doScrapeCVs = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    const body = req.body;
    const scrp = await Promise.all(body.map(async (item) => {
        let result = await scrape_cienciavitae.doScrapeVitae(item);
        return {
            CienciaId : item,
            success : (result == undefined) ? false : true,
            records : result
        };
    }))

    const insertDB = await Promise.all(scrp.map(async (scrp_result) => {
        if(scrp_result.success == true){
            await Promise.all(scrp_result.records.map(async (cv_section) => {
                if(cv_section.key == 'Curriculo'){
                    await models.curriculo.Crud_setRecord(cv_section.value);
                    await models.curriculo.Crud_setLatest(cv_section.value);
                }
                if(cv_section.key == 'Curriculo_ProeficienciaIdioma'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_proeficiencia_idioma.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_Formacao'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_formacao.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_PercursoProfissional'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_percurso_profissional.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_Projecto'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_projecto.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_Producao'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_producao.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_Actividade'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_actividade.Crud_setRecord(it);
                    })
                }
                if(cv_section.key == 'Curriculo_Distincao'){
                    cv_section.value.forEach((it) => {
                        models.curriculo_distincao.Crud_setRecord(it);
                    })
                }
            }))
        }
    }));

    return res.status(200).send(scrp);
}
