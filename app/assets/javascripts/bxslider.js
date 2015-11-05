$(document).ready(function(){
  $('#room-slider').bxSlider({
    slideWidth: 200,
    minSlides: 7,
    maxSlides: 8,
    slideMargin: 10
  });

  $('#room-slider .slide').click(function(){
    $('#room-slider .slide').removeClass('active-slider');
    $(this).addClass('active-slider');
    var previewImage = $(this).find('img').clone();
    $('#room-preview').html(previewImage);
  });

});

