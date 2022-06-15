const sql = require('./config_sql');

exports.cRud_getData = (SQLQuery) => {
    return new Promise((resolve, reject) => {
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getData(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getData(), sql.connect', err);
            reject(err);
        })
    });
}