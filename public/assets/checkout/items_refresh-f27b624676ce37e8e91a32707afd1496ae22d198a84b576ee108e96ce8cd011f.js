$(document).ready(function() {
  $('input[name="order[delivery_service_id]"]').change(function(e){
    var url = $(e.target).parent().data('refreshPath');
    var value = $(e.target).val();

    $.post( url, { delivery_service_id: value});
  });
});
