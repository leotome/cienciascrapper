const utils = require("./config_utils");
const report_definition = require('../models/config_models').report_definition;

exports.cRud_getDefinitions = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    report_definition.cRud_getDefinitions()
    .then(result => {
        return res.status(200).send(result.recordset);
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}