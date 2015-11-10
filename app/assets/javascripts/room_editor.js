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
        $('.room-editor-container').width(documentWidth * 0.6);
        $('.editor-container').width(documentWidth * 0.6);

        $('.dragg').width( $('.editor-container').css('width') );

        // set container height according width
        var scaling = parseFloat(this.$holder.data('width')) / this.$holder.width();
        $('.editor-container').height($('.editor-container').data('height') / scaling);
        // change editor height line
        $('.editor-height').height($('.editor-container').height());
        $('.editor-height img').height($('.editor-container').height());

        // init draggable
        interact('.' + elementsClass).draggable({
          // enable inertial throwing
          inertia: false,
          // keep the element within the area of it's parent
          restrict: {
              restriction: '.dragg',
              endOnly: true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },

          // call this function on every dragmove event
          onmove: function(event) {
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
            var createRect = function($element) {
              return new SAT.Box(
                new SAT.Vector(parseFloat($element.parent().attr('data-x')), parseFloat($element.parent().attr('data-y'))),
                $element.parent().width(),
                $element.parent().height()
              ).toPolygon().setAngle(parseInt($element.attr('data-rotation')) * Math.PI/180.0);
            },

            $elements = $('.editor-container div').not('.active'),
            activeRect = createRect($(event.target));

            $elements.removeClass('collision');

            $elements.each(function() {
              if(SAT.testPolygonPolygon(createRect($(this)), activeRect)) {
                $(this).addClass('collision');
              }
            });

            controller.restrictAreaHoles(event.target);
          }
        });

        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {
          //$(this).attr('data-x', parseFloat($(this).data('x'))/scalingX || $(this).width()/2.0);
          //$(this).attr('data-y', parseFloat($(this).data('y'))/scalingY || $(this).height()/2.0);

          $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scaling || $(this).width()/2.0);
          $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scaling || $(this).height()/2.0);

          $(this).parent().css({
              'width': $(this).data('width') / scaling,
              'height': $(this).data('heigh') / scaling,
              // 'width': $(this).data('width'),
              // 'height': $(this).data('heigh'),
              '-webkit-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              '-moz-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              '-ms-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
              'transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
          });

          // replase item to top and left if room is too small
          if( +$(this).data('x') + +$(this).data('width') > +$('.editor-container').data('width') || +$(this).data('y') + +$(this).data('height') > +$('.editor-container').data('height') ) {

            $(this).parent().css({
              '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
              '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
              '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
              'transform': 'translate(0px, 0px) rotate(0deg)',
            });

            $(this).parent().attr('data-rotation', '0');
            $(this).parent().attr('data-x', '0');
            $(this).parent().attr('data-y', '0');
            $(this).attr('data-rotation', '0');
            $(this).attr('data-x', '0');
            $(this).attr('data-y', '0');
          }

        });

        $('[data-toggle="tooltip"]').tooltip();

        this.$holder.find('div')
          .on('mouseover', function() {
            $("#product_" + $(this).attr('id')).addClass('active-product');
          })
          .on('mouseout', function() {
            if (!( $(this).hasClass( "active" ) ) ) {
              $("#product_" + $(this).attr('id')).removeClass('active-product');
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
                $("#product_" + $(this).attr('id')).addClass('active-product');

                self.$currentElement = $(this);
                self.$rotationPanel.val((parseInt($(this).attr('data-rotation')) || 0));
                self.$positionPanelX.val((parseFloat($(this).attr('data-x')) || 0));
                self.$positionPanelY.val((parseFloat($(this).attr('data-y')) || 0));

                $('.rotation-arrow').hide();

                $(this).parent().find('.rotation-arrow').show();
            });

        $(document).click(function() {
            if(mouse_is_outside) {
                div_elem.removeClass('active');
                arrow_elem.hide();
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

        function rotateOnMouse(e) {
            var offset = controller.$currentElement.offset();
            console.log(offset);
            var center_x = offset.left;
            var center_y = offset.top;
            var mouse_x = e.pageX;
            var mouse_y = e.pageY;
            var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
            var degree = (radians * (180 / Math.PI) * -1) + 60;
            console.log(degree);
            var offsetX = parseFloat(controller.$currentElement.parent().attr('data-x')),
                offsetY = parseFloat(controller.$currentElement.parent().attr('data-y'));

            controller.$currentElement.parent().css('-moz-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            controller.$currentElement.parent().css('-webkit-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            controller.$currentElement.parent().css('-o-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');
            controller.$currentElement.parent().css('-ms-transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + degree + 'deg)');

            controller.$currentElement.attr('data-rotation', degree);
        }

        $('.rotation-arrow').mousedown(function(e) {
            e.preventDefault(); // prevents the dragging of the image.
            $(document).bind('mousemove.rotateImg', function(e2) {
                rotateOnMouse(e2);
            });
        });

        $(document).mouseup(function(e) {
            $(document).unbind('mousemove.rotateImg');
        });
    };

    /**
     * Open Dimensions Form
     */
    Controller.prototype.openDimensionsForm = function(elementsClass) {
      var setDimensionsButton = $('#set-dimensions');
      var dimensionsDialog = $('div#dimensions-dialog');
      var roomsOnSlide = 9;

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
            if (currentSlideDataID >= 0 && currentSlideDataID <= 26) {
              newSlideDataID = currentSlideDataID + 4;
            } else {
              newSlideDataID = 3 - (30 - currentSlideDataID);
            }
            var newSlide = $('#room-slider .slide[data-room-id="' + newSlideDataID + '"]');
            console.log(newSlide);
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
            } else if (toSlide > 30) {
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

        var roomId = +$('.active-room-inputs input[name="room-id"]').val();
        switch (roomId) {
          case 0:
            newRect0();
            break;
          case 1:
            newL0();
            break;
          case 2:
            newL1();
            break;
          case 3:
            newL2();
            break;
          case 4:
            newL3();
            break;
          case 5:
            newT0();
            break;
          case 6:
            newT1();
            break;
          case 7:
            newT2();
            break;
          case 8:
            newT3();
            break;
          case 9:
            newC0();
            break;
          case 10:
            newC1();
            break;
          case 11:
            newC2();
            break;
          case 12:
            newC3();
            break;
        }

        function newRect0() {
          var rect0Form = $(".room-inputs[data-room-id='0']");
          var rect0Inputs = rect0Form.find('.dialog-input');
          var inputsCount = 4;
          var newWidthFt = +rect0Form.find('.n-s-ft').val();
          var newWidthInch = +rect0Form.find('.n-s-inch').val();
          var newHeightFt = +rect0Form.find('.e-w-ft').val();
          var newHeightInch = +rect0Form.find('.e-w-inch').val();

          var newWidth = ( newWidthFt * 12 ) + newWidthInch;
          var newHeight = ( newHeightFt * 12 ) + newHeightInch;

          var scaling = newWidth / +$('.editor-container').width();
          console.log(scaling)

          if ( !validateNumbersInForm(rect0Inputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(scaling), rect0Inputs ) ) { return; }

          setNewDimensionsToArea(newWidth, newHeight);

          scaleAreaHeight(scaling);

          scaleEditorHeightLine();

          updateMeasureDescription(newWidthFt, newWidthInch, newHeightFt, newHeightInch);

          scaleItems(scaling);

          resetItemsInPanel();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateNewRoomDimensions(scaling) {
            var newEditorContainerWidth =  +$('.editor-container').data('width');
            var newEditorContainerHeight =  +$('.editor-container').data('height');
            var invalidItemWidth = 0;
            var invalidItemHeight = 0;

            // validate width and heigh of room
            $('.' + elementsClass).each(function() {
              var newItemWidth = $(this).data('width');
              var newItemHeight = $(this).data('height');

              if(newItemWidth > newEditorContainerWidth) {
                invalidItemWidth++;
              }
              if (newItemHeight > newEditorContainerHeight) {
                invalidItemHeight++;
              }
            });

            return { invalidItemWidth: invalidItemWidth, invalidItemHeight: invalidItemHeight };
          }

          function renderFormErrors(errors) {
            console.log(errors);
            var invalidItemWidth = errors.invalidItemWidth;
            var invalidItemHeight = errors.invalidItemHeight;

            if (invalidItemWidth > 0 || invalidItemHeight > 0) {
              if (invalidItemWidth > 0 && invalidItemHeight === 0) {
                $('#dialog-form-errors').html("<center><p><b>New room width is too small for the furniture included. Please enlarge it.</b></p></center");
                $('.dialog-input-width').each(function(index) {
                    $(this).css('border-color', '#A94442');
                });
                $('.dialog-input-height').each(function(index) {
                    $(this).css('border-color', '#ccc');
                });

              } else if (invalidItemWidth === 0 && invalidItemHeight > 0) {
                $('#dialog-form-errors').html("<center><p><b>New room depth is too small for the furniture included. Please enlarge it.</b></p></center>");
                $('.dialog-input-width').each(function(index) {
                    $(this).css('border-color', '#ccc');
                });
                $('.dialog-input-height').each(function(index) {
                    $(this).css('border-color', '#A94442');
                });

              } else if (invalidItemWidth > 0 && invalidItemHeight > 0) {
                $('#dialog-form-errors').html("<center><p><b>New room dimensions are not enough for all the furniture included. Please, enlarge them both.</b></p></center");
                $('.dialog-input').each(function(index) {
                    $(this).css('border-color', '#A94442');
                });
              }
              return false;
            } else {
              return true;
            }
          }
        }
        function newL0() {
          var form = $(".room-inputs[data-room-id='1']");
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

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(s === n1 + n2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, sFt, sInch);
              errorMessages.push('S have to be equal N1+N2');
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
              'width': n2 / scaling,
              'height': e1 / scaling,
              'border-bottom': '1px solid black',
              'border-left': '1px solid black',
              'top': 0,
              'right': 0
            })
          }
        }
        function newL1() {
          var form = $(".room-inputs[data-room-id='2']");
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

           if ( !renderFormErrors( validateNewRoomDimensions(s, w, formInputs), formInputs ) ) { return; }

          var scaling = n / +$('.editor-container').width();

          setNewDimensionsToArea(n, w);

          scaleAreaHeight(scaling);

          addHoles();

          updateMeasureDescription( nFt.val(), nInch.val(), wFt.val(), wInch.val() );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newL2() {
          var form = $(".room-inputs[data-room-id='3']");
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

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n === s1 + s2) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2');
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
              'width': s1 / scaling,
              'height': w2 / scaling,
              'border-top': '1px solid black',
              'border-right': '1px solid black',
              'bottom': 0,
              'left': 0
            })
          }
        }
        function newL3() {
          var form = $(".room-inputs[data-room-id='4']");
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
        function newT0() {
          var form = $(".room-inputs[data-room-id='5']");
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

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');


          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(w1 + w2 === e1 + e2) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, e1Ft, e1Inch, e2Ft, e2Inch);
              errorMessages.push('W1+W2 have to be equal E1+E2');
            }
            if ( !(n === s1 + s2 + s3) ) {
              invalidInputs.push(s1Ft, s1Inch, s2Ft, s2Inch, s3Ft, s3Inch, nFt, nInch);
              errorMessages.push('N have to be equal S1+S2+S3');
            }
            return { invalidInputs: invalidInputs, errorMessages: errorMessages };
          }

          function addHoles() {
            $('.dragg').append("<div class='hole' data-hole-id='1'></div>");
            $('.dragg').append("<div class='hole' data-hole-id='2'></div>");

            $("div[data-hole-id='1']").addClass('hole-border-top hole-border-left');
            $("div[data-hole-id='1']").css({
              'width': s3 / scaling,
              'height': e2 / scaling,
              'bottom': 0,
              'right': 0
            });

            $("div[data-hole-id='2']").addClass('hole-border-top hole-border-right')
            $("div[data-hole-id='2']").css({
              'width': s1 / scaling,
              'height': w2 / scaling,
              'bottom': 0,
              'left': 0
            })
          }
        }
        function newT1() {
          var form = $(".room-inputs[data-room-id='6']");
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

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

          controller.initItemsPanelArea();

          dimensionsDialog.dialog('close');

          function validateShape() {
            var invalidInputs = [];
            var errorMessages = [];
            if ( !(n1 + n2 === s1 + s2) ) {
              invalidInputs.push(n1Ft, n1Inch, n2Ft, n2Inch, s1Ft, s1Inch, s2Ft, s2Inch);
              errorMessages.push('N1+N2 have to be equal S1+S2');
            }
            if ( !(e === w1 + w2 + w3) ) {
              invalidInputs.push(w1Ft, w1Inch, w2Ft, w2Inch, w3Ft, w3Inch, eFt, eInch);
              errorMessages.push('E have to be equal W1+W2+W3');
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

            $("div[data-hole-id='2']").addClass('hole-border-top hole-border-right');
            $("div[data-hole-id='2']").css({
              'width': s1 / scaling,
              'height': w3 / scaling,
              'bottom': 0,
              'left': 0
            });
          }
        }
        function newT2() {
          var form = $(".room-inputs[data-room-id='7']");
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

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newT3() {
          var form = $(".room-inputs[data-room-id='8']");
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

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          var scaling = roomWidth / +$('.editor-container').width();

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newC0() {
          var form = $(".room-inputs[data-room-id='9']");
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

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newC1() {
          var form = $(".room-inputs[data-room-id='10']");
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

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newC2() {
          var form = $(".room-inputs[data-room-id='11']");
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

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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
        function newC3() {
          var form = $(".room-inputs[data-room-id='12']");
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

          var scaling = roomWidth / +$('.editor-container').width();

          if ( !validateNumbersInForm(formInputs, inputsCount) ) { return; }

          if ( !renderFormErrors( validateShape(), formInputs ) ) { return; }

          if ( !renderFormErrors( validateNewRoomDimensions(roomWidth, roomHeight, formInputs), formInputs ) ) { return; }

          setNewDimensionsToArea(roomWidth, roomHeight);

          scaleAreaHeight(scaling);

          addHoles();

          // updateMeasureDescription( );

          scaleEditorHeightLine();

          scaleItems(scaling);

          resetItemsInPanel();

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





        // common function

        function toInches(ft, inch) { return ( +ft * 12 ) + +inch; }

        function isNumber(number) { return !isNaN(parseFloat(number)) && isFinite(number) && number >= 0; }

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
          $('.editor-height').height($('.editor-container').height());
          $('.editor-height img').height($('.editor-container').height());
        }

        function scaleItems(scaling) {
            $('.' + elementsClass).each(function() {
              $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scaling);
              $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scaling);

              $(this).parent().css({
                'width': $(this).data('width') / scaling,
                'height': $(this).data('heigh') / scaling,
                '-webkit-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                '-moz-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                '-ms-transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                'transform': 'translate(' + parseFloat($(this).data('x'))/scaling + 'px,' + $(this).data('y')/scaling + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
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

      });


    };

    /**
     * Init items panel area
     */
    Controller.prototype.initItemsPanelArea = function() {
      var controller = this;
      // show items panel
      $('.editor-items-panel').show();

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
          console.log(diffY);
          console.log(newPositionY);
          console.log(+realItem.height());
          console.log(+$('.editor-container').height());
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


        if ( $('.editor-items-panel').height() == 0 ){
          $('.editor-items-panel').hide();
        }

        controller.restrictAreaHoles(realItem);

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

      // console.log($('.editor-container').offset());

      $('.items-panel-elem').each(function(){
        console.log(+$('.editor-container').offset().top - +$(this).offset().top);
        console.log(+$('.editor-container').offset().left - +$(this).offset().left);
      });

    };

    Controller.prototype.adaptArea = function(elementsClass) {
      var controller = this;
      $(window).resize(function(){
          var documentWidth = $(window).width();
          $('.room-editor-container').width(documentWidth * 0.6);
          $('.editor-container').width(documentWidth * 0.6);

          // set container height according width
          var scaling = parseFloat(controller.$holder.data('width')) / controller.$holder.width();
          $('.editor-container').height($('.editor-container').data('height') / scaling);

          // change editor height line
          $('.editor-height').height($('.editor-container').height());
          $('.editor-height img').height($('.editor-container').height());


          // target elements with the "draggable" class
          $('.' + elementsClass).each(function() {

              var parentDataX = +$(this).parent().data('x')/scaling;
              var parentDataY = +$(this).parent().data('y')/scaling;
              var dataX = +$(this).data('x')/scaling;
              var dataY = +$(this).data('y')/scaling;

              $(this).attr('data-x', parentDataX);
              $(this).attr('data-y', parentDataY);
              $(this).parent().attr('data-x', parentDataX);
              $(this).parent().attr('data-y', parentDataY);

              $(this).parent().css({
                  'width': $(this).data('width') / scaling,
                  'height': $(this).data('heigh') / scaling,
                  '-webkit-transform': 'translate(' + parseFloat($(this).attr('data-x')) + 'px,' + $(this).attr('data-y') + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                  '-moz-transform': 'translate(' + parseFloat($(this).attr('data-x')) + 'px,' + $(this).attr('data-y') + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                  '-ms-transform': 'translate(' + parseFloat($(this).attr('data-x')) + 'px,' + $(this).attr('data-y') + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                  'transform': 'translate(' + parseFloat($(this).attr('data-x')) + 'px,' + $(this).attr('data-y') + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
              });


              $(this).parent().children('.rotation-arrow').css('top', $(this).height() + 5 + 'px')
           });
        });
    }

    Controller.prototype.restrictAreaHoles = function(elem) {
      var elemPoints = defineElemPoints(elem);
      var holesPoligons = defineHoles( $('.hole') );

      restrictHoles(elemPoints, holesPoligons, elem);

      function defineElemPoints(elem) {
        var elemTop = +$(elem).offset().top;
        var elemLeft = +$(elem).offset().left;
        var elemWidth = +$(elem).width();
        var elemHeight = +$(elem).height();

        var elemTopLeft = [elemTop, elemLeft];
        var elemTopRight = [elemTop, elemLeft + elemWidth];
        var elemBottomLeft = [elemTop + elemHeight, elemLeft];
        var elemBottomRight = [elemTop + elemHeight, elemLeft + elemWidth];

        var elemPoints = [elemTopLeft, elemTopRight, elemBottomLeft, elemBottomRight];

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


      function restrictHoles(points, holes, elem) {
        var inHole = [];
        console.log(points);
        console.log(holes);
        $.each(points, function(index, point) {
          $.each(holes, function(index, hole) {
            inHole.push( checkInsideHole(point, hole) );
          });
        });
        if (inHole.indexOf(true) != -1) {
          console.log('out');
          $(elem).addClass('out-of-area');
        } else {
          console.log('in');
          $(elem).removeClass('out-of-area');
        }

        // console.log( inside([ 1.5, 1.5 ], polygon) );
      }

      function checkInsideHole(point, vs) {
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
        // this.adaptArea(this.$initialElenemts);
    };

    $(document).ready(function() {
        // console.log($('.dragg').offset().top)
        // console.log($('.dragg').offset().left)

        var controller = new Controller(),
            $presetSelector = $('.preset'),
            $button = $('.save-preset');

        controller.init();

        $presetSelector.on('change', function() {
            this.attr('value', $(this).find('option:selected').val());
        });

        $button.on('click', function() {
            var positions = {};
            var scaling = parseFloat( $('.editor-container').data('width')) /  $('.editor-container').width();

            controller.$holder.find('div').each(function() {
                var data = {
                    'posX': parseInt($(this).parent().attr('data-x') * scaling),
                    'posY': parseInt($(this).parent().attr('data-y') * scaling),
                    'rotation': parseInt($(this).attr('data-rotation'))
                };
                positions[$(this).attr('id')] = data;
            });

            $.ajax({
                url: "/room_editor/save", // Route to the Script Controller method
                type: "POST",
                data: { position: positions }, // This goes to Controller in params hash, i.e. params[:file_name]
                success: function(response) {
                    console.log(response);
                }
            });
        });

        // this is used later in the resizing demo
        //window.dragMoveListener = dragMoveListener;

    });

})(jQuery);
