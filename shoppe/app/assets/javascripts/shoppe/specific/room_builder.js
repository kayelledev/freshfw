$(document).ready(function() {

  $('.subtabs__one-tab').click(function(e) {
    e.preventDefault();
    var thisTab = this;

    if ( $('.active-tab').attr('id') === 'room-layout' ) {
      $( document ).ajaxComplete(function() {
        changeTab(thisTab);
      });
    } else if ( $('.active-tab').attr('id') === 'furniture-board' ) {
      $( document ).ajaxComplete(function() {
        changeTab(thisTab);
      });
    } else {
      changeTab(thisTab);
    }

    function changeTab(tab) {
      console.log('changeTab')
      $('.subtabs__one-tab').removeClass('subtabs__one-tab--active');
      $(tab).addClass('subtabs__one-tab--active');
      $('.submit-room-btn').css('display', 'none');
      $('.js-tabs-block').removeClass('active-tab');

      if ( $(tab).attr('id') === 'selected-furniture-tab' ) {
        $('.selected-furniture').addClass('active-tab');

      } else if ( $(tab).attr('id') === 'room-layout-tab' ) {
        $('.layout-submit-room').css('display', 'block');
        $('.room-layout').addClass('active-tab');

      } else if ( $(tab).attr('id') === 'furniture-board-tab' ) {
        $('.board-submit-room').css('display', 'block');
        $('.furniture-board').addClass('active-tab');
      }
    }
  });


  // var subtabs = document.querySelectorAll(".subtabs__one-tab");
  // var subtabBtns = document.querySelectorAll(".subtabs__btn");
  // var roomLayoutSubtabBtns = document.querySelectorAll(".room-layout-btn");
  // var furnitureBoardSubtabBtns = document.querySelectorAll(".furniture-board-btn");
  // var blocks = document.querySelectorAll(".js-tabs-block");

  // for (var i = 0, lim = subtabs.length; i < lim; i += 1) {
  //   subtabs[i].addEventListener("click", function(e) {
  //     e.preventDefault();

  //     for (var x = 0, max = blocks.length; x < max; x += 1) {
  //       blocks[x].classList.remove("active-tab");
  //     };

  //     for (var y = 0, max = subtabs.length; y < max; y += 1) {
  //       subtabs[y].classList.remove("subtabs__one-tab--active");
  //     };

  //     var dataText = this.dataset.appearer;
  //     var block = document.getElementById(dataText);
  //     block.classList.add("active-tab");
  //     this.classList.add("subtabs__one-tab--active");

  //     if (dataText === "selected-furniture") {
  //       for (var z = 0, len = subtabBtns.length; z < len; z += 1) {
  //         subtabBtns[z].style.display = 'none';
  //       };
  //     } else if (dataText === "room-layout") {
  //       for (var z = 0, len = furnitureBoardSubtabBtns.length; z < len; z += 1) {
  //         furnitureBoardSubtabBtns[z].style.display = 'none';
  //       };
  //       for (var z = 0, len = roomLayoutSubtabBtns.length; z < len; z += 1) {
  //         roomLayoutSubtabBtns[z].style.display = 'block';
  //       };
  //     } else if (dataText === "furniture-board") {
  //       for (var z = 0, len = roomLayoutSubtabBtns.length; z < len; z += 1) {
  //         roomLayoutSubtabBtns[z].style.display = 'none';
  //       };
  //       for (var z = 0, len = furnitureBoardSubtabBtns.length; z < len; z += 1) {
  //         furnitureBoardSubtabBtns[z].style.display = 'block';
  //       };

  //     };
  //   })
  // };
});

