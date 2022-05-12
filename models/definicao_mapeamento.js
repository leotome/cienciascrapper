const sql = require('./config_sql');

exports.cRud_getFullMapeamento = () => {
    return new Promise((resolve, reject) => {
        let SQLQuery = "SELECT [Map_Cabecalho].[Id] AS 'Map_Cabecalho_Id'" +
        "      ,[Map_Cabecalho].[NomeTabela]        AS 'Map_Cabecalho_NomeTabela'" +
        "      ,[Tipo].[Nome]                       AS 'Map_Cabecalho_Tipo'" +
        "      ,[Map_Cabecalho].[XPath]             AS 'Map_Cabecalho_XPath'" +
        "      ,[Map_Linha].[Id]                    AS 'Map_Linha_Id'" +
        "      ,[Map_Linha].[NomeCampo]             AS 'Map_Linha_NomeCampo'" +
        "      ,[Map_Linha].[TipoDado]              AS 'Map_Linha_TipoDado'" +
        "      ,[Map_Linha].[XPath_Pesquisa]        AS 'Map_Linha_XPath_Pesquisa'" +
        "      ,[Map_Linha].[ElementoEsperado]      AS 'Map_Linha_ElementoEsperado'" +
        "      ,[Map_Linha].[IndiceEsperado]        AS 'Map_Linha_IndiceEsperado'" +
        "      ,[Map_Linha].[Boolean_PalavrasChave]        AS 'Map_Linha_Boolean_PalavrasChave'" +
        "  FROM [dbo].[Definicao_Mapeamento] [Map_Cabecalho]" +
        "  INNER JOIN [Definicao_Mapeamento_Tipo] [Tipo] ON [Tipo].[Id] = [Map_Cabecalho].[TipoDefinicao_FK]" +
        "  LEFT OUTER JOIN [Definicao_Mapeamento_Linha] [Map_Linha] ON [Map_Cabecalho].[Id] = [Map_Linha].[Definicao_FK]" +
        "  WHERE [Map_Cabecalho].[IsActive] = 1" + 
        "  ORDER BY [Map_Cabecalho].[Ordem] ASC, [Map_Linha].[Ordem] ASC";
        sql.connect()
        .then(conn => {
            conn.pool.query(SQLQuery)
            .then(response => {
                let properResponse = new Map();
                response.recordset.forEach(record => {
                    if(properResponse.has(record.Map_Cabecalho_Id) == false){
                        var line = {
                            Id : record.Map_Linha_Id,
                            NomeCampo : record.Map_Linha_NomeCampo,
                            TipoDado : record.Map_Linha_TipoDado,
                            XPath_Pesquisa : record.Map_Linha_XPath_Pesquisa,
                            ElementoEsperado : record.Map_Linha_ElementoEsperado,
                            IndiceEsperado : record.Map_Linha_IndiceEsperado,
                        }
                        var header = {
                            Id : record.Map_Cabecalho_Id,
                            NomeTabela : record.Map_Cabecalho_NomeTabela,
                            Tipo : record.Map_Cabecalho_Tipo,
                            XPath : record.Map_Cabecalho_XPath,
                            Linhas : [line]
                        }
                        properResponse.set(record.Map_Cabecalho_Id, header);
                    } else {
                        var line = {
                            Id : record.Map_Linha_Id,
                            NomeCampo : record.Map_Linha_NomeCampo,
                            TipoDado : record.Map_Linha_TipoDado,
                            XPath_Pesquisa : record.Map_Linha_XPath_Pesquisa,
                            ElementoEsperado : record.Map_Linha_ElementoEsperado,
                            IndiceEsperado : record.Map_Linha_IndiceEsperado,
                            Boolean_PalavrasChave : record.Map_Linha_Boolean_PalavrasChave
                        }

                        var header = properResponse.get(record.Map_Cabecalho_Id);
                        header.Linhas.push(line);
                    }
                })                
                resolve(Array.from(properResponse.values()));
            })
            .catch(error => {
                console.log('Error on getFullMapeamento(), conn.pool.query', error);
                reject(error);
            });
        })
        .catch(err => {
            console.log('Error on getFullMapeamento(), sql.connect', err);
            reject(err);
        })
    });
}