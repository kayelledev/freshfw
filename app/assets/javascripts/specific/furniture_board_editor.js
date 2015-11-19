(function($) {

  function Controller() {
    this.$holder = $('.furniture-board-editor');
    this.$initialElenemts = 'draggable';
    this.$currentElement = null;
    this.getPositionOfElement = function(elem) {
      var matrix = $(elem).css("-webkit-transform") ||
        $(elem).css("-moz-transform")    ||
        $(elem).css("-ms-transform")     ||
        $(elem).css("-o-transform")      ||
        $(elem).css("transform");

      var values = matrix.split('(')[1].split(')')[0].split(',');
      var a = values[0];
      var b = values[1];
      var degree = Math.round(Math.atan2(b, a) * (180/Math.PI));
      var left = values[4];
      var top = values[5];

      return { top: top, left: left, degree: degree };
    }
    this.checkInsidePoligon = function(point, vs) {
      // ray-casting algorithm based on
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      var x = point[0], y = point[1];
      var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
      return inside;
    };
  }

  Controller.prototype.initElements = function(elementsClass) {
    var controller = this;
    // set container width

    resizeArea();

    $(window).resize(function(){
      resizeArea();
    });

    function resizeArea() {
      var documentWidth = $(window).width();
      $('.furniture-board-editor').width(documentWidth * 0.6);
      $('.furniture-board-dragg').width(documentWidth * 0.6);
      var furnitureBoardEditorHeight = ( +$('.furniture-board-editor').width() * 3 ) / 5;
      $('.furniture-board-editor').height(furnitureBoardEditorHeight);

      $('.' + elementsClass).each(function() {
        $(this).children('img').load(function() {
          var oldWidth = $(this).width();
          var oldHeight = $(this).height();
          var newWidth = +$('.furniture-board-editor').width() / 4;
          console.log(oldWidth);
          console.log(newWidth);
          c = oldWidth / newWidth;
          $(this).width( oldWidth / c );
          $(this).height( (oldHeight / c) );
          $(this).parent().width( oldWidth / c );
          $(this).parent().height( (oldHeight / c) );
        }).each(function() {
          if(this.complete) $(this).load();
        });
      });
    }

    interact('.' + elementsClass)
      .draggable({
          // enable inertial throwing
          inertia: false,
          // keep the element within the area of it's parent
          restrict: {
              restriction: '.furniture-board-dragg',
              endOnly: true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },

          // call this function on every dragmove event
          onmove: function(event) {

            // controller.restrictAreaHoles(event.target);

            var target = event.target.parentNode,
            // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
                r = (parseFloat(event.target.getAttribute('data-rotation')) || 0),
                $positionPanelX = $('.position-x'),
                $positionPanelY = $('.position-y');

            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px) rotate(' + r + 'deg)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            target.setAttribute('data-rotation', r);

            event.target.setAttribute('data-x', x);
            event.target.setAttribute('data-y', y);
            event.target.setAttribute('data-rotation', r);

            //$('.rotation-arrow').hide();

          },
          // call this function on every dragend event
          onend: function (event) {
            controller.setCollisions(event.target);
            // controller.restrictAreaHoles(event.target);
          }
      })
      .resizable({
        preserveAspectRatio: true,
        square: true,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizemove', function (event) {

        var target = $(event.target),
            targetParent = $(event.target).parent(),
            targetImage = $(event.target).children('img'),
            x = (parseFloat($(targetParent).attr('data-x')) || 0),
            y = (parseFloat($(targetParent).attr('data-y')) || 0);

        var currentDegree = controller.getPositionOfElement(targetParent);

        // update the element's style

        $(targetParent).css('width', event.rect.width)
        $(targetParent).css('height', event.rect.height);
        $(target).css('width', event.rect.width)
        $(target).css('height', event.rect.height);
        $(targetImage).css('width', event.rect.width - 2);
        $(targetImage).css('height', event.rect.height - 2);

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        $(targetParent).css({
          '-webkit-transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + currentDegree +'deg)',
             '-moz-transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + currentDegree +'deg)',
              '-ms-transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + currentDegree +'deg)',
                  'transform': 'translate(' + x + 'px,' + y + 'px) rotate(' + currentDegree +'deg)'
        });

        $(targetParent).attr('data-x', x);
        $(targetParent).attr('data-y', y);
      });

    $('.' + elementsClass).hide();
  };

  Controller.prototype.catchElement = function() {
      var self = this;
      console.log(this);

      var mouse_is_outside = false;

      var div_elem = this.$holder.find('div');
      var arrow_elem = this.$holder.find('.rotation-arrow');
      var remove_elem = this.$holder.find('.remove-icon');

      this.$holder.find('div').hover(function(){
          mouse_is_outside = false;
      }, function(){
          mouse_is_outside = true;
      });

      this.$holder.find('div')
          .off('mousedown')
          .on('mousedown', function() {
              self.$holder.find('div').removeClass('active');
              $(this).addClass('active');

              self.$currentElement = $(this);

              $('.rotation-arrow').hide();
              $('.remove-icon').hide();

              $(this).parent().find('.rotation-arrow').show();
              $(this).parent().find('.remove-icon').show();

              // $('.qtip').hide();
          });

      $(document).click(function() {
          if(mouse_is_outside) {
              div_elem.removeClass('active');
              arrow_elem.hide();
              remove_elem.hide();
              $(".included-product").removeClass('active-product');
          }
      })
  };

  Controller.prototype.initItemsPanelArea = function(elem) {
    var controller = this;
    // show items panel
    $('.furniture-board-editor-items-panel').show();
    if (elem) {
      $(elem).attr('data-x', '0');
      $(elem).attr('data-y', '0');
      $(elem).css({
        '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
           '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
            '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                'transform': 'translate(0px, 0px) rotate(0deg)',
      });
      $(elem).show();
    } else {
      $('.items-panel-elem').show();
    }

    interact('.draggable2')
      .draggable({
        // enable inertial throwing
        inertia: false,
        // keep the element within the area of it's parent
        restrict: {
          restriction: ".furniture-board-dragg",
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: true,

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: dropElem
      });

    function dropElem (event) {
      var item = event.target;
      var itemId = $(item).data('id');
      // new position
      var newPositionX = +$(item).offset().left - +$('.furniture-board-editor').offset().left;
      var newPositionY = +$(item).offset().top - +$('.furniture-board-editor').offset().top;

      $(item).hide();

      // show real item
      var realItem = $('#' + itemId);
      realItem.show();

      // restrict position
      if ( newPositionX + +realItem.width() >= +$('.furniture-board-editor').width() ) {
        var diffX = ( newPositionX + +realItem.width() - +$('.furniture-board-editor').width() ) + 3;
        newPositionX -= diffX;
      }

      if ( newPositionY + +realItem.height() >= +$('.furniture-board-editor').height() ) {
        var diffY = ( newPositionY + +realItem.height() - +$('.furniture-board-editor').height() ) + 3;
        newPositionY -= diffY;
      }

      // set new position
      realItem.parent().attr('data-rotation', 0);
      realItem.parent().attr('data-x', newPositionX);
      realItem.parent().attr('data-y', newPositionY);
      realItem.attr('data-rotation', 0);
      realItem.attr('data-x', newPositionX);
      realItem.attr('data-y', newPositionY);

      realItem.parent().css({
        '-webkit-transform': 'translate('+ newPositionX +'px, ' + newPositionY +'px) rotate(0deg)',
        '-moz-transform': 'translate('+ newPositionX +'px, ' + newPositionY +'px) rotate(0deg)',
        '-ms-transform': 'translate('+ newPositionX +'px, ' + newPositionY +'px) rotate(0deg)',
        'transform': 'translate('+ newPositionX +'px, ' + newPositionY +'px) rotate(0deg)',
      });

      console.log(newPositionX, newPositionY);

      if ( $('.furniture-board-editor-items-panel').height() === 0 ){
        $('.furniture-board-editor-items-panel').hide();
      }

      // if ( controller.restrictAreaHoles(realItem) ) {
      //   console.log('daaa');
      //   realItem.hide();
      //   $('.qtip').hide();
      //   controller.initItemsPanelArea( $(item) );
      // }

    }

    function dragMoveListener (event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  };

  Controller.prototype.removeElement = function() {
      var controller = this;
      $('.remove-item').click(function() {
        var elem = $("#" + $(this).attr('data-item-id'));
        var elemId = $(elem).attr('id');
        elem.hide();

        elem.parent().css({
          '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
             '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
              '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                  'transform': 'translate(0px, 0px) rotate(0deg)',
        });

        elem.parent().attr('data-rotation', '0');
        elem.parent().attr('data-x', '0');
        elem.parent().attr('data-y', '0');
        elem.attr('data-rotation', '0');
        elem.attr('data-x', '0');
        elem.attr('data-y', '0');
        elem.parent().css({
          top: 0,
          left: 0
        });

        // $('.qtip').hide();
        var elemInPanel = $('.items-panel-elem[data-id="' + elemId + '"]')
        controller.initItemsPanelArea( elemInPanel );

      });
  };

  Controller.prototype.initMouseRotation = function() {
        var controller = this;

        $('.rotation-arrow').mousedown(function(e) {
          e.preventDefault(); // prevents the dragging of the image.

          currentElement = $(this).parent().children('.draggable');
          parentElem = $(currentElement).parent();
          positionBefore = controller.getPositionOfElement($(parentElem));

          $(document).bind('mousemove.rotateImg', function(e2) {
            rotateOnMouse(e2, currentElement, parentElem, positionBefore);
          });
        });

        $(document).mouseup(function(e) {
          $(document).unbind('mousemove.rotateImg');
          if ( controller.checkOutside( currentElement ) ) {
            console.log('restr')
            controller.rotateInsideArea(positionBefore, currentElement);
            controller.setCollisions(currentElement);
          }
        });

        $('.rotation-arrow').click(function(e) {
          e.preventDefault();

          currentElement = $(this).parent().children('.draggable');
          parentElem = $(currentElement).parent();
          positionBefore = controller.getPositionOfElement($(parentElem));

          rotateOnMouseClick(currentElement, parentElem, positionBefore);
        });

        function rotateOnMouse(e, currentElement, parentElem, positionBefore) {
          var offset = currentElement.offset();
          var center_x = offset.left;
          var center_y = offset.top;
          var mouse_x = e.pageX;
          var mouse_y = e.pageY;
          var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
          var degree = (radians * (180 / Math.PI) * -1) + 60;
          var offsetX = parseFloat(parentElem.attr('data-x')),
              offsetY = parseFloat(parentElem.attr('data-y'));

          parentElem.css('-moz-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
          parentElem.css('-webkit-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
          parentElem.css('-o-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
          parentElem.css('-ms-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');

          currentElement.attr('data-rotation', degree);
          parentElem.attr('data-rotation', degree);
        }

        function rotateOnMouseClick(currentElement, parentElem, positionBefore) {

          var beforeDegree = positionBefore.degree
          var newDegree = beforeDegree + 90;
          console.log(beforeDegree);
          console.log(newDegree);

          var offsetX = parseFloat(parentElem.attr('data-x')),
              offsetY = parseFloat(parentElem.attr('data-y'));

          setDegree(newDegree);

          if ( controller.checkOutside( currentElement ) ) {
            setDegree(beforeDegree);
          }

          function setDegree(degree) {
            parentElem.css('-moz-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            parentElem.css('-webkit-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            parentElem.css('-o-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            parentElem.css('-ms-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');

            currentElement.attr('data-rotation', degree);
            parentElem.attr('data-rotation', degree);
          }
        }
  };

  Controller.prototype.checkOutside = function(elem) {
    var controller = this;
    var elemPoints = defineElemPoints(elem);
    var roomAreaPoints = defineRoomArea();

    function defineElemPoints(elem) {

      var pointTopLeft = $(elem).children('.left-top');
      var pointTopRight = $(elem).children('.right-top');
      var pointBottomLeft = $(elem).children('.left-bottom');
      var pointBottomRight = $(elem).children('.right-bottom');

      var elemTopLeft = [+pointTopLeft.offset().top, +pointTopLeft.offset().left];
      var elemTopRight = [+pointTopRight.offset().top, +pointTopRight.offset().left];
      var elemBottomLeft = [+pointBottomLeft.offset().top, +pointBottomLeft.offset().left];
      var elemBottomRight = [+pointBottomRight.offset().top, +pointBottomRight.offset().left];

      var elemPoints = [elemTopLeft, elemTopRight, elemBottomRight, elemBottomLeft];
      return elemPoints;
    }

    function defineRoomArea() {
      var top = +$('.furniture-board-editor').offset().top;
      var left = +$('.furniture-board-editor').offset().left;
      var width = +$('.furniture-board-editor').width();
      var height = +$('.furniture-board-editor').height();

      var leftTop = [top, left]
      var rightTop = [top, left + width]
      var rightBottom = [top + height, left + width]
      var leftBottom = [top + height, left]

      var roomArea = [leftTop, rightTop, rightBottom, leftBottom];
      return roomArea;
    }

    function checkOutside(points, areaPoints, elem) {
      var wrongPosition = [];
      $.each(points, function(index, point) {
        wrongPosition.push( !controller.checkInsidePoligon(point, areaPoints) );
      });
      if (wrongPosition.indexOf(true) != -1) {
        return true;
      } else {
        return false;
      }
    }

    return checkOutside(elemPoints, roomAreaPoints, elem);
  };

  Controller.prototype.rotateInsideArea = function(positionBefore, elem) {
      var controller = this;
      var beforeDegree = positionBefore.degree;
      var beforetTop = positionBefore.top;
      var beforeLeft = positionBefore.left;

      var afterDegree = controller.getPositionOfElement(elem.parent()).degree

      while ( controller.checkOutside(elem) ) {
        console.log(afterDegree);
        $(elem).parent().css({
          '-webkit-transform': 'translate(' + beforeLeft + 'px,' + beforetTop + 'px) rotate(' + afterDegree +'deg)',
             '-moz-transform': 'translate(' + beforeLeft + 'px,' + beforetTop + 'px) rotate(' + afterDegree +'deg)',
              '-ms-transform': 'translate(' + beforeLeft + 'px,' + beforetTop + 'px) rotate(' + afterDegree +'deg)',
                  'transform': 'translate(' + beforeLeft + 'px,' + beforetTop + 'px) rotate(' + afterDegree +'deg)',
        });
        $(elem).attr('data-rotation', afterDegree);
        $(elem).parent().attr('data-rotation', afterDegree);
        if ( afterDegree > beforeDegree ) {
          afterDegree -= 1;
        } else if ( afterDegree < beforeDegree ) {
          afterDegree += 1;
        }else{
          return;
        }
      }
  };

  Controller.prototype.setCollisions = function(elem) {
      var controller = this;
      var elemPoints = defineElemPoints(elem);
      var neighborsPoligons = defineNeighbors( $('.draggable').not('.active') );

      setCollisions(elemPoints, neighborsPoligons, elem);

      function defineElemPoints(elem) {

        var pointTopLeft = $(elem).children('.left-top');
        var pointTopRight = $(elem).children('.right-top');
        var pointBottomLeft = $(elem).children('.left-bottom');
        var pointBottomRight = $(elem).children('.right-bottom');

        var elemTopLeft = [+pointTopLeft.offset().top, +pointTopLeft.offset().left];
        var elemTopRight = [+pointTopRight.offset().top, +pointTopRight.offset().left];
        var elemBottomLeft = [+pointBottomLeft.offset().top, +pointBottomLeft.offset().left];
        var elemBottomRight = [+pointBottomRight.offset().top, +pointBottomRight.offset().left];

        var elemPoints = [elemTopLeft, elemTopRight, elemBottomRight, elemBottomLeft];
        return elemPoints;
      }

      function defineNeighbors(neighborsClass) {
        var neighbors = [];
        $(neighborsClass).each(function() {
          var top = +$(this).offset().top;
          var left = +$(this).offset().left;
          var width = +$(this).width();
          var height = +$(this).height();

          var leftTop = [top, left]
          var rightTop = [top, left + width]
          var rightBottom = [top + height, left + width]
          var leftBottom = [top + height, left]

          var neighbor = { elem: $(this), points: [leftTop, rightTop, rightBottom, leftBottom] };
          neighbors.push(neighbor);
        });

        return neighbors;
      }

      function setCollisions(points, neighbors, elem){
        var wrongPosition = [];
        var collNeighbors = [];
        var found;
        $.each(points, function(index, point) {
          $.each(neighbors, function(index, neighbor) {
            wrongPosition.push( controller.checkInsidePoligon(point, neighbor.points) );
            if ( controller.checkInsidePoligon(point, neighbor.points) ) {
              pushIfNotAlready(collNeighbors, neighbor.elem);
            }
          });
        });
        $.each(neighbors, function(index, neighbor) {
          $.each(neighbor.points, function(index, neighborPoint) {
            wrongPosition.push( controller.checkInsidePoligon(neighborPoint, points) );
            if ( controller.checkInsidePoligon(neighborPoint, points) ) {
              pushIfNotAlready(collNeighbors, neighbor.elem);
            }
          });
        });

        function pushIfNotAlready(filters, newFilter) {
          var found = jQuery.inArray(newFilter, filters);
          if (found === -1) {
            // Element was not found, add it.
            filters.push(newFilter);
          }
        }
        $('.draggable').each(function(){
          $(this).removeClass('collision');
        });

        $.each(collNeighbors, function() {
          $(this).addClass('collision');
        });
      }
  };

  Controller.prototype.init = function() {
    this.initElements(this.$initialElenemts);
    this.initItemsPanelArea();
    this.removeElement();
    this.catchElement();
    this.initMouseRotation();
  };

  $(document).ready(function() {
    var controller = new Controller();
    controller.init();
  });

})(jQuery);
