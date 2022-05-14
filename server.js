const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`);
})

app.use(express.static("public_html"));

const test = require('./controllers/scrape_cienciavitae');
const models = require('./models/config_models');
(async () => {
    const cienciaID = '6F1A-06CB-E82D';
    let result = await test.doScrapeVitae(cienciaID);

    result.forEach((res) => {
        if(res.key == 'Curriculo'){
            models.curriculo.Crud_setRecord(res.value);
        }
        if(res.key == 'Curriculo_ProeficienciaIdioma'){
            res.value.forEach((it) => {
                models.curriculo_proeficiencia_idioma.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Formacao'){
            res.value.forEach((it) => {
                models.curriculo_formacao.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_PercursoProfissional'){
            res.value.forEach((it) => {
                models.curriculo_percurso_profissional.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Projecto'){
            res.value.forEach((it) => {
                models.curriculo_projecto.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Producao'){
            res.value.forEach((it) => {
                models.curriculo_producao.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Actividade'){
            res.value.forEach((it) => {
                models.curriculo_actividade.Crud_setRecord(it);
            })
        }

        if(res.key == 'Curriculo_Distincao'){
            res.value.forEach((it) => {
                models.curriculo_distincao.Crud_setRecord(it);
            })
        }
    })
    console.log('terminado')

})();


