$(document).ready(function() {
  var images = $('#ProductCarousel img.img-responsive');
  images.each(function() {
    if ( $(this).height() < $(this).parent().height() ) {
      $(this).css({
        'position': 'absolute',
        'bottom': '0'
      });
    }
  });

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
