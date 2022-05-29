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
    // @table : AppMenu
    router.get('/config/menus', controller.appmenu.cRud_getMenusForUser);

    // @http-verb : post
    // @table : Curriculo*
    router.post('/search/find', controller.search.cRud_doSearchCVs);

    // @http-verb : post
    // @table : Curriculo*
    router.post('/scrape/cienciavitae', controller.scrape.Crud_doScrapeCVs);

    app.use('/api', router);
}