$(document).ready(function() {
    // change  quantity
    $(document).on('change', '.quantity-select', function(e) {
        var orderId = $('.shopping-cart').data("order");
        var itemId = $(this).parents().eq(2).data("item");
        var itemQuntity = $('select[data-itemId=' + itemId +'] option:selected').text();;
        var url = $(e.target).parents().eq(1).data('refreshPath');
        $.post( url, {
            item_id: itemId,
            item_quantity: itemQuntity
        });
    });
});
