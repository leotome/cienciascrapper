'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        let cienciavitae_app = localStorage.getItem('cienciavitae_app');
        let cienciavitae_user = localStorage.getItem('cienciavitae_user');
        if(cienciavitae_app){
            let logged = `<li><a href="./user.html" style="color: blue;">${cienciavitae_user}</a></li><li><a href="#" style="color: blue;" onclick="doLogout()">Logout</a></li>`;
            doGetMenus()
            .then(fullMenus => {
                let allMenuHTML = '';
                fullMenus.forEach(menu => {
                    let menuHTML = `<li><a href="${menu.PathURL}">${menu.Label}</a></li>`;
                    allMenuHTML += menuHTML;
                })
                $("#cienciascrapper_menu").append(allMenuHTML);
            })
            .catch(error => {
                console.log('doGetMenus.error()', error);
            })
            $("#cienciascrapper_usermenu").empty().append(logged);
            
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*--------------------------
        Select
    ----------------------------*/
    $("select").niceSelect();

    /*------------------
		Single Product
	--------------------*/
    $('.product__details__pic__slider img').on('click', function () {

        var imgurl = $(this).data('imgbigurl');
        var bigImg = $('.product__details__pic__item--large').attr('src');
        if (imgurl != bigImg) {
            $('.product__details__pic__item--large').attr({
                src: imgurl
            });
        }
    });

})(jQuery);


async function doGetMenus(){
    let request_url = getAPIURI() + '/config/menus';
    let response = await fetch(request_url);
    let success = response.ok;
    if(success){
        let data = await response.json();
        return data;
    } else {
        localStorage.removeItem("cienciavitae_app");
        localStorage.removeItem("cienciavitae_user");
        localStorage.removeItem("cienciavitae_type");
    }
    return [];
}