module.exports = app => {
    var router = require('express').Router();
    const controller = require("../../controllers/config_controllers");

    // @http-verb : post
    // @table : User
    // @body : expects { "Email" : string, "Password" : string }
    router.post('/users/login', controller.user.login);

    // @http-verb : post
    // @table : User
    // @body : expects { "FirstName" : string, "LastName" : string, "Email" : string, "Username" : string, "Password" : string }
    router.post('/users/register', controller.user.register);

    



    // @http-verb : get
    // @table : User
    router.get('/cv', () => {return null;});

    app.use('/api', router);
}