(function($) {

    /**
     * Init all draggable logic here
     *
     * @constructor
     */
    function Controller() {

        /**
         * Default elements class
         * @type {string}
         */
        this.$initialElenemts = 'draggable';

        /**
         * Add draggable element on click
         * @type {*|HTMLElement}
         */
        this.$addButton = $('.add-draggable');

        /**
         * Editor container
         * @type {*|HTMLElement}
         */
        this.$holder = $('.editor-container');

        /**
         * Rotate current element
         * @type {*|HTMLElement}
         */
        this.$rotationPanel = $('.rotation-manager');

        /**
         * Move element x coord
         * @type {*|HTMLElement}
         */
        this.$positionPanelX = $('.position-x');

        /**
         * Move element y coord
         * @type {*|HTMLElement}
         */
        this.$positionPanelY = $('.position-y');

        /**
         * Hold current element on click
         * @type {null}
         */
        this.$currentElement = null;

        this.$parentElem = null;

        this.$positionBefore = null;

        /**
         * Calculate Holder width
         */
        this.holderWidth = parseFloat(this.$holder.attr('data-width'));

        /**
         * Calculate holder height
         * @type {Number}
         */
        this.holderHeight = parseFloat(this.$holder.attr('data-height'));

        /**
         * List all products
         * @type {*|HTMLElement}
         */
        this.$productsManager = $('.products-manager');

        /**
         * Manage products list
         * @type {*|HTMLElement}
         */
        this.$catsManager = $('.categories-manager');

        this.getDegreeOfElement = function(elem) {
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

    /**
     * Init draggable elements
     * With interact
     * @param elementsClass
     */
    Controller.prototype.initElements = function(elementsClass) {
        var controller = this;
        // set container width
        var documentWidth = $(window).width();
        $('.room-editor-container').width(documentWidth * 0.35);
        $('.editor-container').width(documentWidth * 0.35);

        $('.dragg').width( $('.editor-container').css('width') );

        // set container height according width
        var scaling = parseFloat(this.$holder.data('width')) / this.$holder.width();
        console.log(this.$holder.data('width'))
        $('.editor-container').height($('.editor-container').data('height') / scaling);
        $('.room-planner-intro').height($('.editor-container').height());
        // change editor height line
        $('.editor-height').height(+$('.editor-container').height() + 15);
        $('.editor-height img').height(+$('.editor-container').height() + 15);
        // change the intro height
        $('.room-planner-intro').height($('.editor-container').height() + 153);

        // init draggable
        interact('.' + elementsClass).draggable({
          // enable inertial throwing
          inertia: false,
          // keep the element within the area of it's parent
          restrict: {
              restriction: '.dragg',
              endOnly:true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },

          // call this function on every dragmove event
          onmove: function(event) {

            controller.restrictAreaHoles(event.target);
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

            $positionPanelX.val(x);
            $positionPanelY.val(y);



          },
          // call this function on every dragend event
          onend: function (event) {
            controller.moveInsideArea(event);
            controller.setCollisions(event.target);
            // var createRect = function($element) {
            //   return new SAT.Box(
            //     new SAT.Vector(parseFloat($element.parent().attr('data-x')), parseFloat($element.parent().attr('data-y'))),
            //     $element.parent().width(),
            //     $element.parent().height()
            //   ).toPolygon().setAngle(parseInt($element.attr('data-rotation')) * Math.PI/180.0);
            // },

            // $elements = $('.editor-container div').not('.active'),
            // activeRect = createRect($(event.target));

            // $elements.removeClass('collision');

            // $elements.each(function() {
            //   if(SAT.testPolygonPolygon(createRect($(this)), activeRect)) {
            //     $(this).addClass('collision');
            //   }
            // });

            controller.restrictAreaHoles(event.target);
          }
        });

        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {

          $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scaling);
          $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scaling);

          $(this).css({
            'width': $(this).data('width') / scaling,
            'height': $(this).data('height') / scaling
          });

          $(this).parent().css({
              'width': $(this).data('width') / scaling,
              'height': $(this).data('heigh') / scaling,

              '-webkit-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              '-moz-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              '-ms-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              'transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
          });

          // replase item to top and left if room is too small
          if( controller.restrictAreaHoles( $(this) ) ) {

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
          }

        });

        // $('[data-toggle="tooltip"]').tooltip();

        $('.draggable').each(function() {
          $(this).qtip({
            content: {
              text: $('#tooltip-' + $(this).attr('id')).clone(),
              title: ' ',
              button: true
            },
            position: {
              my: 'right top',
              at: 'left center',
              target: $(this)
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

        this.$holder.find('div')
          .on('mouseover', function() {
            $(".included-product[data-product-id='" + $(this).attr('id') + "']").addClass('active-product');
          })
          .on('mouseout', function() {
            if (!( $(this).hasClass( "active" ) ) ) {
              $(".included-product[data-product-id='" + $(this).attr('id') + "']").removeClass('active-product');
            }
          });
    }

    /**
     * Add new draggadle element on click
     */
    Controller.prototype.addElement = function() {
        this.$addButton.on('click', $.proxy(function() {
            var $element = $('<div class="draggable"></div>'),
                $selected = this.$productsManager.find('option:selected');

            $element.attr({
                'data-width': $selected.data('width'),
                'data-height': $selected.data('height'),
                'title': $selected.val(),
                'data-toggle': 'tooltip'
            });

            this.$holder.append($element);

            this.catchElement();

            this.initElements($element.attr('id'), '#');
        }, this));
    };

    /**
     * Catch element on click
     * Make it current for rotation panel and position panels
     */
    Controller.prototype.catchElement = function() {
        var self = this;
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

                $(".included-product").removeClass('active-product');
                $(".included-product[data-product-id='" + $(this).attr('id') + "']").addClass('active-product');

                self.$currentElement = $(this);
                self.$rotationPanel.val((parseInt($(this).attr('data-rotation')) || 0));
                self.$positionPanelX.val((parseFloat($(this).attr('data-x')) || 0));
                self.$positionPanelY.val((parseFloat($(this).attr('data-y')) || 0));

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

    /**
     * Translate and rotate current element with panels
     */
    Controller.prototype.transformElement = function() {

        if(this.$currentElement) {
            var deg = parseInt(this.$rotationPanel.val()),
                offsetX = parseFloat(this.$currentElement.attr('data-x')),
                offsetY = parseFloat(this.$currentElement.attr('data-y'));

            this.$currentElement.attr({
                'data-rotation': deg,
                'data-x': offsetX,
                'data-y': offsetY
            }).css({
                    'width': this.$currentElement.data('width'),
                    'height': this.$currentElement.data('height'),
                    '-webkit-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                    '-moz-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                    '-ms-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                    'transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)'
                });
        }
    };

    /**
     * Rotate current element
     * Remember to save transition too
     */
    Controller.prototype.rotateElement = function() {

            this.$rotationPanel.on('change', $.proxy(function() {

                this.transformElement();
            }, this));
    };

    /**
     * Manage position of element from panels
     */
    Controller.prototype.managePosition = function() {

        this.$positionPanelX.on('change', $.proxy(function() {

            this.transformElement();
        }, this));

        this.$positionPanelY.on('change', $.proxy(function() {

            this.transformElement();
        }, this));
    };

    /**
     * Manage elements scaling from here
     */
    Controller.prototype.manageHolderScaling = function() {
        var $widthPanel = $('.holder-width'),
            $heightPanel = $('.holder-height'),
            scale = $.proxy(function(scaleType) {
                var scaleX = this.holderWidth / $widthPanel.val(),
                    scaleY = this.holderHeight / $heightPanel.val(),
                    $elements = this.$holder.find('div');

                $elements.each(function() {
                    if(scaleType == 'xCord') {
                        $(this).width($(this).data('width') * scaleX);
                    } else {
                        $(this).height($(this).data('height') * scaleY);
                    }
                });
            }, this);

        $widthPanel.val(this.$holder.width());
        $heightPanel.val(this.$holder.height());

        $widthPanel.on('change', function() {
            scale('xCord');
        }).trigger('change');

        $heightPanel.on('change', function() {
            scale('yCord');
        }).trigger('change');
    };

    /**
     * Manage products list with category selection
     */
    Controller.prototype.manageCats = function() {
        var self = this;

        this.$catsManager.on('change', function() {
            var catID = parseInt($(this).find('option:selected').data('id'));
            if(catID) {
                self.$productsManager.find('option').hide();

                self.$productsManager.find('option[data-category="' + catID + '"]').show();
            }
        });
    };

    Controller.prototype.initMouseRotation = function() {
        var controller = this;

        $('.rotation-arrow').mousedown(function(e) {
          e.preventDefault(); // prevents the dragging of the image.

          currentElement = $(this).parent().children('.draggable');
          parentElem = $(currentElement).parent();
          positionBefore = controller.getDegreeOfElement($(parentElem));

          $(document).bind('mousemove.rotateImg', function(e2) {
            rotateOnMouse(e2, currentElement, parentElem, positionBefore);
          });
        });

        $(document).mouseup(function(e) {
          $(document).unbind('mousemove.rotateImg');
          if ( !$('.editor-container').is(":visible") ) {
            return false;
          }
          if (typeof currentElement !== 'undefined') {
            if ( controller.restrictAreaHoles( currentElement ) ) {
              console.log('restr')
              controller.rotateInsideArea(positionBefore, currentElement);
              controller.setCollisions(currentElement);
            }
          }
        });

        $('.rotation-arrow').click(function(e) {
          e.preventDefault();

          currentElement = $(this).parent().children('.draggable');
          parentElem = $(currentElement).parent();
          positionBefore = controller.getDegreeOfElement($(parentElem));

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

          var offsetX = parseFloat(parentElem.attr('data-x')),
              offsetY = parseFloat(parentElem.attr('data-y'));

          setDegree(newDegree);

          if ( controller.restrictAreaHoles( currentElement ) ) {
            console.log('restr')
            controller.rotateInsideArea(positionBefore, currentElement);
            controller.setCollisions(currentElement);
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

    /**
     * Open Dimensions Form
     */
    Controller.prototype.openDimensionsForm = function(elementsClass) {
      var setDimensionsButton = $('#set-dimensions');
      var dimensionsDialog = $('div#dimensions-dialog');
      var roomsOnSlide = 5;

      // define form dialog
      dimensionsDialog.dialog({
        autoOpen: false,
        minWidth: 850,
        maxWidth: 850,
        minHeight: 210,
        resizable: false,
        modal: true,
        open: function() {
          $(this).closest(".ui-dialog")
          .find(".ui-dialog-titlebar-close")
          .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
        },
        beforeClose: function(event, ui){
          restoreArea();
        }
      });
      var slider = $('#room-slider');
      var clicked = false;

      // open dialog form
      setDimensionsButton.on('click', function(){
        clearArea();
        dimensionsDialog.dialog('open');
        if (clicked === false) {
          initSlider();
        }
        interactSlide();
        clicked = true;
      });

      function initSlider() {
        slider.bxSlider({
          speed: 250,
          slideWidth: 200,
          minSlides: roomsOnSlide,
          maxSlides: roomsOnSlide,
          slideMargin: 5,
          moveSlides: 1,
          pager: false,
          onSlideAfter: function($slideElement, oldIndex, newIndex){
            var currentSlideDataID = +$slideElement.attr('data-room-id');
            var newSlideDataID;
            if (currentSlideDataID >= 0 && currentSlideDataID <= 2) {
              newSlideDataID = currentSlideDataID + 2;
            } else {
              newSlideDataID = 1 - (4 - currentSlideDataID);
            }
            var newSlide = $('#room-slider .slide[data-room-id="' + newSlideDataID + '"]');
            // console.log(newSlide);
            addYellowBorder( newSlide );
            setPreviewImage( newSlide );
            displayInputs( newSlide );
          }
        });
      }

      function interactSlide() {
        $('#room-slider .slide').click(function(){
          // move slider
          var currentSlide = slider.getCurrentSlide();
          var currlenElemIndex = $(this).index();
          var sliderElemPosition = currlenElemIndex - currentSlide - roomsOnSlide;
          var slidesCount = slider.getSlideCount();
          if (roomsOnSlide % 2 > 0){
            var slideCenter = Math.floor(roomsOnSlide / 2);
            var toSlide = currentSlide - (slideCenter - sliderElemPosition);

            if (toSlide < 0) {
              toSlide = slidesCount + toSlide;
            } else if (toSlide > 4) {
              toSlide = toSlide - slidesCount;
            }
            slider.goToSlide(toSlide);
          }
        });
      }

      function clearArea(){
        $('.' + elementsClass).each(function() {
           $(this).css('display', 'none');
        });
      }

      function restoreArea(){
        $('.' + elementsClass).each(function() {
          if ($('.editor-items-panel').css('display') === 'none') {
            $(this).css('display', 'block');
          } else {
            $(this).css('display', 'none');
          }
        });
      }

      function addYellowBorder(slide) {
        $('#room-slider img').removeClass('active-slider');
        $(slide).each(function(){
          $(this).find('img').addClass('active-slider');
        })
      }

      function setPreviewImage(slide) {
        if (slide[1]) {
          slide = slide[1];
        }
        var previewImage = $(slide).find('img').clone();
        previewImage.removeClass('active-slider');
        previewImage.removeClass('slider');
        $('#room-preview').html(previewImage);
      }

      function displayInputs(slide) {
        var roomId = $(slide).attr('data-room-id');
        $('.room-inputs').removeClass('active-room-inputs');
        $(".room-inputs[data-room-id='" + roomId + "']").addClass('active-room-inputs');
      }
    };

    /**
     * Resize area
     */
    Controller.prototype.setNewArea = function(elementsClass) {
      var controller = this;
      var dimensionsDialog = $('div#dimensions-dialog');
      $('#submit-new-dimensions').on('click', function(e) {
        e.preventDefault();
        $('.hole').remove();

        var activeRoomType = $('.active-room-inputs').attr('data-room-type');
        switch (activeRoomType) {
          case 'rect_0':
            newRect0('rect_0');
            break;
          case 'l_0':
            newL0('l_0');
            break;
          case 'l_1':
            newL1('l_1');
            break;
          case 'l_2':
            newL2('l_2');
            break;
          case 'l_3':
            newL3('l_3');
            break;
          case 't_0':
            newT0('t_0');
            break;
          case 't_1':
            newT1('t_1');
            break;
          case 't_2':
            newT2('t_2');
            break;
          case 't_3':
            newT3('t_3');
            break;
          case 'c_0':
            newC0('c_0');
            break;
          case 'c_1':
            newC1('c_1');
            break;
          case 'c_2':
            newC2('c_2');
            break;
          case 'c_3':
            newC3('c_3');
            break;
          case 'e_0':
            newE0('e_0');
            break;
          case 'e_1':
            newE1('e_1');
            break;
          case 'e_2':
            newE2('e_2');
            break;
          case 'e_3':
            newE3('e_3');
            break;
          case 'e_4':
            newF0('e_4');
            break;
          case 'e_5':
            newF1('e_5');
            break;
        }

        function newRect0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = 4;
          var newWidthFt = +form.find('.n-s-ft').val();
          var newWidthInch = +form.find('.n-s-inch').val();
          var newHeightFt = +form.find('.e-w-ft').val();
          var newHeightInch = +form.find('.e-w-inch').val();

          var newWidth = ( newWidthFt * 12 ) + newWidthInch;
          var newHeight = ( newHeightFt * 12 ) + newHeightInch;

          var scaling = newWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(newWidth, newHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(newWidth, newHeight);

          scaleAreaHeight(scaling);

          scaleEditorHeightLine();

          updateMeasureDescription(newWidthFt, newWidthInch, newHeightFt, newHeightInch);

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          // function validateNewRoomDimensions(scaling) {
          //   var newEditorContainerWidth =  +$('.editor-container').data('width');
          //   var newEditorContainerHeight =  +$('.editor-container').data('height');
          //   var invalidItemWidth = 0;
          //   var invalidItemHeight = 0;

          //   // validate width and heigh of room
          //   $('.' + elementsClass).each(function() {
          //     var newItemWidth = $(this).data('width');
          //     var newItemHeight = $(this).data('height');

          //     if(newItemWidth > newEditorContainerWidth) {
          //       invalidItemWidth++;
          //     }
          //     if (newItemHeight > newEditorContainerHeight) {
          //       invalidItemHeight++;
          //     }
          //   });

          //   return { invalidItemWidth: invalidItemWidth, invalidItemHeight: invalidItemHeight };
          // }

          // function renderFormErrors(errors) {
          //   console.log(errors);
          //   var invalidItemWidth = errors.invalidItemWidth;
          //   var invalidItemHeight = errors.invalidItemHeight;

          //   if (invalidItemWidth > 0 || invalidItemHeight > 0) {
          //     if (invalidItemWidth > 0 && invalidItemHeight === 0) {
          //       $('#dialog-form-errors').html("<center><p><b>New room width is too small for the furniture included. Please enlarge it.</b></p></center");
          //       $('.dialog-input-width').each(function(index) {
          //           $(this).css('border-color', '#A94442');
          //       });
          //       $('.dialog-input-height').each(function(index) {
          //           $(this).css('border-color', '#ccc');
          //       });

          //     } else if (invalidItemWidth === 0 && invalidItemHeight > 0) {
          //       $('#dialog-form-errors').html("<center><p><b>New room depth is too small for the furniture included. Please enlarge it.</b></p></center>");
          //       $('.dialog-input-width').each(function(index) {
          //           $(this).css('border-color', '#ccc');
          //       });
          //       $('.dialog-input-height').each(function(index) {
          //           $(this).css('border-color', '#A94442');
          //       });

          //     } else if (invalidItemWidth > 0 && invalidItemHeight > 0) {
          //       $('#dialog-form-errors').html("<center><p><b>New room dimensions are not enough for all the furniture included. Please, enlarge them both.</b></p></center");
          //       $('.dialog-input').each(function(index) {
          //           $(this).css('border-color', '#A94442');
          //       });
          //     }
          //     return false;
          //   } else {
          //     return true;
          //   }
          // }
        }
        function newL0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var sFt = form.find('.s-ft');
          var sInch = form.find('.s-inch');
          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s = toInches( sFt.val(), sInch.val() );
          var w = toInches( wFt.val(), wInch.val() );

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(s, w, formInputs), formInputs ) ) { return; }

          var scaling = s / +$('.editor-container').width();

          setNewDimensionsToArea(s, w);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( sFt.val(), sInch.val(), wFt.val(), wInch.val() );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(s === n1 + n2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, sFt, sInch);
              errorMessages.push('E have to be equal A+C');
            }
            if ( !(w === e1 + e2) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, wFt, wInch);
              errorMessages.push('F have to be equal B+D');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole'></div>");
            $('.hole').css({
              'width': n2 / scaling,
              'height': e1 / scaling,
              '-webkit-box-shadow': 'inset 3px -3px 0 3px black, 9px -9px 0 3px white',
              '-moz-box-shadow': 'inset 3px -3px 0 3px black, 9px -9px 0 3px white',
              'box-shadow': 'inset 3px -3px 0 3px black, 9px -9px 0 3px white',
              'top': 0,
              'right': 0
            })
          }
        }
        function newL1(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');
          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n = toInches( nFt.val(), nInch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w = toInches( wFt.val(), wInch.val() );

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

           if ( !renderFormErrors( validateNewRoomDimensions(n, w, formInputs), formInputs ) ) { return; }

          var scaling = n / +$('.editor-container').width();

          setNewDimensionsToArea(n, w);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( nFt.val(), nInch.val(), wFt.val(), wInch.val() );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n === s1 + s2) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2');
            }
            if ( !(w === e1 + e2) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, wFt, wInch);
              errorMessages.push('W have to be equal E1+E2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole'></div>");
            $('.hole').css({
              'width': s2 / scaling,
              'height': e2 / scaling,
              'border-top': '1px solid black',
              'border-left': '1px solid black',
              'bottom': 0,
              'right': 0
            })
          }
        }
        function newL2(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');
          var eFt = form.find('.e-ft');
          var eInch = form.find('.e-inch');
          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n = toInches( nFt.val(), nInch.val() );
          var e = toInches( eFt.val(), eInch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

           if ( !renderFormErrors( validateNewRoomDimensions(n, e, formInputs), formInputs ) ) { return; }

          var scaling = n / +$('.editor-container').width();

          setNewDimensionsToArea(n, e);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( nFt.val(), nInch.val(), eFt.val(), eInch.val() );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n === s1 + s2) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, nFt, nInch);
              errorMessages.push('A have to be equal E+C');
            }
            if ( !(e === w1 + w2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, eFt, eInch);
              errorMessages.push('B have to be equal F+D');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole'></div>");
            $('.hole').css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              '-webkit-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              '-moz-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'bottom': 0,
              'left': 0
            })
          }
        }
        function newL3(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var eFt = form.find('.e-ft');
          var eInch = form.find('.e-inch');
          var sFt = form.find('.s-ft');
          var sInch = form.find('.s-inch');
          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e = toInches( eFt.val(), eInch.val() );
          var s = toInches( sFt.val(), sInch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(s, e, formInputs), formInputs ) ) { return; }

          var scaling = s / +$('.editor-container').width();

          setNewDimensionsToArea(s, e);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( sFt.val(), sInch.val(), eFt.val(), eInch.val() );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(s === n1 + n2) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, nFt, nInch);
              errorMessages.push('S have to be equal N1+N2');
            }
            if ( !(e === w1 + w2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, eFt, eInch);
              errorMessages.push('E have to be equal W1+W2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole'></div>");
            $('.hole').css({
              'width': n1 / scaling,
              'height': w1 / scaling,
              'border-bottom': '1px solid black',
              'border-right': '1px solid black',
              'top': 0,
              'left': 0
            })
          }
        }
        function newT0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n = toInches( nFt.val(), nInch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          var roomWidth = n;
          var roomHeight = e1 + e2;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w1 + w2 === e1 + e2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, e1Ft, e1Inch, e2Ft, e2Inch);
              errorMessages.push('H+F have to be equal B+D');
            }
            if ( !(n === s1 + s2 + s3) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, s3Ft, s3Inch, nFt, nInch);
              errorMessages.push('A have to be equal G+E+C');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").css({
              'width': s3 / scaling,
              'height': e2 / scaling,
              '-webkit-box-shadow': 'inset 3px 3px 0 3px black, 9px 9px 0 3px white',
              '-moz-box-shadow': 'inset 3px 3px 0 3px black, 9px 9px 0 3px white',
              'box-shadow': 'inset -px 3px 0 3px black, 9px 9px 0 3px white',
              'bottom': 0,
              'right': 0
            });

            $("div[data-hole-id='2']").css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              '-webkit-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              '-moz-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'bottom': 0,
              'left': 0
            })
          }
        }
        function newT1(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');

          var eFt = form.find('.e-ft');
          var eInch = form.find('.e-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e = toInches( eFt.val(), eInch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );

          var roomWidth = n1 + n2;
          var roomHeight = e;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n1 + n2 === s1 + s2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, s1Ft, s1Inch, s2Ft, s2Inch);
              errorMessages.push('G+A have to be equal E+C');
            }
            if ( !(e === w1 + w2 + w3) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, w3Ft, w3Inch, eFt, eInch);
              errorMessages.push('B have to be equal H+F+D');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").css({
              'width': n1 / scaling,
              'height': w1 / scaling,
              // 'box-shadow': '3px 3px 0 3px black',

              '-webkit-box-shadow': 'inset -3px -3px 0 3px black, -9px -9px 0 3px white',
              '-moz-box-shadow': 'inset -3px -3px 0 3px black, -9px -9px 0 3px white',
              'box-shadow': 'inset -3px -3px 0 3px black, -9px -9px 0 3px white',
              'top': 0,
              'left': 0
            });

            $("div[data-hole-id='2']").css({
              'width': s1 / scaling,
              'height': w3 / scaling,
              // 'box-shadow': '3px -3px 0 3px black',

              '-webkit-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              '-moz-box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'box-shadow': 'inset -3px 3px 0 3px black, -9px 9px 0 3px white',
              'bottom': 0,
              'left': 0
            });
          }
        }
        function newT2(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var n3Ft = form.find('.n3-ft');
          var n3Inch = form.find('.n3-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');

          var sFt = form.find('.s-ft');
          var sInch = form.find('.s-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var n3 = toInches( n3Ft.val(), n3Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s = toInches( sFt.val(), sInch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          var roomWidth = s;
          var roomHeight = w1 + w2;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w1 + w2 === e1 + e2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, e1Ft, e1Inch, e2Ft, e2Inch);
              errorMessages.push('W1+W2 have to be equal E1+E2');
            }
            if ( !(s === n1 + n2 + n3) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, n3Ft, n3Inch, sFt, sInch);
              errorMessages.push('S have to be equal N1+N2+N3');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-bottom hole-border-right')
            $("div[data-hole-id='1']").css({
              'width': n1 / scaling,
              'height': w1 / scaling,
              'top': 0,
              'left': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-bottom hole-border-left');
            $("div[data-hole-id='2']").css({
              'width': n3 / scaling,
              'height': e1 / scaling,
              'top': 0,
              'right': 0
            });
          }
        }
        function newT3(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');

          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w = toInches( wFt.val(), wInch.val() );

          var roomWidth = n1 + n2;
          var roomHeight = w;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n1 + n2 === s1 + s2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, s1Ft, s1Inch, s2Ft, s2Inch);
              errorMessages.push('N1+N2 have to be equal S1+S2');
            }
            if ( !(w === e1 + e2 + e3) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, e3Ft, e3Inch, wFt, wInch);
              errorMessages.push('W have to be equal E1+E2+E3');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-bottom hole-border-left')
            $("div[data-hole-id='1']").css({
              'width': n2 / scaling,
              'height': e1 / scaling,
              'top': 0,
              'right': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-top hole-border-left');
            $("div[data-hole-id='2']").css({
              'width': s2 / scaling,
              'height': e3 / scaling,
              'bottom': 0,
              'right': 0
            });
          }
        }
        function newC0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');

          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w = toInches( wFt.val(), wInch.val() );

          var roomWidth = n1;
          var roomHeight = w;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n1 === s1) ) {
              invalidInputs.push(n1Ft, n1Inch, s1Ft, s1Inch);
              errorMessages.push('N1 have to be equal S1');
            }
            if ( !(n2 === s2) ) {
              invalidInputs.push(n2Ft, n2Inch, s2Ft, s2Inch);
              errorMessages.push('N2 have to be equal S2');
            }
            if ( !(w === e1 + e2 + e3) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, e3Ft, e3Inch, wFt, wInch);
              errorMessages.push('W have to be equal E1+E2+E3');
            }

            if ( !(n1 + s1 > n2 + s2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, s1Ft, s1Inch, s2Ft, s2Inch);
              errorMessages.push('N1+S1 have to be greater than N2+S2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-bottom hole-border-left')
            $("div[data-hole-id='1']").css({
              'width': s2 / scaling,
              'height': e2 / scaling,
              'top': e1 / scaling + 'px',
              'right': 0
            });

          }
        }
        function newC1(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n = toInches( nFt.val(), nInch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          var roomWidth = n;
          var roomHeight = w1;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w1 === e1) ) {
              invalidInputs.push(w1Ft, w1Inch, e1Ft, e1Inch);
              errorMessages.push('W1 have to be equal E1');
            }
            if ( !(w2 === e2) ) {
              invalidInputs.push(w2Ft, w2Inch, e2Ft, e2Inch);
              errorMessages.push('W2 have to be equal E2');
            }
            if ( !(n === s1 + s2 + s3) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, s3Ft, s3Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2+S3');
            }

            if ( !(w1 + e1 > w2 + e2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, e1Ft, e1Inch, e2Ft, e2Inch);
              errorMessages.push('W1+E1 have to be greater than W2+E2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-right hole-border-left')
            $("div[data-hole-id='1']").css({
              'width': s2 / scaling,
              'height': e2 / scaling,
              'bottom': 0,
              'left': s1 / scaling + 'px'
            });

          }
        }
        function newC2(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');

          var eFt = form.find('.e-ft');
          var eInch = form.find('.e-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var e = toInches( eFt.val(), eInch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );

          var roomWidth = n1;
          var roomHeight = e;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n1 === s2) ) {
              invalidInputs.push(n1Ft, n1Inch, s2Ft, s2Inch);
              errorMessages.push('N1 have to be equal S2');
            }
            if ( !(n2 === s1) ) {
              invalidInputs.push(n2Ft, n2Inch, s1Ft, s1Inch);
              errorMessages.push('N2 have to be equal S1');
            }
            if ( !(e === w1 + w2 + w3) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, w3Ft, w3Inch, eFt, eInch);
              errorMessages.push('E have to be equal W1+W2+W3');
            }

            if ( !(n1 + s2 > s1 + n2) ) {
              invalidInputs.push(n1Ft, n1Inch, s2Ft, s2Inch, s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('N1+S2 have to be greater than S1+N2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-right hole-border-bottom')
            $("div[data-hole-id='1']").css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              'top': w1 / scaling + 'px',
              'left': 0
            });

          }
        }
        function newC3(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var n3Ft = form.find('.n3-ft');
          var n3Inch = form.find('.n3-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');

          var sFt = form.find('.s-ft');
          var sInch = form.find('.s-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var n3 = toInches( n3Ft.val(), n3Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var s = toInches( sFt.val(), sInch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );

          var roomWidth = s;
          var roomHeight = w1;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w1 === e2) ) {
              invalidInputs.push(w1Ft, w1Inch, e2Ft, e2Inch);
              errorMessages.push('W1 have to be equal E2');
            }
            if ( !(e1 === w2) ) {
              invalidInputs.push(e1Ft, e1Inch, w1Ft, w1Inch);
              errorMessages.push('E1 have to be equal W2');
            }
            if ( !(s === n1 + n2 + n3) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, n3Ft, n3Inch, sFt, sInch);
              errorMessages.push('S have to be equal N1+N2+N3');
            }

            if ( !(w1 + e2 > e1 + w2) ) {
              invalidInputs.push(w1Ft, w1Inch, e2Ft, e2Inch, e1Ft, e1Inch, w2Ft, w2Inch);
              errorMessages.push('W1+E2 have to be greater than E1+W2');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-left hole-border-right hole-border-bottom')
            $("div[data-hole-id='1']").css({
              'width': n2 / scaling,
              'height': e1 / scaling,
              'top': 0,
              'left': n1 / scaling + 'px'
            });

          }
        }
        function newE0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var n3Ft = form.find('.n3-ft');
          var n3Inch = form.find('.n3-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');
          var e4Ft = form.find('.e4-ft');
          var e4Inch = form.find('.e4-inch');
          var e5Ft = form.find('.e5-ft');
          var e5Inch = form.find('.e5-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');

          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var n3 = toInches( n3Ft.val(), n3Inch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );
          var e4 = toInches( e4Ft.val(), e4Inch.val() );
          var e5 = toInches( e5Ft.val(), e5Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var w = toInches( wFt.val(), wInch.val() );

          var roomWidth = s3;
          var roomHeight = w;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w === e1 + e2 + e3 + e4 + e5) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, e3Ft, e3Inch, e4Ft, e4Inch, e5Ft, e5Inch, wFt, wInch);
              errorMessages.push('W have to be equal E1+E2+E3+E4+E5');
            }
            if ( !(n1 + s3 > s1 + n2) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch, s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('N1+S3 have to be greater than S1+N2');
            }
            if ( !(n1 + s3 > s2 + n3) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch, s2Ft, s2Inch, n3Ft, n3Inch);
              errorMessages.push('N1+S3 have to be greater than S2+N3');
            }
            if ( !(s1 === n2) ) {
              invalidInputs.push(s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('S1 have to be equal N2');
            }
            if ( !(s2 === n3) ) {
              invalidInputs.push(s2Ft, s2Inch, n3Ft, n3Inch);
              errorMessages.push('S2 have to be equal N3');
            }
            if ( !(n1 === s3) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch);
              errorMessages.push('N1 have to be equal S3');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-left hole-border-top hole-border-bottom')
            $("div[data-hole-id='1']").css({
              'width': s1 / scaling,
              'height': e2 / scaling,
              'top': e1 / scaling + 'px',
              'right': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-left hole-border-top hole-border-bottom')
            $("div[data-hole-id='2']").css({
              'width': n3 / scaling,
              'height': e4 / scaling,
              'bottom': e1 / scaling + 'px',
              'right': 0
            });

          }
        }
        function newE1(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');
          var s4Ft = form.find('.s4-ft');
          var s4Inch = form.find('.s4-inch');
          var s5Ft = form.find('.s5-ft');
          var s5Inch = form.find('.s5-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');

          var n = toInches( nFt.val(), nInch.val() );
          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var s4 = toInches( s4Ft.val(), s4Inch.val() );
          var s5 = toInches( s5Ft.val(), s5Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );

          var roomWidth = n;
          var roomHeight = w1;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n === s1 + s2 + s3 + s4 + s5) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, s3Ft, s3Inch, s4Ft, s4Inch, s5Ft, s5Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2+S3+S4+S5');
            }
            if ( !(w1 + e3 > e1 + w2) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch, e1Ft, e1Inch, w2Ft, w2Inch);
              errorMessages.push('N1+S3 have to be greater than S1+N2');
            }
            if ( !(w1 + e3 > e2 + w3) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch, e2Ft, e2Inch, w3Ft, w3Inch);
              errorMessages.push('W1+E3 have to be greater than E2+W3');
            }
            if ( !(w1 === e3) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch);
              errorMessages.push('W1 have to be equal E3');
            }
            if ( !(e1 === w2) ) {
              invalidInputs.push(e1Ft, e1Inch, w2Ft, w2Inch);
              errorMessages.push('E1 have to be equal W2');
            }
            if ( !(e2 === w3) ) {
              invalidInputs.push(e2Ft, e2Inch, w3Ft, w3Inch);
              errorMessages.push('E2 have to be equal W3');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-left hole-border-top hole-border-right')
            $("div[data-hole-id='1']").css({
              'width': s2 / scaling,
              'height': e1 / scaling,
              'bottom': 0,
              'right': s1 / scaling + 'px'
            });

            $("div[data-hole-id='2']").addClass('hole-border-left hole-border-top hole-border-right')
            $("div[data-hole-id='2']").css({
              'width': s4 / scaling,
              'height': w3 / scaling,
              'bottom': 0,
              'left': s5 / scaling + 'px'
            });

          }
        }
        function newE2(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var n3Ft = form.find('.n3-ft');
          var n3Inch = form.find('.n3-inch');

          var eFt = form.find('.e-ft');
          var eInch = form.find('.e-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');
          var w4Ft = form.find('.w4-ft');
          var w4Inch = form.find('.w4-inch');
          var w5Ft = form.find('.w5-ft');
          var w5Inch = form.find('.w5-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var n3 = toInches( n3Ft.val(), n3Inch.val() );
          var e = toInches( eFt.val(), eInch.val() );
          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );
          var w4 = toInches( w4Ft.val(), w4Inch.val() );
          var w5 = toInches( w5Ft.val(), w5Inch.val() );

          var roomWidth = n1;
          var roomHeight = e;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(e === w1 + w2 + w3 + w4 + w5) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, w3Ft, w3Inch, w4Ft, w4Inch, w5Ft, w5Inch, eFt, eInch);
              errorMessages.push('E have to be equal W1+W2+W3+W4+W5');
            }
            if ( !(n1 + s3 > s1 + n2) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch, s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('N1+S3 have to be greater than S1+N2');
            }
            if ( !(n1 + s3 > s2 + n3) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch, s2Ft, s2Inch, n3Ft, n3Inch);
              errorMessages.push('N1+S3 have to be greater than S2+N3');
            }
            if ( !(n1 === s3) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch);
              errorMessages.push('N1 have to be equal S3');
            }
            if ( !(s1 === n2) ) {
              invalidInputs.push(s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('S1 have to be equal N2');
            }
            if ( !(s2 === n3) ) {
              invalidInputs.push(s2Ft, s2Inch, n3Ft, n3Inch);
              errorMessages.push('S2 have to be equal N3');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-right hole-border-top hole-border-bottom')
            $("div[data-hole-id='1']").css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              'top': w1 / scaling + 'px',
              'left': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-right hole-border-top hole-border-bottom')
            $("div[data-hole-id='2']").css({
              'width': s2 / scaling,
              'height': w4 / scaling,
              'bottom': w5 / scaling + 'px',
              'left': 0
            });

          }
        }
        function newE3(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');
          var n3Ft = form.find('.n3-ft');
          var n3Inch = form.find('.n3-inch');
          var n4Ft = form.find('.n4-ft');
          var n4Inch = form.find('.n4-inch');
          var n5Ft = form.find('.n5-ft');
          var n5Inch = form.find('.n5-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');

          var sFt = form.find('.s-ft');
          var sInch = form.find('.s-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );
          var n3 = toInches( n3Ft.val(), n3Inch.val() );
          var n4 = toInches( n4Ft.val(), n4Inch.val() );
          var n5 = toInches( n5Ft.val(), n5Inch.val() );

          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );

          var s = toInches( sFt.val(), sInch.val() );

          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );

          var roomWidth = s;
          var roomHeight = w1;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(s === n1 + n2 + n3 + n4 + n5) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, n3Ft, n3Inch, n4Ft, n4Inch, n5Ft, n5Inch, sFt, sInch);
              errorMessages.push('S have to be equal N1+N2+N3+N4+N5');
            }
            if ( !(w1 + e3 > e1 + w2) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch, e1Ft, e1Inch, w2Ft, w2Inch);
              errorMessages.push('W1+E3 have to be greater than E1+W2');
            }
            if ( !(w1 + e3 > e2 + w3) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch, e2Ft, e2Inch, w3Ft, w3Inch);
              errorMessages.push('W1+E3 have to be greater than E2+W3');
            }
            if ( !(w1 === e3) ) {
              invalidInputs.push(w1Ft, w1Inch, e3Ft, e3Inch);
              errorMessages.push('W1 have to be equal E3');
            }
            if ( !(e1 === w2) ) {
              invalidInputs.push(e1Ft, e1Inch, w2Ft, w2Inch);
              errorMessages.push('E1 have to be equal W2');
            }
            if ( !(e2 === w3) ) {
              invalidInputs.push(e2Ft, e2Inch, w3Ft, w3Inch);
              errorMessages.push('E2 have to be equal W3');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-right hole-border-left hole-border-bottom')
            $("div[data-hole-id='1']").css({
              'width': n1 / scaling,
              'height': e1 / scaling,
              'top': 0,
              'left': n1 / scaling + 'px'
            });

            $("div[data-hole-id='2']").addClass('hole-border-right hole-border-left hole-border-bottom')
            $("div[data-hole-id='2']").css({
              'width': n4 / scaling,
              'height': e2 / scaling,
              'top': 0,
              'right': n5 / scaling + 'px'
            });

          }
        }
        function newF0(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var n1Ft = form.find('.n1-ft');
          var n1Inch = form.find('.n1-inch');
          var n2Ft = form.find('.n2-ft');
          var n2Inch = form.find('.n2-inch');

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');
          var e3Ft = form.find('.e3-ft');
          var e3Inch = form.find('.e3-inch');
          var e4Ft = form.find('.e4-ft');
          var e4Inch = form.find('.e4-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');

          var wFt = form.find('.w-ft');
          var wInch = form.find('.w-inch');

          var n1 = toInches( n1Ft.val(), n1Inch.val() );
          var n2 = toInches( n2Ft.val(), n2Inch.val() );

          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );
          var e3 = toInches( e3Ft.val(), e3Inch.val() );
          var e4 = toInches( e4Ft.val(), e4Inch.val() );

          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );

          var w = toInches( wFt.val(), wInch.val() );

          var roomWidth = n1;
          var roomHeight = w;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w === e1 + e2 + e3 + e4) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch, e3Ft, e3Inch, e4Ft, e4Inch, wFt, wInch);
              errorMessages.push('W have to be equal E1+E2+E3+E4');
            }
            if ( !(n1 === s3 + s2) ) {
              invalidInputs.push(n1Ft, n1Inch, s3Ft, s3Inch, s2Ft, s2Inch);
              errorMessages.push('N1 have to be equal S1+S2');
            }
            if ( !(n1 > s1) ) {
              invalidInputs.push(n1Ft, n1Inch, s1Ft, s1Inch);
              errorMessages.push('N1 have to be greater than S1');
            }
            if ( !(n1 > n2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch);
              errorMessages.push('N1 have to be greater than N2');
            }
            if ( !(s1 === n2) ) {
              invalidInputs.push(s1Ft, s1Inch, n2Ft, n2Inch);
              errorMessages.push('S1 have to be equal N2');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-left hole-border-bottom');
            $("div[data-hole-id='1']").css({
              'width': s1 / scaling,
              'height': e2 / scaling,
              'top': e1 / scaling + 'px',
              'right': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-top hole-border-left');
            $("div[data-hole-id='2']").css({
              'width': s2 / scaling,
              'height': e4 / scaling,
              'bottom': 0,
              'right': 0
            });

          }
        }
        function newF1(roomType) {
          var form = $(".room-inputs[data-room-type='" + roomType + "']");
          var formInputs = form.find('.dialog-input');
          var inputsCount = formInputs.lenght;

          var e1Ft = form.find('.e1-ft');
          var e1Inch = form.find('.e1-inch');
          var e2Ft = form.find('.e2-ft');
          var e2Inch = form.find('.e2-inch');

          var s1Ft = form.find('.s1-ft');
          var s1Inch = form.find('.s1-inch');
          var s2Ft = form.find('.s2-ft');
          var s2Inch = form.find('.s2-inch');
          var s3Ft = form.find('.s3-ft');
          var s3Inch = form.find('.s3-inch');
          var s4Ft = form.find('.s4-ft');
          var s4Inch = form.find('.s4-inch');

          var w1Ft = form.find('.w1-ft');
          var w1Inch = form.find('.w1-inch');
          var w2Ft = form.find('.w2-ft');
          var w2Inch = form.find('.w2-inch');
          var w3Ft = form.find('.w3-ft');
          var w3Inch = form.find('.w3-inch');

          var nFt = form.find('.n-ft');
          var nInch = form.find('.n-inch');

          var n = toInches( nFt.val(), nInch.val() );

          var e1 = toInches( e1Ft.val(), e1Inch.val() );
          var e2 = toInches( e2Ft.val(), e2Inch.val() );

          var s1 = toInches( s1Ft.val(), s1Inch.val() );
          var s2 = toInches( s2Ft.val(), s2Inch.val() );
          var s3 = toInches( s3Ft.val(), s3Inch.val() );
          var s4 = toInches( s4Ft.val(), s4Inch.val() );

          var w1 = toInches( w1Ft.val(), w1Inch.val() );
          var w2 = toInches( w2Ft.val(), w2Inch.val() );
          var w3 = toInches( w3Ft.val(), w3Inch.val() );

          var roomWidth = n;
          var roomHeight = e1;

          var fullroomWidth = toFoolMeasure(roomWidth);
          var fullroomHeight = toFoolMeasure(roomHeight);
          var roomWidthFt = fullroomWidth.ft;
          var roomWidthinch = fullroomWidth.inch;
          var roomHeightFt = fullroomHeight.ft;
          var roomHeightInch = fullroomHeight.inch;

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( roomWidthFt, roomWidthinch, roomHeightFt, roomHeightInch );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          resetElemInArea();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n === s1 + s2 + s3 + s4) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, s3Ft, s3Inch, s4Ft, s4Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2+S3+S4');
            }
            if ( !(e1 === w1 + w2) ) {
              invalidInputs.push(e1Ft, e1Inch, w1Ft, w1Inch, w2Ft, w2Inch);
              errorMessages.push('E1 have to be equal W1+W2');
            }
            if ( !(e1 > w3) ) {
              invalidInputs.push(e1Ft, e1Inch, w3Ft, w3Inch);
              errorMessages.push('E1 have to be greater than W3');
            }
            if ( !(e1 > e2) ) {
              invalidInputs.push(e1Ft, e1Inch, e2Ft, e2Inch);
              errorMessages.push('E1 have to be greater than E2');
            }
            if ( !(e2 === w3) ) {
              invalidInputs.push(e2Ft, e2Inch, w3Ft, w3Inch);
              errorMessages.push('E2 have to be equal W3');
            }

            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-right');
            $("div[data-hole-id='1']").css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              'bottom': 0,
              'left': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-top hole-border-left hole-border-right');
            $("div[data-hole-id='2']").css({
              'width': s3 / scaling,
              'height': w3 / scaling,
              'bottom': 0,
              'right': s4 / scaling
            });

          }
        }




        // common function

        function toInches(ft, inch) { return ( +ft * 12 ) + +inch; }

        function toFoolMeasure(totalInch) {
          ft = Math.floor(totalInch / 12);
          inch = totalInch % 12;
          return { ft: ft, inch: inch };
        }

        function isNumber(number) { return !isNaN(parseFloat(number)) && isFinite(number) && number >= 0; }

        function getSum(ft, inch) {
          var totalFt = 0;
          var totalInch = 0;
          for(var i = 0, length = ft.length; i < length; i++) {
            totalFt += +ft[i];
          }
          for(var i = 0, length = inch.length; i < length; i++) {
            totalInch += +inch[i];
          }
          if (totalInch >= 12) {
            var addToFt = Math.floor(totalInch / 12);
            totalFt += addToFt;
            totalInch = totalInch % 12;
          }
          return { ft: totalFt, inch: totalInch };
        }

        function validateNumbersInForm(inputs, count) {
          var validInputs = 0;
          inputs.each(function(index) {
            if ( !isNumber( $(this).val() ) ) {
              $(this).css('border-color', '#A94442');
            } else {
              $(this).css('border-color', '#ccc');
              validInputs++;
            }
          });

          if (validInputs < count) {
            return false;
          } else {
            return true;
          }
        }

        function renderFormErrors(validation, inputs) {
          var invalidInputs = validation.invalidInputs;
          var errorMessages = validation.errorMessages;
          $(inputs).css('border-color', '#ccc');
          $('#dialog-form-errors').empty();
          if (invalidInputs.length > 0) {
            $(invalidInputs).each(function() {
              $(this).css('border-color', '#A94442');
            });
            $(errorMessages).each(function() {
              $('#dialog-form-errors').append("<center><p><b>" + this + "</b></p></center");
            })
            return false;
          } else {
            return true;
          }
        }

        function validateNewRoomDimensions(width, height, inputs) {
          var invalidInputs = [];
          var errorMessages = [];
          var newEditorContainerWidth = width;
          var newEditorContainerHeight = height;
          var haveErrors = false;

          // validate width and heigh of room
          $('.' + elementsClass).each(function() {
            var newItemWidth = $(this).data('width');
            var newItemHeight = $(this).data('height');

            if(newItemWidth > newEditorContainerWidth || newItemHeight > newEditorContainerHeight) {
              haveErrors = true;
            }
          });
          if (haveErrors) {
            invalidInputs = inputs;
            errorMessages.push('New room dimensions are not enough for all the furniture included. Please, enlarge them');
          }
          return { invalidInputs: invalidInputs, errorMessages: errorMessages };
        }

        function setNewDimensionsToArea(width, height) {
          $('.editor-container').attr('data-width', width);
          $('.editor-container').attr('data-height', height);
        }

        function scaleAreaHeight(scaling) {
          $('.editor-container').height(+$('.editor-container').attr('data-height') / scaling)
        }

        function scaleEditorHeightLine() {
          $('.editor-height').height(+$('.editor-container').height() + 15);
          $('.editor-height img').height(+$('.editor-container').height() + 15);
        }

        function scaleItems(scaling) {
            $('.' + elementsClass).each(function() {
              // $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scaling);
              // $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scaling);

              $(this).css({
                'width': $(this).data('width') / scaling,
                'height': $(this).data('height') / scaling
              });

              $(this).parent().css({
                'width': $(this).data('width') / scaling,
                'height': $(this).data('height') / scaling
              });
            });
        }

        function updateMeasureDescription(widthFt, widthInch, heightFt, heightInch) {
            $('span#measure-width-ft').html(widthFt);
            $('span#measure-width-inch').html(widthInch);
            $('span#measure-height-ft').html(heightFt);
            $('span#measure-height-inch').html(heightInch);
        }

        function resetItemsInPanel() {
          $('.items-panel-elem').each(function() {
            $(this).attr('data-x', '0');
            $(this).attr('data-y', '0');

            $(this).css({
              '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
                 '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
                  '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                      'transform': 'translate(0px, 0px) rotate(0deg)',
            });

            $(this).show();
          });
        }

        function resetElemInArea(){
          console.log('zzzz');
          $('.draggable').each(function() {
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
      });

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

        $('.qtip').hide();
        var elemInPanel = $('.items-panel-elem[data-id="' + elemId + '"]')
        controller.initItemsPanelArea( elemInPanel );

      });
    }

    /**
     * Init items panel area
     */
    Controller.prototype.initItemsPanelArea = function(elem) {
      var controller = this;
      // show items panel
      $('.editor-items-panel').show();
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
            restriction: ".dragg",
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
        var newPositionX = +$(item).offset().left - +$('.editor-container').offset().left;
        var newPositionY = +$(item).offset().top - +$('.editor-container').offset().top;

        $(item).hide();

        // show real item
        var realItem = $('#' + itemId);
        realItem.show();

        // restrict position
        if ( newPositionX + +realItem.width() >= +$('.editor-container').width() ) {
          var diffX = ( newPositionX + +realItem.width() - +$('.editor-container').width() ) + 3;
          newPositionX -= diffX;
        }

        if ( newPositionY + +realItem.height() >= +$('.editor-container').height() ) {
          var diffY = ( newPositionY + +realItem.height() - +$('.editor-container').height() ) + 3;
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

        if ( $('.editor-items-panel').height() <= 1 ){
          $('.editor-items-panel').hide();
        }

        if ( controller.restrictAreaHoles(realItem) ) {
          console.log('daaa');
          realItem.hide();
          $('.qtip').hide();
          controller.initItemsPanelArea( $(item) );
        }

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

      $('.draggable2').each(function() {
        $(this).qtip({
          content: {
            text: $('#panel-elem-tooltip-' + $(this).attr('data-id')).clone(),
            title: ' ',
            button: true
          },
          position: {
            my: 'right top',
            at: 'left center',
            target: $(this)
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

    Controller.prototype.adaptArea = function(elementsClass) {
      var controller = this;

      $(window).resize(function(){
        scaleArea();
      });

      function scaleArea(){
        var documentWidth = $(window).width();
        $('.room-editor-container').width(documentWidth * 0.35);
        var old_ec_width = $('.editor-container').width();
        $('.editor-container').width(documentWidth * 0.35);
        var new_ec_width = $('.editor-container').width(),
            ec_delta = new_ec_width/old_ec_width;
        // set container height according width
        var scaling = parseFloat(controller.$holder.data('width')) / controller.$holder.width();
        $('.editor-container').height($('.editor-container').data('height') / scaling);
        // change editor height line
        $('.editor-height').height(+$('.editor-container').height() + 15);
        $('.editor-height img').height(+$('.editor-container').height() + 15);
        // change editor width line
        $('.editor-width').width($('.editor-container').width());
        $('.editor-width img').width($('.editor-container').width());
        $('.dragg').width( $('.editor-container').css('width') );
        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {
            var dwidth = $(this).data('width') / scaling,
                dheight = $(this).data('height') / scaling,
                dataX = $(this).attr('data-x') * ec_delta,
                dataY = $(this).attr('data-y') * ec_delta,
                SdataX = dataX + 'px',
                SdataY = dataY + 'px',
                rotation = +controller.getDegreeOfElement( $(this).parent() ).degree,
                Srotation = rotation + 'deg';

            $(this).attr({
              'data-x': dataX,
              'data-y': dataY
            });

            $(this).parent().attr({
              'data-x': dataX,
              'data-y': dataY
            }).css({
              'width': dwidth,
              'height': dheight,
              '-webkit-transform': 'translate(' + SdataX + ',' + SdataY + ') rotate(' + Srotation +')',
              '-moz-transform': 'translate(' + SdataX + ',' + SdataY + ') rotate(' + Srotation +')',
              '-ms-transform': 'translate(' + SdataX + ',' + SdataY + ') rotate(' + Srotation +')',
              'transform': 'translate(' + SdataX + ',' + SdataY + ') rotate(' + Srotation +')'
            });
            $(this).width( dwidth );
            $(this).height( dheight );

            $(this).parent().width( dwidth );
            $(this).parent().height( dheight );

            $(this).parent().children('.rotation-arrow').css('top', $(this).height() + 5 + 'px');
        });
      }
    }

    Controller.prototype.restrictAreaHoles = function(elem) {
      var controller = this;
      var elemPoints = defineElemPoints(elem);
      var holesPoligons = defineHoles( $('.hole') );
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

      function defineHoles(holesClass) {
        var holes = [];
        $(holesClass).each(function() {
          var top = +$(this).offset().top;
          var left = +$(this).offset().left;
          var width = +$(this).width();
          var height = +$(this).height();

          var leftTop = [top, left]
          var rightTop = [top, left + width]
          var rightBottom = [top + height, left + width]
          var leftBottom = [top + height, left]

          var hole = [leftTop, rightTop, rightBottom, leftBottom];
          holes.push(hole);
        });
        return holes;
      }

      function defineRoomArea() {
        var top = +$('.dragg').offset().top;
        var left = +$('.dragg').offset().left;
        var width = +$('.dragg').width();
        var height = +$('.dragg').height();

        var leftTop = [top, left]
        var rightTop = [top, left + width]
        var rightBottom = [top + height, left + width]
        var leftBottom = [top + height, left]

        var roomArea = [leftTop, rightTop, rightBottom, leftBottom];
        return roomArea;
      }

      function checkOutside(points, holes, areaPoints, elem) {
        var wrongPosition = [];
        // console.log(holes);
        // check elem point in holes
        $.each(points, function(index, point) {
          $.each(holes, function(index, hole) {
            wrongPosition.push( controller.checkInsidePoligon(point, hole) );
          });
        });
        //check holes point in elem
        $.each(holes, function(index, hole) {
          $.each(hole, function(index, holePoint) {
            wrongPosition.push( controller.checkInsidePoligon(holePoint, points) );
          });
        });
        $.each(points, function(index, point) {
          wrongPosition.push( !controller.checkInsidePoligon(point, areaPoints) );
        });
        if (wrongPosition.indexOf(true) != -1) {
          // $(elem).addClass('out-of-area');
          return true;
        } else {
          // $(elem).removeClass('out-of-area');
          return false;
        }

        // console.log( inside([ 1.5, 1.5 ], polygon) );
      }

      return checkOutside(elemPoints, holesPoligons, roomAreaPoints, elem);
    }

    Controller.prototype.moveInsideArea = function(event) {
      var controller = this;
      if ( controller.restrictAreaHoles(event.target) ) {
        $(event.target).parent().css('visibility', 'hidden');
        var coX = 1;
        var coY = 1;
        if( Math.abs(event.dx) === 0 || Math.abs(event.dy) === 0 ) {
          if ( Math.abs(event.dx) === 0 ) {
            coX = 0;
          } else if ( Math.abs(event.dy) === 0 ) {
            coY = 0;
          }
        } else if ( Math.abs(event.dx) > 1 && Math.abs(event.dy) > 1 ) {
          if ( Math.abs(event.dx) > Math.abs(event.dy) ) {
            coX = Math.abs(event.dx) / Math.abs(event.dy);
          } else {
            coY = Math.abs(event.dy) / Math.abs(event.dx);
          }
        }

        var positionBefore = controller.getDegreeOfElement( $(event.target).parent() );
        var top = positionBefore.top;
        var left = positionBefore.left;
        var degree = positionBefore.degree;

        while ( controller.restrictAreaHoles(event.target) ) {
          top -= ( event.dy / Math.abs(event.dy) ) * coY;
          left -= ( event.dx / Math.abs(event.dx) ) * coX;

          // console.log(top, left, coX, coY);

          // $(event.target).parent().offset({
          //   top: top,
          //   left: left
          // });

          if ( !isNaN(top) && !isNaN(left) ) {
            $(event.target).parent().css({
              '-webkit-transform': 'translate(' + left + 'px,' + top + 'px) rotate(' + degree +'deg)',
              '-moz-transform': 'translate(' + left + 'px,' + top + 'px) rotate(' + degree +'deg)',
              '-ms-transform': 'translate(' + left + 'px,' + top + 'px) rotate(' + degree +'deg)',
              'transform': 'translate(' + left + 'px,' + top + 'px) rotate(' + degree +'deg)',
            });
            $(event.target).parent().attr('data-x', left);
            $(event.target).parent().attr('data-y', top);
            $(event.target).attr('data-x', left);
            $(event.target).attr('data-y', top);
          } else {
            console.log('break');
            break;
          }
        }

        $(event.target).parent().css('visibility', 'visible');
      }
    }

    Controller.prototype.rotateInsideArea = function(positionBefore, elem) {
      var controller = this;
      var beforeDegree = positionBefore.degree;
      var beforetTop = positionBefore.top;
      var beforeLeft = positionBefore.left;

      var afterDegree = controller.getDegreeOfElement(elem.parent()).degree

      while ( controller.restrictAreaHoles(elem) ) {
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
    }

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

    }

    Controller.prototype.redrawImage = function() {
      StoreImageLocally = function(id, zis) {
        var cellId, dataImage, imgData;
        imgData = getBase64Image(zis);
        cellId = 'imgData' + id;
        localStorage.setItem(cellId, imgData);
        dataImage = localStorage.getItem(cellId);
        zis.src = 'data:image/png;base64, ' + dataImage;
      };

      getBase64Image = function(img) {
        var canvas, ctx, dataURL, i_height, i_width;
        canvas = document.createElement('canvas');
        i_width = img.offsetWidth;
        i_height = img.offsetHeight;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, i_width, i_height);
        dataURL = canvas.toDataURL('image/png');
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
      };

      printToFile = function() {
        var c_height, c_width, div;
        div = $('.room-editor-container');
        c_width = div.width() + 100;
        c_height = div.height();
        html2canvas(div, {
          onrendered: function(canvas) {
            var myImage;
            myImage = canvas.toDataURL('image/png');
            downloadURI(myImage, 'FurniturePlan.png');
          },
          background: '#fff',
          width: c_width,
          height: c_height
        });
      };

      downloadURI = function(uri, name) {
        var link;
        link = document.getElementById('save-as-image-link');
        link.download = name;
        link.href = uri;
        if (uri) {
          link.click();
        }
      };

      window.onload = function() {


        $('#save-as-image').on('click', function() {
          console.log('#save-as-image');
          var imgs;
          imgs = $('.draggable').find('.item-image:visible');
          imgs.each(function(index) {
            StoreImageLocally(index, $(this)[0]);
          });
          printToFile();
        });
      };
    }

    /**
     * Init all Class methods
     *
     */
    Controller.prototype.init = function() {
        this.initElements(this.$initialElenemts);
        //this.addElement();
        this.catchElement();
        this.rotateElement();
        //this.managePosition();
        //this.manageHolderScaling();
        //this.manageCats();
        this.initMouseRotation();
        this.openDimensionsForm(this.$initialElenemts);
        this.setNewArea(this.$initialElenemts);
        this.adaptArea(this.$initialElenemts);
        this.removeElement();
        this.redrawImage();
    };
    $(document).ready(function() {

        var controller = new Controller(),
            $presetSelector = $('.preset'),
            $button = $('.save-preset');

        controller.init();

        $('.editor-container-wr').arrive(".editor-container", function() {
          controller = new Controller(),
            $presetSelector = $('.preset'),
            $button = $('.save-preset');
          controller.initElements(controller.$initialElenemts);
          controller.catchElement();
          controller.rotateElement();
          controller.initMouseRotation();
          controller.removeElement();
          controller.redrawImage();
          console.log('arrive');
        });

        $presetSelector.on('change', function() {
            this.attr('value', $(this).find('option:selected').val());
        });

        $button.on('click', function() {
          var data = {
            products: {}
          };

          $(".draggable").each(function() {
            var elemId = $(this).attr('id');

            coX = +$('.editor-container').width() / +controller.getDegreeOfElement( $(this).parent() ).left;
            coY = +$('.editor-container').height() / +controller.getDegreeOfElement( $(this).parent() ).top;

            var posX = +$('.editor-container').attr('data-width') / coX;
            var posY = +$('.editor-container').attr('data-height') / coY;
            var rotation = +controller.getDegreeOfElement( $(this).parent() ).degree;
            console.log(rotation);

            data.products[elemId] = {
              posX: posX,
              posY: posY,
              rotation: rotation
            }
          });
          console.log(data);

          $.ajax({
              url: "/room_editor/save",
              type: "POST",
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
        });
    });

})(jQuery);
