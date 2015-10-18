$(document).ready(function() {
    // change  quantity
    $(document).on('change', '#quantity-select', function(e) {
        var orderId = $('.shopping-cart').data("order");
        var itemId = $(this).parent().parent().parent().data("item");
        var itemQuntity = $("#quantity-select option:selected").text();
        var url = $(e.target).parent().parent().data('refreshPath');

        $.post( url, {
            item_id: itemId,
            item_quantity: itemQuntity
        });
    });
});
