$(document).ready(function() {
    function changeWidth() {
        var imageWidth = $('.content-page-image').width() / 4;
        $('.content-page-image').css('height', imageWidth);
    }

    changeWidth();

    $( window ).resize(function() {
        changeWidth();
    });
});

