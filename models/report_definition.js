const sql = require('./config_sql');

exports.cRud_getDefinitions = () => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" +
                       "      ,[Name]" +
                       "      ,[IsActive]" +
                       "      ,[SQLStatement]" +
                       "      ,[CreatedDate]" +
                       "FROM [Report_Definition]" +
                       "WHERE [IsActive] = 1" +
                       "ORDER BY [Name] ASC";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getDefinitions(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getDefinitions(), sql.connect', err);
            reject(err);
        })
    });
}