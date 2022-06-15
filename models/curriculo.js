const sql = require('./config_sql');

exports.Crud_setLatest = (params) => {
    return new Promise((resolve, reject) => {
        sql.connect()
        .then(conn => {
            let CienciaId = params.CienciaId;
            let LatestPK = params.Id;
            
            const statement = `UPDATE [Curriculo] SET [UltimaExtracao] = 0 WHERE [CienciaId] = '${CienciaId}' AND [Id] != '${LatestPK}'`;

            conn.pool.query(statement)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on Crud_setLatest(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on Crud_setLatest(), sql.connect', err);
            reject(err);
        })
    });
}

exports.Crud_setRecord = (params) => {
    return new Promise((resolve, reject) => {
        sql.connect()
        .then(conn => {
            let TABLE_NAME = 'Curriculo';
            let COLUMNS = [];
            let VALUES = [];
            
            const request = conn.pool.request();

            Object.keys(params).forEach((key, index) => {
                let value = params[key];
                if(value != undefined){
                    COLUMNS.push(key);
                    VALUES.push(value);
                    
                }
            })

            VALUES.forEach((val, index) => {
                request.input(`param_${index}`, val);
            })
            
            const statement = `INSERT INTO ${TABLE_NAME}(${COLUMNS}) VALUES (${VALUES.map((_,i) => '@param_' + i)})`;

            request.query(statement)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on Crud_setRecord(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on Crud_setRecord(), sql.connect', err);
            reject(err);
        })
    });
}

exports.cRud_getAll = () => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" + 
        "      ,[NomeCompleto]" + 
        "      ,[NomesCitacao]" + 
        "      ,[Resumo]" + 
        "      ,[CienciaId]" + 
        "      ,[OrcidId]" + 
        "      ,[GoogleScholarId]" + 
        "      ,[ResearcherId]" + 
        "      ,[ScopusAuthorId]" + 
        "      ,[Moradas]" + 
        "      ,[Emails]" + 
        "      ,[DominiosAtuacao]" + 
        "      ,[DataExtracao]" + 
        "FROM [Curriculo]";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getAll(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getAll(), sql.connect', err);
            reject(err);
        })
    });
}