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
 })