const utils = require("./config_utils");
const curriculo_projecto = require('../models/config_models').curriculo_projecto;

exports.cRud_getByCurriculoFK = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if(req.params.Curriculo_FK === null){
        return res.status(400).send({ status : 400, message: "Missing parameter Curriculo_FK." });
    }
    curriculo_projecto.cRud_getByCurriculoFK({Id : req.params.Curriculo_FK})
    .then(result => {
        return res.status(200).send(result.recordset);
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}