module.exports = app => {
    var router = require('express').Router();
    const controller = require("../controllers/config_controllers");

    // @http-verb : post
    // @table : User
    // @body : expects { "Username" : string, "Password" : string }
    router.post('/users/login', controller.user.login);

    // @http-verb : post
    // @table : User
    // @body : expects { "FirstName" : string, "LastName" : string, "Email" : string, "Username" : string, "Password" : string }
    router.post('/users/register', controller.user.register);

    // @http-verb : get
    // @table : User
    router.get('/users/logout', controller.user.logout);

    // @http-verb : get
    // @table : User
    router.get('/users/info', controller.user.getUserInfo);

    // @http-verb : post
    // @table : User
    // @body : expects { "FirstName" : string, "LastName" : string, "Email" : string, "Password" : string }
    router.post('/users/update', controller.user.crUd_updateUser);    

    // @http-verb : get
    // @table : AppMenu
    router.get('/config/menus', controller.appmenu.cRud_getMenusForUser);

    // @http-verb : post
    // @table : Curriculo*
    router.post('/search/find', controller.search.cRud_doSearchCVs);

    // @http-verb : post
    // @table : Curriculo*
    router.post('/scrape/cienciavitae', controller.scrape.Crud_doScrapeCVs);

    // @http-verb : get
    // @table : Curriculo
    // @param : expects { "Id" : string }
    router.get('/curriculum/header/:Id', controller.curriculo.cRud_getById);

    // @http-verb : get
    // @table : Curriculo
    // @param : expects { "CienciaId" : string }
    router.get('/curriculum/versions/:CienciaId', controller.curriculo.cRud_getVersions);

    // @http-verb : get
    // @table : Curriculo_Actividade
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/activities/:Curriculo_FK', controller.curriculo_actividade.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_Distincao
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/distinctions/:Curriculo_FK', controller.curriculo_distincao.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_PercursoProfissional
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/affiliations/:Curriculo_FK', controller.curriculo_percurso_profissional.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_Formacao
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/education/:Curriculo_FK', controller.curriculo_formacao.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_Producao
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/outputs/:Curriculo_FK', controller.curriculo_producao.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_Projecto
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/projects/:Curriculo_FK', controller.curriculo_projecto.cRud_getByCurriculoFK);

    // @http-verb : get
    // @table : Curriculo_ProeficienciaIdioma
    // @param : expects { "Curriculo_FK" : string }
    router.get('/curriculum/languages/:Curriculo_FK', controller.curriculo_proeficiencia_idioma.cRud_getByCurriculoFK);    

    app.use('/api', router);
}