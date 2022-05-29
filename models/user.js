const sql = require('./config_sql');

exports.cRud_usersByUsername = (param) => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" + 
        "                     ,[Username]" + 
        "                     ,[Email]" + 
        "                     ,[FirstName]" + 
        "                     ,[LastName]" + 
        "                     ,[Password]" + 
        "                     ,[Type_FK]" + 
        "                     ,[IsActive]" + 
        "              FROM [User]" + 
        "              WHERE [Username]= '" + param + "'";
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
        let SQLQuery = `INSERT INTO [User] ([Username], [FirstName], [LastName], [Password], [Type_FK]) VALUES ('${param.Username}', '${param.FirstName}', '${param.LastName}', '${param.Password}', 1)`
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