var tedious = require('tedious');

exports.connect = () => {
    const config = {
        server : null,
        options : {},
        authentication : {
            type : 'default',
            options : {
                userName : '',
                password : ''
            }
        }
    }
    return new Promise((resolve, reject) => {
        let connection = new tedious.Connection(config);
        connection.on('connect', (error) => {
            if(error){
                reject({ connected : false, error : error });
            } else {
                resolve({ connected : true, error : undefined });
            }
        })
        connection.connect();
    });
}