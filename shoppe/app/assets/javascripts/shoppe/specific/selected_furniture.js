$(document).ready(function() {
  $('.product-remove').click(function() {
    var url = $(this).attr('data-url');
    var productId = $(this).attr('data-product-id');
    var designerProjectId = $('#selected-furniture').attr('data-project-id');

    $.ajax({
      url: url,
      type: 'DELETE',
      dataType: 'script',
      data: {
        product_id: productId,
        design_project_id: designerProjectId
      }
    });
  });
});

