const utils = require("./config_utils");
const appmenu = require('../models/config_models').appmenu;

exports.cRud_getMenusForUser = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    appmenu.cRud_getMenusForUser(TokenData.Username)
    .then(result => {
        return res.status(200).send(result.recordset);
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}
