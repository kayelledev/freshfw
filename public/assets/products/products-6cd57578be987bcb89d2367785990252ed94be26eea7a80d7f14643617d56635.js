$(document).ready(function(){
  $('input[name=varsku]').on('change', function(e) {
    var product = $('#product_' + e.target.value);
    var descr_prod = $('#description_product_' + e.target.value);
    $('.variant').hide();
    $(product).show();
    $(descr_prod).show();
    $('#buy').attr('href', product.data('url'));
  });
});
