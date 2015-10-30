$(document).ready(function() {
    $(document).on('change', '#order_billing_country_id', function(e) {
        var country_name = $('#order_billing_country_id option:selected' ).text();
        $.post('/country_changing', {
            country_name: country_name
        });
    });
});
