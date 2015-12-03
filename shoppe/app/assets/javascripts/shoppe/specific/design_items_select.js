$(document).ready(function(){
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

  $(".one-products-category__anch").on('click', function () {
    var checkbox = $(this).parent().find('.one-products-category__label > input');
    if (checkbox[0].checked) {
      checkbox.prop('checked', false);
      checkbox[0].parentElement.previousElementSibling.classList.toggle("chosen");
    } else {
      checkbox.prop('checked', true);
      checkbox[0].parentElement.previousElementSibling.classList.add("chosen");
    }
  });
 })