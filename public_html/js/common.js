function getBaseURI(){
    var currentPort = (window.location.port == '' || window.location.port == 0) ? '' : ':' + window.location.port;
    var currentProtocol = window.location.protocol;
    var currentHost = window.location.hostname;
    var URI = currentProtocol + '//' + currentHost + currentPort;
    return URI;
}

function getAPIURI(){
    var URI = this.getBaseURI() + '/api';
    return URI;
}

function getIsAuthenticated(){
    let token = localStorage.getItem('cienciavitae_app');
    if(!token){
        window.open(this.getBaseURI(), "_self");
    }
    return token;
}

function getURLParameter(key){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has(key)){
        return urlParams.get(key);
    }
    return null;
}

function getHTMLEscapedDatetime(date){
    var todayDate = new Date();
    if(date != undefined){
        todayDate = date;
    }
    var todayDate_Day = todayDate.getDate();
    var todayDate_Month = todayDate.getMonth() + 1;
    var todayDate_Year = todayDate.getFullYear();
    var todayDate_Hours = todayDate.getHours();
    var todayDate_Minutes = todayDate.getMinutes();
    var todayDate_Seconds = todayDate.getSeconds();
    var fullStringDate = `${todayDate_Year}-${todayDate_Month}-${todayDate_Day} ${todayDate_Hours}:${todayDate_Minutes}:${todayDate_Seconds}`;
    return fullStringDate;
}

function getFilenameEscapedDatetime(date){
    var todayDate = new Date();
    if(date != undefined){
        todayDate = date;
    }
    var todayDate_Day = todayDate.getDate();
    var todayDate_Month = todayDate.getMonth() + 1;
    var todayDate_Year = todayDate.getFullYear();
    var todayDate_Hours = todayDate.getHours();
    var todayDate_Minutes = todayDate.getMinutes();
    var todayDate_Seconds = todayDate.getSeconds();
    var fullStringDate = `${todayDate_Year}-${todayDate_Month}-${todayDate_Day}_${todayDate_Hours}-${todayDate_Minutes}-${todayDate_Seconds}`;
    return fullStringDate;
}