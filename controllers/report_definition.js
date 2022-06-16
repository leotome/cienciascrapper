const utils = require("./config_utils");
const report_definition = require('../models/config_models').report_definition;
const generic = require("../models/config_models").generic;

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

exports.cRud_runReport = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if(req.params.Id === null){
        return res.status(400).send({ status : 400, message: "Missing parameter Id." });
    }
    try {
        let definition = await report_definition.cRud_getDefinition({ Id : req.params.Id });
        if(definition.recordset.length > 0){
            let reportData = await generic.cRud_getData(definition.recordset[0].SQLStatement);
            let finalResponse = {
                reportTitle : definition.recordset[0].Name,
                reportData : reportData.recordset
            }
            return res.status(200).send(finalResponse);
        } else {
            return res.status(404).send({status : 401, message: 'This report definition does not exist. Please try again, or contact support.'});
        }
    } catch (error) {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    }
}