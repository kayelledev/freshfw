$(document).ready(function() {
    var changeForm = $('#change-form');
    var changeFormText = $('#change-form p');
    var columnTitle = $('.sign-in-or-register .title .form-title p')
    var signInForm = $('.sign-in-or-register .sign-in-or-register-forms .sign-in');
    var createAccountForm = $('.sign-in-or-register .sign-in-or-register-forms .create-account');
    $('body').on('click', changeForm, function(e){
        e.preventDefault();
        if (signInForm.css('display') == 'block' && createAccountForm.css('display') == 'none') {
            signInForm.fadeOut(400, function(){
                createAccountForm.show();
                columnTitle.html('CREATE ACCOUNT');
            });
            changeFormText.html('SIGN IN');
        } else if (signInForm.css('display') == 'none' && createAccountForm.css('display') == 'block') {
            createAccountForm.fadeOut(400, function(){
                signInForm.show();
                columnTitle.html('SIGN IN');
            });
            changeFormText.html('CREATE ACCOUNT');
        }
    });
});