$(document).ready(function() {
    function changeWidth() {
        var newCarouselWidth = $('#myCarousel').width() / 4;
        $('#myCarousel').css('height', newCarouselWidth);
        $('.item').css('height', newCarouselWidth);
    }

    changeWidth();

    $( window ).resize(function() {
        changeWidth();
    });
});

