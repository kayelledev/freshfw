$(document).ready(function(){
  $('.select-new-currency').click(function(e){
    $("#changeCurrencyModal").modal('show');
  });  
  $('.change-currency-button').on('click', function(){
    $.ajax({
        url: "/change_user_country", 
        type: "POST",
        data: { currency: $(this).data("currency") }, 
        success: function(response) {
            location.reload(true);
        }
    });
  }); 

  $('#checkout-form').submit(function() { 
    var country_id = $('#order_billing_country_id').val();
    var result = false;
    $.ajax({
        type: "POST",
        url: "/check_country", 
        data: {country_id: country_id},
        async: false,
    }).success(function(is_equal){
        result = is_equal;
        if (! is_equal) $("#changeCurrencyCheckoutModal").modal('show');
    });
    return result;
  });
});