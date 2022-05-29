const sql = require('./config_sql');

exports.cRud_usersByEmail = (param) => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" + 
        "                     ,[Username]" + 
        "                     ,[Email]" + 
        "                     ,[FirstName]" + 
        "                     ,[LastName]" + 
        "                     ,[Password]" + 
        "              FROM [User]" + 
        "              WHERE [Email]= '" + param + "'";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_usersByEmail(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_usersByEmail(), sql.connect', err);
            reject(err);
        })
    });
}

exports.Crud_registerUser = (param) => {
    return new Promise((resolve, reject) => {
        let SQLQuery = `INSERT INTO [User] ([Username], [Email], [FirstName], [LastName], [Password]) VALUES ('${param.Username}', '${param.Email}', '${param.FirstName}', '${param.LastName}', '${param.Password}')`
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on Crud_registerUser(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on Crud_registerUser(), sql.connect', err);
            reject(err);
        })
    });
}