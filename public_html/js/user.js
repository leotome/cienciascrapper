'use strict';

(function ($) {

    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        this.doRequestPersonalInformation();
    });    

    $("#info_changepw").on("click", function() {
        let TogglePw = $(this).is(':checked');
        let PwContent = '<p>Palavra-passe<span>*</span></p><input type="password" id="info_password">';
        let PwConfirmContent = '<p>Confirme a palavra-passe<span>*</span></p><input type="password" id="info_password_confirm">';
        let FullContainer = PwContent + PwConfirmContent;
        let PwPanel = $("#container_info_password");
        PwPanel.empty();
        if(TogglePw == true){
            PwPanel.append(FullContainer);
        } else {

        }
    });

})(jQuery);

function doRequestPersonalInformation(){
    let request_url = getAPIURI() + '/users/info';
    fetch(request_url)
    .then(async (response) => {
        var result = await response.json();
        var success = response.ok;
        if(result.message && success == false){
            alert(result.message);
            return;
        } else if(success == false){
            alert('Um erro ocorreu. Por favor contacte o suporte.');
            return;
        }
        let info_fname = document.getElementById("info_fname");
        let info_lname = document.getElementById("info_lname");
        let info_email = document.getElementById("info_email");
        info_fname.value = result.FirstName;
        info_lname.value = result.LastName;
        info_email.value = result.Email;
    })
    .catch(async (error) => {
        alert('Um erro ocorreu. Por favor contacte o suporte.');
        console.log(JSON.stringify(error));
    })
}

function doUpdatePersonalInformation(){
    let info_fname    = document.getElementById("info_fname").value;
    let info_lname    = document.getElementById("info_lname").value;
    let info_email    = document.getElementById("info_email").value;
    let info_password = document.getElementById("info_password");
    let info_password_confirm = document.getElementById("info_password_confirm");
    if(info_fname == ''){
        alert('É obrigatório fornecer um nome.');
        return;
    }    
    if(info_lname == ''){
        alert('É obrigatório fornecer um apelido.');
        return;
    }
    if(info_password){
        if(info_password.value == ''){
            alert('É obrigatório fornecer uma palavra-passe.');
            return;
        }
        if(info_password_confirm.value == ''){
            alert('É obrigatório confirmar a palavra-passe.');
            return;
        }
        if(info_password.value != info_password_confirm.value){
            alert('A palavra-passe e confirmação devem ser iguais. Por favor revise, e tente novamente.');
            return;
        }

    }

    let User = {
        FirstName : info_fname,
        LastName : info_lname,
        Email : info_email,
        Password : (info_password) ? info_password.value : undefined
    }
    let request_url = getAPIURI() + '/users/update';
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
            alert('Um erro ocorreu. Por favor contacte o suporte.');
            return;
        }
        alert('Os dados foram atualizados com sucesso!');
    })
    .catch(async (error) => {
        alert('Um erro ocorreu. Por favor contacte o suporte.');
        console.log(JSON.stringify(error));
    })


}