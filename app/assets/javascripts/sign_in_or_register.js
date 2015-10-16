$(document).ready(function() {
    var changeForm = $('.forms-links #change-form');
    var changeFormText = $('.forms-links #change-form p');
    var columnTitle = $('.sign-in-or-register .title .form-title p')
    var signInForm = $('.sign-in-or-register .sign-in-or-register-forms .sign-in');
    var createAccountForm = $('.sign-in-or-register .sign-in-or-register-forms .create-account');
    changeForm.on('click', function(e){
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