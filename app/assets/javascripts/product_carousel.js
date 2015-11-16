$(document).ready(function() {

  var productCarouselWidth = $('#ProductCarousel').width();

  resizeCarousel(productCarouselWidth);

  $( window ).resize(function() {
    var productCarouselWidth = $('#ProductCarousel').width();
    resizeCarousel (productCarouselWidth);
  });

  function resizeCarousel (productCarouselWidth) {

    $('#carousel-inner-product').height(function (index, height) {
      return ((productCarouselWidth * 2) / 3);
    });

    $('.carousel-item-product').height(function (index, height) {
      return ((productCarouselWidth * 2) / 3);
    });
  }
});
