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
    const allCienciaId = ['6F1A-06CB-E82D', '5B1C-8EE9-381A', '361E-C437-12DC', '691D-4349-6870', 'BD1A-1C89-616D', '561B-AD62-8002', '8E13-33CF-F31A', 'A719-B03D-2B98', 'B713-FC49-7409', '401B-D2BD-0E3D', '991A-44CC-149B'];
    const problematicos = ['361E-C437-12DC', 'BD1A-1C89-616D', 'A719-B03D-2B98'];
    const cienciaID = allCienciaId[8];
    let result = await test.doScrapeVitae(cienciaID);

    result.forEach(async (res) => {
        if(res.key == 'Curriculo'){
            await models.curriculo.Crud_setRecord(res.value);
        }
        if(res.key == 'Curriculo_ProeficienciaIdioma'){
            res.value.forEach(async (it) => {
                await models.curriculo_proeficiencia_idioma.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Formacao'){
            res.value.forEach(async (it) => {
                await  models.curriculo_formacao.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_PercursoProfissional'){
            res.value.forEach(async (it) => {
                await models.curriculo_percurso_profissional.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Projecto'){
            res.value.forEach(async (it) => {
                await models.curriculo_projecto.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Producao'){
            res.value.forEach(async (it) => {
                await models.curriculo_producao.Crud_setRecord(it);
            })
        }
        if(res.key == 'Curriculo_Actividade'){
            res.value.forEach(async (it) => {
                await models.curriculo_actividade.Crud_setRecord(it);
            })
        }

        if(res.key == 'Curriculo_Distincao'){
            res.value.forEach(async (it) => {
                await models.curriculo_distincao.Crud_setRecord(it);
            })
        }
    })
    console.log('terminado')

})();


