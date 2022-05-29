'use strict';

(function ($) {

    $(window).on('load', function () {
        let token = this.getIsAuthenticated();
        this.doRequestPersonalInformation();
    });    
    /*
    $("#info_changepw").on("click", function() {
        let TogglePw = $(this).is(':checked');
        let PwContent = '<p>Password<span>*</span></p><input type="text" id="info_password">';
        let PwPanel = $("#container_info_password");
        PwPanel.empty();
        if(TogglePw == true){
            PwPanel.append(PwContent);
        } else {

        }
    });
    */
})(jQuery);

function doRequestPersonalInformation(){
    let request_url = this.getAPIURI() + 'users/information';
    fetch(request_url)
    .then(async (response) => {
        var result = await response.json();
        var success = response.ok;
        if(result.message && success == false){
            alert(result.message);
            return;
        } else if(success == false){
            alert('An unknown error occurred. Please contact support, or try again later.');
            return;
        }
        let info_fname = document.getElementById("info_fname");
        let info_lname = document.getElementById("info_lname");
        let info_phone = document.getElementById("info_phone");
        let info_email = document.getElementById("info_email");
        info_fname.value = result[0].FirstName;
        info_lname.value = result[0].LastName;
        info_phone.value = result[0].Phone;
        info_email.value = result[0].Email;
    })
    .catch(async (error) => {
        alert('An unknown error occurred. Please contact support, or try again later.');
        console.log(JSON.stringify(error));
    })
}

function doUpdatePersonalInformation(){
    let info_fname = document.getElementById("info_fname").value;
    let info_lname = document.getElementById("info_lname").value;
    let info_phone = document.getElementById("info_phone").value;
    let info_email = document.getElementById("info_email").value;
    if(info_fname == ''){
        alert('Please provide an First Name.');
        return;
    }    
    if(info_lname == ''){
        alert('Please provide Last Name.');
        return;
    }    
    if(info_phone == ''){
        alert('Please provide a phone.');
        return;
    }

    let User = {
        FirstName : info_fname,
        LastName : info_lname,
        Phone : info_phone,
        Email : info_email
    }
    let request_url = getAPIURI() + 'users/update';
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
            alert('An unknown error occurred. Please contact support, or try again later.');
            return;
        }
        alert('The information was updated successfully!')
    })
    .catch(async (error) => {
        alert('An unknown error occurred. Please contact support, or try again later.');
        console.log(JSON.stringify(error));
    })


}