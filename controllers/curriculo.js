const utils = require("./config_utils");
const curriculo = require('../models/config_models').curriculo;

exports.cRud_getById = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if(req.params.Id === null){
        return res.status(400).send({ status : 400, message: "Missing parameter Id." });
    }
    curriculo.cRud_getById({Id : req.params.Id})
    .then(result => {
        return res.status(200).send(result.recordset);
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}