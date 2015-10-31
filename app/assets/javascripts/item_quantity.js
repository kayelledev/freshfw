$(document).ready(function() {
    // change  quantity
    $(document).on('change', '.quantity-select', function(e) {
        var orderId = $('.shopping-cart').data("order");
        var itemId = $(this).parent().parent().data("item");
        var itemQuntity = $('select[data-itemId=' + itemId +'] option:selected').text();;
        var url = $(e.target).parent().data('refreshPath');

        $.post( url, {
            item_id: itemId,
            item_quantity: itemQuntity
        });
    });
});
