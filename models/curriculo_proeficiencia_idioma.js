const sql = require('./config_sql');
const utils = require('../utils/utils');

exports.Crud_setRecord = (params) => {
    return new Promise((resolve, reject) => {
        let expectedOrder = {
            Curriculo_FK : 0,
            Idioma : 1,
            Conversacao : 2,
            Leitura : 3,
            Escrita : 4,
            Compreensao : 5,
            PeerReview : 6
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
        
        let statement = "INSERT INTO [Curriculo_ProeficienciaIdioma] ([Curriculo_FK],[Idioma],[Conversacao],[Leitura],[Escrita],[Compreensao],[PeerReview]) VALUES ?";
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
        "     ,[Curriculo_FK]" +
        "     ,[Idioma]" +
        "     ,[Conversacao]" +
        "     ,[Leitura]" +
        "     ,[Escrita]" +
        "     ,[Compreensao]" +
        "     ,[PeerReview]" +
        "FROM [Curriculo_ProeficienciaIdioma]";
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