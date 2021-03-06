(function($) {

  function ControllerFb() {
    this.$holder = $('.furniture-board-editor');
    this.$initialElenemts = 'fb-draggable';
    this.$currentElement = null;
    this.$parentElem = null;
    this.$positionBefore = null;

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

  ControllerFb.prototype.initElements = function(elementsClass) {
    var controller = this;
    // set container width

    setProportion();

    $(window).resize(function(){
      setProportion();
    });

    function setProportion() {
      var documentWidth = $(window).width();
      $('.furniture-board-editor').width(documentWidth * 0.6);
      $('.furniture-board-dragg').width(documentWidth * 0.6);
      var furnitureBoardEditorHeight = ( +$('.furniture-board-editor').width() * 3 ) / 5;
      $('.furniture-board-editor').height(furnitureBoardEditorHeight);

      $('.' + elementsClass).each(function() {
        if( $(this).attr('data-width') === '' || $(this).attr('data-depth') === '' ) {
          var newWidth = +$('.furniture-board-editor').width() / 4;
          $(this).width( newWidth );
        } else {
          var newWidth = +$('.furniture-board-editor').width() / +$(this).attr('data-width');
          var newDepth = +$('.furniture-board-editor').height() / +$(this).attr('data-height');
          $(this).width( newWidth );
          $(this).height( newDepth );
          $(this).parent().width( newWidth );
          $(this).parent().height( newDepth );
          $(this).find('.fb-item-image').height( newDepth );
        }
        controller.initResizeArrow( $(this) );
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
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .on('resizemove', function (event) {
        var target = $(event.target),
            targetParent = $(event.target).parent(),
            targetImage = $(event.target).children('img'),
            x = (parseFloat($(targetParent).attr('data-x')) || 0),
            y = (parseFloat($(targetParent).attr('data-y')) || 0);

        var currentDegree = controller.getPositionOfElement(targetParent).degree;

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

        $(target).attr('data-x', x);
        $(target).attr('data-y', y);
        $(targetParent).attr('data-x', x);
        $(targetParent).attr('data-y', y);

        controller.initResizeArrow( $(target) );

      });


    $('.fb-draggable').each(function() {
      $(this).qtip({
        content: {
          text: $('#fb-elem-tooltip-' + $(this).attr('data-id')).clone(),
          title: ' ',
          button: true
        },
        position: {
          my: 'right top',
          at: 'left bottom',
          target: $(this),
          viewport: $(window)
        },
        style: {
          classes: 'qtip-bootstrap'
        },
        hide: {
          event: 'mousedown unfocus mouseleave',
          delay: 150,
          fixed: true
        },
        show: {
          event: 'mouseover'
        }
      });
    });

    var itemsWithoutPosition = [];
    var itemsWithPosition = [];
    $('.fb-draggable').each(function() {
      if ( $(this).attr('data-board-x') === '' || $(this).attr('data-board-y') === '' ) {
        itemsWithoutPosition.push( $(this) );
      } else {
        itemsWithPosition.push( $(this) );
      }
    });

    clearAreaAndInitPanel(itemsWithoutPosition);

    $(itemsWithPosition).each(function() {
      var posX = +$('.furniture-board-editor').width() / +$(this).attr('data-board-x');
      var posY = +$('.furniture-board-editor').height() / +$(this).attr('data-board-y');
      var rotation = $(this).attr('data-board-rotation');
      $(this).parent().css({
          '-webkit-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation + 'deg)',
             '-moz-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation + 'deg)',
              '-ms-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation + 'deg)',
                  'transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation + 'deg)'
      });
      $(this).attr('data-x', posX);
      $(this).attr('data-y', posY);
      $(this).attr('data-rotation', rotation);
      $(this).parent().attr('data-x', posX);
      $(this).parent().attr('data-y', posY);
      $(this).parent().attr('data-rotation', rotation);
    });

    function clearAreaAndInitPanel(items) {
      // console.log(items);
      clearArea();
      resetElemInArea();
      resetItemsInPanel();

      $(items).each(function() {
        var elemId = $(this).attr('data-id');
        var elemInPanel = $('.fb-items-panel-elem[data-panel-elem-id="' + elemId + '"]');
        controller.initItemsPanelArea(elemInPanel);
      });

      function clearArea(){
        $(items).each(function() {
          $(this).css('display', 'none');
        });
      }

      function resetElemInArea(){
        $(items).each(function() {
          $(this).parent().css({
            '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
               '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
                '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                    'transform': 'translate(0px, 0px) rotate(0deg)',
          });

          $(this).parent().attr('data-rotation', 0);
          $(this).parent().attr('data-x', 0);
          $(this).parent().attr('data-y', 0);
          $(this).attr('data-rotation', 0);
          $(this).attr('data-x', 0);
          $(this).attr('data-y', 0);
          $(this).parent().css({
            top: 0,
            left: 0
          });
        });
      }

      function resetItemsInPanel() {
        $(items).each(function() {
          elemId = $(this).attr('data-id');
          panelElem = $(".fb-items-panel-elem[data-id='" + elemId + "']");

          $(panelElem).attr('data-x', '0');
          $(panelElem).attr('data-y', '0');

          $(panelElem).css({
            '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
               '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
                '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                    'transform': 'translate(0px, 0px) rotate(0deg)',
          });

          $(panelElem).show();
        });
      }
    }


  };

  ControllerFb.prototype.catchElement = function() {
      var controller = this;

      var mouse_is_outside = false;

      var divElem = this.$holder.find('div');
      var arrowElem = this.$holder.find('.fb-rotation-arrow');
      var removeElem = this.$holder.find('.fb-remove-icon');
      var resizeElem = this.$holder.find('.resize-arrow');


      this.$holder.find('div').hover(function(){
          mouse_is_outside = false;
      }, function(){
          mouse_is_outside = true;
      });

      this.$holder.find('div')
          .off('mousedown')
          .on('mousedown', function() {
              controller.$holder.find('div').removeClass('active');
              $(this).addClass('active');

              controller.$currentElement = $(this);

              arrowElem.hide();
              removeElem.hide();
              resizeElem.hide();

              $(this).parent().find('.fb-rotation-arrow').show();
              $(this).parent().find('.fb-remove-icon').show();
              $(this).find('.resize-arrow').show();
              controller.initResizeArrow( $(this) )
              // $('.qtip').hide();
          });

      $(document).click(function() {
          if(mouse_is_outside) {
              divElem.removeClass('active');
              arrowElem.hide();
              removeElem.hide();
              resizeElem.hide();
              $(".included-product").removeClass('active-product');
          }
      })
  };

  ControllerFb.prototype.initItemsPanelArea = function(item) {
    var controller = this;
    // show items panel

    $('.furniture-board-editor-items-panel').show();
    $(item).attr('data-x', '0');
    $(item).attr('data-y', '0');
    $(item).css({
      '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
         '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
          '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
              'transform': 'translate(0px, 0px) rotate(0deg)'
    });
    console.log($(item));
    $(item).show();

    interact('.fb-draggable2')
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
      var itemId = $(item).attr('data-panel-elem-id');
      // new position
      var newPositionX = +$(item).offset().left - +$('.furniture-board-editor').offset().left;
      var newPositionY = +$(item).offset().top - +$('.furniture-board-editor').offset().top;

      $(item).hide();

      // show real item
      var realItem = $('div.fb-draggable[data-id="' + itemId + '"]' );
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

      controller.initResizeArrow( $(realItem) );

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

    $('.fb-draggable2').each(function() {
      $(this).qtip({
        content: {
          text: $('#fb-panel-elem-tooltip-' + $(this).attr('data-panel-elem-id')).clone(),
          title: ' ',
          button: true
        },
        position: {
          my: 'right top',
          at: 'left center',
          target: $(this),
          viewport: $(window)
        },
        style: {
          classes: 'qtip-bootstrap'
        },
        hide: {
          event: 'mousedown unfocus mouseleave',
          delay: 150,
          fixed: true
        },
        show: {
          event: 'mouseover'
        }
      });
    });
  };

  ControllerFb.prototype.removeElement = function() {
      var controller = this;
      $('.fb-remove-item').click(function() {
        var elemId = $(this).attr('data-item-id');
        var elem = $('div.fb-draggable[data-id="' + elemId + '"]' )
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
        var elemInPanel = $('.fb-items-panel-elem[data-panel-elem-id="' + elemId + '"]')
        controller.initItemsPanelArea( elemInPanel );

      });
  };

  ControllerFb.prototype.initMouseRotation = function() {
        var controller = this;

        $('.fb-rotation-arrow').mousedown(function(e) {
          e.preventDefault(); // prevents the dragging of the image.

          controller.$currentElement = $(this).parent().children('.fb-draggable');
          controller.$parentElem = $(this).parent();
          controller.$positionBefore = controller.getPositionOfElement( $(controller.$parentElem) );


          $(document).bind('mousemove.rotateImg', function(e2) {
            rotateOnMouse(e2, controller.$currentElement, controller.$parentElem, controller.$positionBefore);
          });
        });

        $(document).mouseup(function(e) {
          if ( !$('.furniture-board-editor').is(":visible") ) {
            return false;
          }
          $(document).unbind('mousemove.rotateImg');
          if ( controller.checkOutside( controller.$currentElement ) ) {
            console.log('rest');
            controller.rotateInsideArea(controller.$positionBefore, controller.$currentElement);
            controller.setCollisions(controller.$currentElement);
          }
        });

        $('.fb-rotation-arrow').click(function(e) {
          e.preventDefault();

          controller.$currentElement = $(this).parent().children('.fb-draggable');
          controller.$parentElem = $(this).parent();
          controller.$positionBefore = controller.getPositionOfElement($( controller.$parentElem ));

          rotateOnMouseClick(controller.$currentElement, controller.$parentElem, controller.$positionBefore);
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

          var offsetX = parseFloat(parentElem.attr('data-x')),
              offsetY = parseFloat(parentElem.attr('data-y'));

          setDegree(newDegree);

          if ( controller.checkOutside( controller.$currentElement ) ) {
            console.log('rest');
            controller.rotateInsideArea(controller.$positionBefore, controller.$currentElement);
            controller.setCollisions(controller.$currentElement);
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

  ControllerFb.prototype.checkOutside = function(elem) {
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

  ControllerFb.prototype.rotateInsideArea = function(positionBefore, elem) {
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

  ControllerFb.prototype.setCollisions = function(elem) {
      var controller = this;
      var elemPoints = defineElemPoints(elem);
      var neighborsPoligons = defineNeighbors( $('.fb-draggable').not('.active') );

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
        $('.fb-draggable').each(function(){
          $(this).removeClass('collision');
        });

        $.each(collNeighbors, function() {
          $(this).addClass('collision');
        });
      }
  };

  ControllerFb.prototype.initResizeArrow = function(elem) {
    console.log('eeeeeeeeeeeeeeeeeeeeee');
    var resizeArrowTop = $(elem).find('.resize-arrow-top');
    var resizeArrowBottom = $(elem).find('.resize-arrow-bottom');
    var resizeArrowRight = $(elem).find('.resize-arrow-right');
    var resizeArrowLeft = $(elem).find('.resize-arrow-left');

    $(resizeArrowTop).css({
      'left': ( +$(elem).width() / 2 ) - ( +resizeArrowTop.width() / 2)  + 'px'
    });
    $(resizeArrowBottom).css({
      'left': ( +$(elem).width() / 2 ) - ( +resizeArrowBottom.width() / 2)  + 'px'
    });
    $(resizeArrowRight).css({
      'top': ( +$(elem).height() / 2 ) - ( +resizeArrowRight.height() / 2)  + 'px'
    });
    $(resizeArrowLeft).css({
      'top': ( +$(elem).height() / 2 ) - ( +resizeArrowLeft.height() / 2)  + 'px'
    });
  };


  ControllerFb.prototype.init = function() {
    this.initElements(this.$initialElenemts);
    // this.initItemsPanelArea();
    this.removeElement();
    this.catchElement();
    this.initMouseRotation();
  };

  $(document).ready(function() {
    var controllerFb = new ControllerFb();
    controllerFb.init();

    $('.subtabs__one-tab').click(function(e) {
      e.preventDefault();
      if ( $('.active-tab').attr('id') === 'furniture-board' ) {
        console.log('furniture-board-subtab');
        saveFunitureBoard();
      }
    });

    $('.main-tabs__one-tab').click(function(e) {
      e.preventDefault();
      if ( $('.active-tab').attr('id') === 'furniture-board' ) {
        console.log('furniture-board-tab');
        saveFunitureBoard()
      }
      window.open( $(this).attr('href') ,"_self")
    });

    function saveFunitureBoard() {
      var data = {
        products: {}
      };

      $(".fb-draggable:visible").each(function() {
        var elemId = $(this).attr('data-id');

        var width = +$('.furniture-board-editor').width() / +$(this).parent().width();
        var depth = +$('.furniture-board-editor').height() / +$(this).parent().height();

        var posX = +$('.furniture-board-editor').width() / Math.abs( +controllerFb.getPositionOfElement( $(this).parent() ).left );
        var posY = +$('.furniture-board-editor').height() / Math.abs( +controllerFb.getPositionOfElement( $(this).parent() ).top );
        var rotation = +controllerFb.getPositionOfElement( $(this).parent() ).degree;

        data.products[elemId] = {
          board_width: width,
          board_depth: depth,
          board_posX: posX,
          board_posY: posY,
          board_rotation: rotation
        }
      });

      $.ajax({
          url: $('#furniture-board').attr('data-url'),
          type: "PATCH",
          data: JSON.stringify(data),
          dataType: "json",
          contentType: 'application/json',
          success: function() {
            console.log('success');
          },
          error: function() {
            console.log('error');
          }
      });
    }

    $('.board-submit-room').on('click', function() {
      saveFunitureBoard();
      var button = this;
      var data = {
        ids: []
      };

      $(".fb-draggable:hidden").each(function() {
        console.log(this);
        var elemId = $(this).attr('data-id');
        data.ids.push(elemId);
      });

      console.log(data.ids)

      $.ajax({
          url: $(button).attr('data-url'),
          type: "PATCH",
          data: JSON.stringify(data),
          dataType: "json",
          contentType: 'application/json',
          success: function() {
            $(data.ids).each(function() {
              var id = this;
              $("div.product[data-id='" + id + "']").remove();

              $(".draggable#" + id).parent().remove();
              $(".draggable2[data-id='" + id + "']").remove();

              $(".fb-draggable[data-id='" + id + "']").parent().remove();
              $(".fb-draggable2[data-panel-elem-id='" + id + "']").remove();

              if ( $('.furniture-board-editor-items-panel').height() === 0 ){
                $('.furniture-board-editor-items-panel').hide();
              }
            });
          },
          error: function() {
            console.log('error');
          }
      });
    });
  });

})(jQuery);
