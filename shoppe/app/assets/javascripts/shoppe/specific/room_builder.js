$(document).ready(function() {
  $('.subtabs__one-tab').click(function(e) {
    e.preventDefault();
    $('.subtabs__one-tab').removeClass('subtabs__one-tab--active');
    $(this).addClass('subtabs__one-tab--active');
    $('.submit-room-btn').css('display', 'none');
    $('.js-tabs-block').removeClass('active-tab');

    if ( $(this).attr('id') === 'selected-furniture-tab' ) {
      $('.selected-furniture').addClass('active-tab');

    } else if ( $(this).attr('id') === 'room-layout-tab' ) {
      $('.layout-submit-room').css('display', 'block');
      $('.room-layout').addClass('active-tab');

    } else if ( $(this).attr('id') === 'furniture-board-tab' ) {
      $('.board-submit-room').css('display', 'block');
      $('.furniture-board').addClass('active-tab');
    }
  });
});

