const sql = require('./config_sql');
const utils = require('../utils/utils');

exports.Crud_setRecord = (params) => {
    return new Promise((resolve, reject) => {
        let expectedOrder = {
            Id : 0,
            NomeCompleto : 1,
            NomesCitacao : 2,
            Resumo : 3,
            CienciaId : 4,
            OrcidId : 5,
            GoogleScholarId : 6,
            ResearcherId : 7,
            ScopusAuthorId : 8,
            Moradas : 9,
            Emails : 10,
            DominiosAtuacao : 11,
            DataExtracao : 12
        }
        let payload = [];
        
        params.forEach((param) => {
            let localPayload = [];
            Object.keys(expectedOrder).forEach(key => {
                let value = expectedOrder[key];
                let data = (param[key] != undefined) ? param[key] : null;
                localPayload = utils.arrayInsertAt(localPayload, value, data);
            })
            payload.push(localPayload);
        })

        let statement = "INSERT INTO [Curriculo] ([Id],[NomeCompleto],[NomesCitacao],[Resumo],[CienciaId],[OrcidId],[GoogleScholarId],[ResearcherId],[ScopusAuthorId],[Moradas],[Emails],[DominiosAtuacao],[DataExtracao]) VALUES ?";
        sql.connect()
        .then(conn => {
            conn.pool.query(statement, payload)
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