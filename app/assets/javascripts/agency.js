/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// Closes the Responsive Menu on Click outside Menu
$('body > *').not('nav').click(function() {
    if(!$('button.navbar-toggle').hasClass('collapsed')) {
        $('.navbar-toggle:visible').click();
    }
});
// todo maybe it will be better transfer this code to another place
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