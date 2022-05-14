const mssql = require('mssql');

// https://www.npmjs.com/package/mssql

exports.connect = () => {
    const config = {
        server : '192.168.1.120,1433',
        database : 'cienciascrapper',
        username : 'sa',
        password : 'qwerty',
        encrypt : false
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