const sql = require('./config_sql');

exports.cRud_getURLs = () => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" + 
        "                     ,[URL]" + 
        "                     ,[IsActive]" + 
        "                     ,[CreatedDate]" + 
        "FROM [Definicao_PaginaURL]" + 
        "ORDER BY [IsActive] DESC";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getURLs(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getURLs(), sql.connect', err);
            reject(err);
        })
    });
}