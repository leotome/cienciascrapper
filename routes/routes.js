module.exports = app => {
    var router = require('express').Router();
    //const controller = require("../../controllers/config_controllers");

    // @http-verb : get
    // @table : User
    router.get('/cv', () => {return null;});

    app.use('/api', router);
}