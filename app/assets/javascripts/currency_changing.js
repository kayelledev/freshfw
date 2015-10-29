$(document).ready(function(){
  $('#selectNewCurrency').on('click', function(e){
    $("#changeCurrencyModal").modal('show');
  });  
  $('.change-currency-button').on('click', function(){
    $.ajax({
        url: "/change_user_country", 
        type: "POST",
        data: { currency: $(this).data("currency") }, 
        success: function(response) {
            console.log(response);
            location.reload(true);
        }
    });
  }); 

  $('#checkout-form').submit(function() { 
    var valuesToSubmit = $(this).serialize();
    var result = false;
    $.ajax({
        type: "POST",
        url: "/check_country", //sumbits it to the given url of the form
        data: valuesToSubmit,
        async: false,
        dataType: "JSON" // you want a difference between normal and ajax-calls, and json is standard
    }).success(function(is_equal){
        console.log("success", is_equal);
        result = is_equal;
        if (! is_equal) $("#changeCurrencyCheckoutModal").modal('show');
    });
    return result;
  });
});