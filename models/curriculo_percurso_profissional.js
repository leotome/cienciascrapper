const sql = require('./config_sql');
const utils = require('../utils/utils');

exports.Crud_setRecord = (params) => {
    return new Promise((resolve, reject) => {
        let expectedOrder = {
            Curriculo_FK : 0,
            PeriodoInicio : 1,
            PeriodoFim : 2,
            Tipo : 3,
            CategoriaInstituicao : 4,
            Empregador : 5
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
        
        let statement = "INSERT INTO [Curriculo_PercursoProfissional] ([Curriculo_FK],[PeriodoInicio],[PeriodoFim],[Tipo],[CategoriaInstituicao],[Empregador]) VALUES ?";
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
        "     ,[PeriodoInicio]" +
        "     ,[PeriodoFim]" +
        "     ,[Tipo]" +
        "     ,[CategoriaInstituicao]" +
        "     ,[Empregador]" +
        "FROM [Curriculo_PercursoProfissional]";
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