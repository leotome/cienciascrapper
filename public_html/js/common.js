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