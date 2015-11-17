$(document).ready(function(){
    // change variant
    $('input[name=varsku]').on('change', function(e) {
        var product = $('#product_' + e.target.value);
        var descr_prod = $('#description_product_' + e.target.value);
        var product_items = $('#product_items_' + e.target.value);
        $('.variant').hide();
        $(product).show();
        $(descr_prod).show();;
        $(product_items).show();
        $('#buy').attr('href', product.data('url'));
    });

    // cut description text
    function resizeProductDescription() {
        $(".product-desc").each(function(){
            $(this).dotdotdot({
                after: "a.readmore",
                height: 120,
                callback: function( isTruncated, orgContent ) {
                    if (isTruncated) {
                        $(this).find('a.readmore').show();
                    } else {
                        $(this).find('a.readmore').hide();
                    }
                }
            });
        });
    }

    resizeProductDescription();

    $( window ).resize(function() {
        resizeProductDescription();
    });
});
