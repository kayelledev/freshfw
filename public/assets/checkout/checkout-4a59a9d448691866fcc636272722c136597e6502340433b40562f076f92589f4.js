$(document).ready(function() {
    var separateDeliveryAddress = $('#separate_delivery_address_checkbox');
    var shippingFields = $('#shipping_fields');
    var createAccountOrSignIn = $('#create_account_or_sign_in')

    // show delivery fields
    separateDeliveryAddress.change(function() {
        if($(this).is(":checked")) {
            shippingFields.css('display', 'block');
        } else {
            shippingFields.css('display', 'none');
        }
    });

    // create account or sing in
    createAccountOrSignIn.change(function() {
        if ($(this).is(":checked")) {
            console.log('rsfrs');
            $('#sign_up_email').attr('required', true);
            $('#sign_up_password').attr('required', true);
        } else {
            $('#sign_up_email').removeAttr('required');
            $('#sign_up_password').removeAttr('required');
        };
    });

    // items refresh
    $('input[name="order[delivery_service_id]"]').change(function(e){
        var url = $(e.target).parent().data('refreshPath');
        var value = $(e.target).val();

        $.post( url, { delivery_service_id: value});
      });
});
