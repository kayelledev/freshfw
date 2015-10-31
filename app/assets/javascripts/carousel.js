$(document).ready(function() {
    var windowWidth = $(window).width();
    //resize carousel
    function resizeCarousel (windowWidth) {
        if (windowWidth > 1200) {
            var windowHeight = $(window).height();
            var headerHeight = $('#header').height();
            $('#myCarousel').css('height', '100%');
            $('#carousel-inner-main').css('height', '100%');
            $('.carousel-item').css('height', '100%');

            $('.carousel-item').height(function (index, height) {
                return (windowHeight - headerHeight);
            });

            $('#myCarousel').height(function (index, height) {
                return ($('.carousel-item').height());
            });

            $('#carousel-inner-main').height(function (index, height) {
                return ($('.carousel-item').height());
            });

        } else {
            $('#myCarousel').css('height', '');
            $('#carousel-inner-main').css('height', '');
            $('.carousel-item').css('height', '');
        }
    }

    resizeCarousel (windowWidth);

    $( window ).resize(function() {
        var windowWidth = $(window).width();
        resizeCarousel (windowWidth);
    });
});