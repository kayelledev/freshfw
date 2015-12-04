$(document).ready(function() {
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();

  resizeCarousel(windowWidth, windowHeight);

  $( window ).resize(function() {
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    resizeCarousel (windowWidth, windowHeight);
  });

  function resizeCarousel(windowWidth, windowHeight) {
    var headerHeight = $('#header').height();
    var newHeight = windowHeight - +headerHeight;
    $('#myCarousel').css('height', '100%');
    $('#carousel-inner-main').css('height', '100%');
    $('.carousel-item').css('height', '100%');
    // 2.25 - images proportion (1800x800)
    if (windowWidth / newHeight >= 2.25) {
      $('#myCarousel').height(newHeight);
      $('#carousel-inner-main').height(newHeight);
      $('.carousel-item').height(newHeight);
    } else {
      var imageMaxHeight = $('.carousel-item').height();
      $('#myCarousel').height(imageMaxHeight);
      $('#carousel-inner-main').height(imageMaxHeight);
    }
  }
});
