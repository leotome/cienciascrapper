const mssql = require('mssql');

exports.connect = () => {
    const config = {
        server : 'cienciascrapper.database.windows.net,1433',
        database : 'cienciascrapper',
        username : 'leonardo.tome',
        password : 'Leo3lara1901',
        encrypt : true
    }
    return new Promise((resolve, reject) => {
        mssql.connect(`Server=${config.server};Database=${config.database};User Id=${config.username};Password=${config.password};Encrypt=${config.encrypt}`)
        .then(pool => {
            resolve({pool : pool, error : undefined});
        })
        .catch(err => {
            reject({pool : undefined, error : err});
        })
    });
}