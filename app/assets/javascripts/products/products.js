$(document).ready(function(){
  $('input[name=varsku]').on('change', function(e) {
    var product = $('#product_' + e.target.value);
    $('.variant').hide();
    $(product).show();
    $('#buy').attr('href', product.data('url'));
  });
});