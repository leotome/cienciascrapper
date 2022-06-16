const user = require('../models/config_models').user;
const jwt = require("jsonwebtoken");
const utils = require("./config_utils");

exports.getUserInfo = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    const Username = TokenData.Username;
    user.cRud_usersByUsername(Username)
    .then(async (result) => {
        const User = result.recordset[0];
        if(User.IsActive == true){
            User.Password = undefined;
            return res.status(200).json(User);
        } else {
            return res.status(401).send({ status : 401, message : "Não está autorizado a continuar. Por favor contacte o suporte." });
        }
    })
    .catch((error) => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}

exports.crUd_updateUser = async (req, res) => {
    let TokenData = utils.authenticateToken(req);
    if(TokenData === null){
        return res.status(400).send({ status : 400, message: "You are not authorized to perform this action." });
    }
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    const body = req.body;
    body["Username"] = TokenData.Username;
    console.log(body)
    user.crUd_updateUser(body)
    .then(result => {
        return res.status(200).send({status : 200});
    })
    .catch(error => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}

exports.login = async (req, res) => {
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    const Username = req.body.Username;
    const Password = req.body.Password;
    user.cRud_usersByUsername(Username)
    .then(async (result) => {
        if(result.length == 0){
            return res.status(401).send({ status: 401, message: "O utilizador ou palavra-passe estão incorretos." });
        }
        const User = result.recordset[0];
        if(User.IsActive == false){
            return res.status(401).send({ status : 401, message : "Não está autorizado a continuar. Por favor contacte o suporte." });
        }
        else if(User.IsActive == true && User.Password == Password){
            const UserJWT = {FirstName : User.FirstName, LastName : User.LastName, Username : User.Username};
            const accessToken = jwt.sign(UserJWT, "tmpvAxYkGPsAF2z5tmL9fAfgB7SnxXyZT9h6NjEM", {expiresIn: 7 * 60 * 60});
            res.cookie("cienciascrapper_app", accessToken, {maxAge: 1000 * 60 * 60 * 7, httpOnly: true});
            return res.status(200).json({ status : 200, message : "Autenticado com sucesso!", accessToken: accessToken, data : { FullName : User.FirstName + " " + User.LastName, Type : "1" } });
        } else {
            return res.status(401).send({ status : 401, message : "O utilizador ou palavra-passe estão incorretos." });
        }
    })
    .catch((error) => {
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    })
}

exports.register = async (req, res) => {
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    const body = req.body;
    try {
        const ExistingUser = await user.cRud_usersByUsername(body.Username);
        const UserExists = (ExistingUser.recordset.length > 0);
        if(UserExists == true){
            return res.status(401).send({ status: 401, message: "Este utilizador já existe. Por favor escolha outro. Caso queira recuperar a sua palavra-passe, por favor contacte o suporte." });
        }
        const RegisterUser = await user.Crud_registerUser(body);
        var response = { status : 201, message: "O utilizador foi criado com sucesso! Para continuar, por favor faça login." };
        res.status(201).send(response);
    } catch (error){
        return res.status(401).send({status : 401, message: JSON.stringify(error)});
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('cienciascrapper_app');
    return res.status(440).send({status: 440, message : 'A sessão foi encerrada com sucesso!'});
};