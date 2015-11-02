$(document).ready(function() {
    $(document).on('change', '#order_billing_country_id', function(e) {
        var country_name = $('#order_billing_country_id option:selected' ).text();
        var country_id = $(this).val();
        $.post('/country_changing', {
            country_name: country_name
        });
        $.post('/check_country', {
            country_id: country_id
        }).success(function(is_equal){
        if (! is_equal) $("#changeCurrencyCheckoutModal").modal('show');
      });
    });

    
    $('.change-currency-checkout-button').on('click', function(){
    $.post('/change_currency_checkout', {
          currency: $(this).data("currency") 
      });
    }); 
});
