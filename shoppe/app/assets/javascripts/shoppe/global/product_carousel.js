$(document).ready(function() {
  var productCarouselWidth = $('#ProductCarousel').width();

  resizeCarousel(productCarouselWidth);
  fitImages();

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

  function fitImages() {
    var images = $('#ProductCarousel .carousel-inner .carousel-item-product img');
    $(images).each(function() {
      $(this).load(function() {
        if ( $(this)[0].naturalHeight >= $(this)[0].naturalWidth ) {
          $(this).css({
            'height': '100%',
            'width': 'auto'
          });
        } else {
          $(this).css({
            'position': 'absolute',
            'bottom': '0',
            'max-height': $('#ProductCarousel .carousel-inner')
          });
        }
      }).each(function() {
        if(this.complete) $(this).load();
      });
    });
  }
});
