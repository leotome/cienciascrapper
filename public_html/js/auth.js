function doLogin(){
    let username = document.getElementById("login_username").value;
    let password = document.getElementById("login_password").value;
    if(username == ''){
        alert('É obrigatório indicar o utilizador. Por favor, tente novamente.');
        return;
    }
    if(password == ''){
        alert('É obrigatório indicar a palavra-passe. Por favor, tente novamente.');
        return;
    }
    let User = {
        Username : username,
        Password : password
    }
    let request_url = this.getAPIURI() + '/users/login';
    let request_params = {
        headers: {
            "Content-Type": "application/json",
        },
        method : "POST",
        body : JSON.stringify(User)
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        var success = response.ok;
        if(result.message && success == false){
            alert(result.message);
            return;
        } else if(success == false){
            alert('Ocorreu um erro. Por favor contacte o suporte, ou tente novamente mais tarde.');
            return;
        }
        console.log('doLogin().result', result);
        localStorage.setItem("cienciavitae_app", result.accessToken);
        localStorage.setItem("cienciavitae_user", result.data.FullName);
        localStorage.setItem("cienciavitae_type", result.data.Type);
        let my_page = this.getBaseURI() + '/find.html';
        window.open(my_page, "_self");
        /*
        if(result.Type_FK == 0){
            let my_page = this.getBaseURI() + '/find.html';
            window.open(my_page, "_self");
        } else {
            let my_page = this.getBaseURI() + 'my.html';
            window.open(my_page, "_self");
        }
        */
    })
    .catch(async (error) => {
        alert('doLogin().error = ' + JSON.stringify(error));
    })
}

function doRegister(){
    let fname = document.getElementById("register_fname").value;
    let lname = document.getElementById("register_lname").value;
    let username = document.getElementById("register_username").value;
    /*
    let email = document.getElementById("register_email").value;
    */
    let password = document.getElementById("register_password").value;
    if(fname == ''){
        alert('Por favor indique um nome.');
        return;
    }    
    if(lname == ''){
        alert('Por favor indique um apelido.');
        return;
    }    
    if(username == ''){
        alert('Por favor indique um utilizador.');
        return;
    }
    /*
    if(email == ''){
        alert('Please provide an e-mail.');
        return;
    }
    */
    if(password == ''){
        alert('Por favor indique uma palavra-passe.');
        return;
    }
    let User = {
        FirstName : fname,
        LastName : lname,
        Username : username,
        Email : null,
        Password : password
    }
    let request_url = this.getAPIURI() + '/users/register';
    let request_params = {
        headers: {
            "Content-Type": "application/json",
        },
        method : "POST",
        body : JSON.stringify(User)
    }
    fetch(request_url, request_params)
    .then(async (response) => {
        var result = await response.json();
        if(result.message){
            alert(result.message);
        }
        console.log('doRegister().result', result);
    })
    .catch(async (error) => {
        alert('doRegister().error = ' + JSON.stringify(error));
    }) 
}

function doLogout(){
    let request_url = this.getAPIURI() + '/users/logout';
    fetch(request_url)
    .then(async (response) => {
        localStorage.removeItem("cienciavitae_app");
        localStorage.removeItem("cienciavitae_user");
        localStorage.removeItem("cienciavitae_type");
        let home = this.getBaseURI();
        window.open(home, "_self");
    })
    .catch(async (error) => {
        alert('doLogout().error = ' + JSON.stringify(error));
    })
}