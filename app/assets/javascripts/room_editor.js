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

        this.$options = {
            // enable inertial throwing
            inertia: true,
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
                    //return new SAT.Polygon(new SAT.Vector($element.attr('data-x'), $element.attr('data-y')), [
                    //    new SAT.Vector(parseFloat($element.attr('data-x')) - $element.width()/2.0, parseFloat($element.attr('data-y')) + $element.height()/2.0),
                    //    new SAT.Vector(parseFloat($element.attr('data-x')) - $element.width()/2.0, parseFloat($element.attr('data-y')) - $element.height()/2.0),
                    //    new SAT.Vector(parseFloat($element.attr('data-x')) + $element.width()/2.0, parseFloat($element.attr('data-y')) - $element.height()/2.0),
                    //    new SAT.Vector(parseFloat($element.attr('data-x')) + $element.width()/2.0, parseFloat($element.attr('data-y')) + $element.height()/2.0)
                    //]).setAngle(parseInt($element.attr('data-rotation')));

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
                        //console.log('Yes');
                    }
                });
            }
        };
    }

    /**
     * Init draggable elements
     * With interact
     * @param elementsClass
     */
    Controller.prototype.initElements = function(elementsClass) {
        // set container width
        var documentWidth = $(window).width();
        $('.room-editor-container').width(documentWidth * 0.6);
        $('.editor-container').width(documentWidth * 0.6);

        // set container height according width
        var scaling = parseFloat(this.$holder.data('width')) / this.$holder.width();
        $('.editor-container').height($('.editor-container').data('height') / scaling);
        // change editor height line
        $('.editor-height').height($('.editor-container').height());
        $('.editor-height img').height($('.editor-container').height());

        // init draggable
        interact('.' + elementsClass).draggable(this.$options);

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

      // define form dialog
      dimensionsDialog.dialog({
        autoOpen: false,
        minWidth: 650,
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

      // open dialog form and clear area
      setDimensionsButton.on('click', function(){
        clearArea();
        dimensionsDialog.dialog('open');
      });

      //clear area
      function clearArea(){
        $('.' + elementsClass).each(function() {
           $(this).css('display', 'none');
        });
      }

      // restore area
      function restoreArea(){
        $('.' + elementsClass).each(function() {
          if ($('.editor-items-panel').css('display') === 'none') {
            $(this).css('display', 'block');
          } else {
            $(this).css('display', 'none');
          }
        });
      }
    };

    /**
     * Resize area
     */
    Controller.prototype.resizeArea = function(elementsClass) {
      var controller = this;
      var dimensionsDialog = $('div#dimensions-dialog');
      $('#submit-new-dimensions').on('click', function(e) {
        e.preventDefault();

        var newWidthFt = +$('#width-ft').val();
        var newWidthInch = +$('#width-inch').val();
        var newHeightFt = +$('#height-ft').val();
        var newHeightInch = +$('#height-inch').val();

        var newWidth = ( newWidthFt * 12 ) + newWidthInch;
        var newHeight = ( newHeightFt * 12 ) + newHeightInch;

        if ( !validateForm( $('.dialog-input') ) ) { return; }

        setNewDimensionsToArea(newWidth, newHeight);

        var scaling = +$('.editor-container').data('width') / +$('.editor-container').width();

        if ( !renderFormErrors( validateNewRoomDimensions(scaling) ) ) { return; }

        scaleAreaHeight(scaling);

        scaleEditorHeightLine();

        updateMeasureDescription(newWidthFt, newWidthInch, newHeightFt, newHeightInch);

        scaleItems(scaling);

        resetItemsInPanel( $('.items-panel-elem') );

        controller.initItemsPanelArea();

        dimensionsDialog.dialog('close');

      });

      function resetItemsInPanel(items) {
        items.each(function() {
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

      function isNumber(number) { return !isNaN(parseFloat(number)) && isFinite(number) && number >= 0; }

      function validateForm(imputs) {
        var validInputs = 0;
        imputs.each(function(index) {
          if ( !isNumber( $(this).val() ) ) {
            $(this).css('border-color', '#A94442');
          } else {
            $(this).css('border-color', '#ccc');
            validInputs++;
          }
        });

        if (validInputs < 4) {
          return false;
        } else {
          return true;
        }
      }

      function setNewDimensionsToArea(width, height) {
        $('.editor-container').data('width', width);
        $('.editor-container').data('height', height);
      }

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
        // render errors
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
          console.log(false);
          return false;
        } else {
          console.log(true);
          return true;
        }
      }

      function scaleAreaHeight(scaling) {
        $('.editor-container').height($('.editor-container').data('height') / scaling);
      }

      function scaleEditorHeightLine(scaling) {
        $('.editor-height').height($('.editor-container').height());
        $('.editor-height img').height($('.editor-container').height());
      }

      function updateMeasureDescription(widthFt, widthInch, heightFt, heightInch) {
        $('span#measure-width-ft').html(widthFt);
        $('span#measure-width-inch').html(widthInch);
        $('span#measure-height-ft').html(heightFt);
        $('span#measure-height-inch').html(heightInch);
      }

      function scaleItems(scaling) {
        $('.' + elementsClass).each(function() {
          $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scaling || $(this).width()/2.0);
          $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scaling || $(this).height()/2.0);

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

    };

    /**
     * Init items panel area
     */
    Controller.prototype.initItemsPanelArea = function() {
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
          console.log(event);
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

          // console.log( newPositionX );
          // console.log( newPositionX + +realItem.width() );
          // console.log( +$('.editor-container').width() );


          if ( $('.editor-items-panel').height() == 0 ){
            $('.editor-items-panel').hide();
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
        this.resizeArea(this.$initialElenemts);
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
