const user = require('../models/config_models').user;

exports.login = async (req, res) => {
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    const Email = req.body.Email;
    const Password = req.body.Password;
    user.cRud_usersByEmail(Email)
    .then(async (result) => {
        if(result.length == 0){
            return res.status(401).send({ status: 401, message: "User not found." });
        }
        const User = result.recordset[0];
        if(User.Password == Password){
            const accessToken = jwt.sign(User, "tmpvAxYkGPsAF2z5tmL9fAfgB7SnxXyZT9h6NjEM", {expiresIn: 7 * 60 * 60});
            res.cookie("cienciascrapper_app", accessToken, {maxAge: 1000 * 60 * 60 * 7, httpOnly: true});
            return res.status(200).json({ status : 200, message : "Login sucessful!", accessToken: accessToken, data : { FullName : User.FirstName + " " + User.LastName, Type : "User" } });
        } else {
            return res.status(401).send({ status : 401, message : "Password incorrect." });
        }
    })
    .catch((error) => {
        return res.status(401).send({message: JSON.stringify(error)});
    })
}

exports.register = async (req, res) => {
    if (req.body === undefined || !req.body) {
        return res.status(400).send({ status: 400, message: "Body cannot be empty." });
    }
    const body = req.body;
    user.Crud_registerUser(body)
    .then((result) => {
        var response = { status : 200, message: "User created successfully!" };
        res.status(201).send(response);
    })
    .catch((error) => {
        res.status(400).send({message: JSON.stringify(error)});
    })
}
