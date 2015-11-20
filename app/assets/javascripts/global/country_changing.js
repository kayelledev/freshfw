$(document).ready(function() {
    $(document).on('change', '#order_billing_country_id', function(e) {
        var country_name = $('#order_billing_country_id option:selected' ).text();
        var country_id = $(this).val();
        var different_address = $('#separate_delivery_address_checkbox').is(':checked');
        $.post('/country_changing', {
            country_name: country_name,
            country_type: "billing"
        });
        if (! different_address) {
          $.post('/check_country', {
            country_id: country_id
          }).success(function(is_equal){
          if (! is_equal) $("#changeCurrencyCheckoutModal").modal('show');
          });
        }
    });

    $(document).on('change', '#order_delivery_country_id', function(e) {
        var country_name = $('#order_delivery_country_id option:selected' ).text();
        var country_id = $(this).val();
        $.post('/country_changing', {
            country_name: country_name,
            country_type: "delivery",
        });
        var different_address = $('#separate_delivery_address_checkbox').val();
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
