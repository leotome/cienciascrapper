const jwt = require("jsonwebtoken");

module.exports = {
    authenticateToken : function(headers) {
        authenticateToken(headers);
        return Helper_TokenData
    }
}

Helper_TokenData = null;

function authenticateToken(req) {
    const Authorization = req.headers["authorization"];
    const cookies = req.cookies;
    let payload = null;
    if(Authorization){
        const token = Authorization && Authorization.split(" ")[1];
        payload = token;
    } else if(cookies){
        const token = cookies.cienciascrapper_app;
        payload = token;
    } else {
        Helper_TokenData = null;
        return null;
    }
    if(payload != null){
        jwt.verify(payload, "tmpvAxYkGPsAF2z5tmL9fAfgB7SnxXyZT9h6NjEM", (err, data) => {
            if(err){
                Helper_TokenData = null;
                return null;
            }
            Helper_TokenData = data;
            return data;
        });
    }
    return null;
}