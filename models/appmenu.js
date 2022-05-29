const sql = require('./config_sql');

exports.cRud_getMenusForUser = (param) => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Menu].[Id]" + 
        "                     ,[Menu].[PathURL]" + 
        "                     ,[Menu].[Label]" + 
        "               FROM [AppMenu] [Menu]" + 
        "               INNER JOIN [AppMenu_AllowedType] [PermMenu] ON [Menu].[Id] = [PermMenu].[AppMenu_FK]" + 
        "               WHERE [Menu].[IsActive] = 1 AND [PermMenu].[Type_FK] IN (SELECT [Type_FK] FROM [User] WHERE [Username] = '" + param + "')" + 
        "               ORDER BY [Menu].[SortOrder] ASC";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getMenusForUser(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getMenusForUser(), sql.connect', err);
            reject(err);
        })
    });
}