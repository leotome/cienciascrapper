const sql = require('./config_sql');
const utils = require('../utils/utils');

exports.Crud_setRecord = (params) => {
    return new Promise((resolve, reject) => {
        sql.connect()
        .then(conn => {
            let TABLE_NAME = 'Curriculo_PercursoProfissional';
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
        "     ,[Curriculo_FK]" +
        "     ,[PeriodoInicio]" +
        "     ,[PeriodoFim]" +
        "     ,[Tipo]" +
        "     ,[CategoriaInstituicao]" +
        "     ,[Empregador]" +
        "     ,[Atual]" +
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

exports.cRud_getByCurriculoFK = (params) => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Id]" +
        "     ,[Curriculo_FK]" +
        "     ,[PeriodoInicio]" +
        "     ,[PeriodoFim]" +
        "     ,[Tipo]" +
        "     ,[CategoriaInstituicao]" +
        "     ,[Empregador]" +
        "     ,[Atual]" +
        "FROM [Curriculo_PercursoProfissional] " +
        "WHERE [Curriculo_FK] = '" + params.Id + "' " + 
        "ORDER BY [PeriodoInicio] DESC";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log('Error on cRud_getByCurriculoFK(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on cRud_getByCurriculoFK(), sql.connect', err);
            reject(err);
        })
    });
}