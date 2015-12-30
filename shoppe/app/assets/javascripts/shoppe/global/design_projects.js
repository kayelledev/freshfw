$(document).ready(function() {

  $('.save-project-info-tab').click(function(e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);

    $('.images-upload').each(function() {
      formData.append($(this).attr('id'), $(this)[0].files[0]);
    });
    formData.append("redirect_to_link", this.href);
    
    $.ajax({
        url: '/shoppe/designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    });
  });
  $('.one-filter-category__label > input[type=checkbox]').on('change', function () {
    var categoriesArray = $('input[name="category_ids[]"]:checked').serializeArray();
    var categoriesIdsArray = jQuery.map(categoriesArray, function(item){
      return item["value"];
    });
    var colorsArray = $('input[name="color_ids[]"]:checked').serializeArray();
    var colorsIdsArray = jQuery.map(colorsArray, function(item){
      return item["value"];
    });
    var materialsArray = $('input[name="material_ids[]"]:checked').serializeArray();
    var materialsIdsArray = jQuery.map(materialsArray, function(item){
      return item["value"];
    });
    $.post('/shoppe/designer-portal/items_filtering', {
        categories: categoriesIdsArray,
        colors: colorsIdsArray,
        materials: materialsIdsArray
    });
  });
  $('.products-grid__btn-cont a').on('click', function () {
    $.post('/shoppe/designer-portal/items_filtering', {show_all: true});
  });
  $("#role_permission_ids").multiselect();  
  $("#product_category_ids").multiselect();  
});