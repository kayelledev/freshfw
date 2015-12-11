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
        $('.room-editor-container').width(documentWidth * 0.6);
        $('.editor-container').width(documentWidth * 0.6);

        $('.dragg').width( $('.editor-container').css('width') );

        // set container height according width
        var scaling = parseFloat(this.$holder.data('width')) / this.$holder.width();
        console.log(this.$holder.data('width'))
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
            'height': $(this).data('height') / scaling
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
              text: $('#tooltip-' + $(this).attr('id')),
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

        //redraw image
        $('.room-layout').on('show', function() {
          $('.draggable').find('.item-image:visible').each(function(index) {
            if( $(this).attr('data-redraw') !== 'true' ) {
              controller.redrawImage( +$(this).attr('id'), $(this) );
              $(this).attr('data-redraw', 'true');
            }
          });
        });

        setPosition();

        function setPosition() {

          var itemsWithoutPosition = [];
          var itemsWithPosition = [];
          $('.draggable').each(function() {
            if ( $(this).attr('data-layout-x') === '' || $(this).attr('data-layout-y') === '' ) {
              itemsWithoutPosition.push( $(this) );
            } else {
              itemsWithPosition.push( $(this) );
            }
          });

          clearAreaAndInitPanel(itemsWithoutPosition);

          $(itemsWithPosition).each(function() {
            var posX = +$(this).attr('data-layout-x') / scaling;
            var posY = +$(this).attr('data-layout-y') / scaling;
            var rotation = $(this).attr('data-layout-rotation');
            console.log(posX, posY, rotation);
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
            clearArea();
            resetElemInArea();
            resetItemsInPanel();
            $(items).each(function() {
              elemIt = $(this).attr('id');
              var elemInPanel = $('.items-panel-elem[data-id="' + elemId + '"]')
              controller.initItemsPanelArea(elemInPanel);
            })

            function clearArea(){
              $(items).each(function() {
                console.log($(this));
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
                elemId = $(this).attr('id');
                panelElem = $(".items-panel-elem[data-id='" + elemId + "']");

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
        }

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
              controller.setCollisions(parentElement);
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
          console.log(beforeDegree);
          console.log(newDegree);

          var offsetX = parseFloat(parentElem.attr('data-x')),
              offsetY = parseFloat(parentElem.attr('data-y'));

          setDegree(newDegree);

          if ( controller.restrictAreaHoles( currentElement ) ) {
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

      // open dialog form
      setDimensionsButton.on('click', function(){
        clearArea();
        dimensionsDialog.dialog('open');
      });

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

    Controller.prototype.setNewArea = function(elementsClass) {
      var controller = this;
      var dimensionsDialog = $('div#dimensions-dialog');
      $('#submit-new-dimensions').on('click', function(e) {
        e.preventDefault();
        newRect0();

        function newRect0() {
          var form = $(".room-inputs[data-room-id='0']");
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
            var newItemWidth = +$(this).data('width');
            var newItemHeight = +$(this).data('height');

            if(newItemWidth > newEditorContainerWidth || newItemHeight > newEditorContainerHeight) {
              haveErrors = true;
            }
          });
          if (haveErrors) {
            invalidInputs = inputs;
            errorMessages.push('New room dimensions are not enough for all the furniture included. Please, enlarge them.');
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
    Controller.prototype.initItemsPanelArea = function(item) {
      var controller = this;
      // show items panel
      $('.editor-items-panel').show();
      $(item).attr('data-x', '0');
      $(item).attr('data-y', '0');
      $(item).css({
        '-webkit-transform': 'translate(0px, 0px) rotate(0deg)',
           '-moz-transform': 'translate(0px, 0px) rotate(0deg)',
            '-ms-transform': 'translate(0px, 0px) rotate(0deg)',
                'transform': 'translate(0px, 0px) rotate(0deg)',
      });
      $(item).show();

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

        var realImage = $(realItem).find('.item-image');
        if( realImage.attr('data-redraw') !== 'true' ) {
          controller.redrawImage(+realImage.attr('id'), realImage);
          realImage.attr('data-redraw', 'true');
        }

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

        if ( $('.editor-items-panel').height() === 0 ){
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
      }

    };

    Controller.prototype.adaptArea = function(elementsClass) {
      var controller = this;

      $(window).resize(function(){
        scaleArea();
      });

      function scaleArea(){
        var documentWidth = $(window).width();
        $('.room-editor-container').width(documentWidth * 0.6);
        $('.editor-container').width(documentWidth * 0.6);

        // set container height according width
        var scaling = parseFloat(controller.$holder.data('width')) / controller.$holder.width();
        $('.editor-container').height($('.editor-container').data('height') / scaling);

        // change editor height line
        $('.editor-height').height($('.editor-container').height());
        $('.editor-height img').height($('.editor-container').height());
        // change editor width line
        $('.editor-width').width($('.editor-container').width());
        $('.editor-width img').width($('.editor-container').width());

        $('.dragg').width( $('.editor-container').css('width') );

        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {

            var parentDataX = +$(this).parent().data('x')/scaling;
            var parentDataY = +$(this).parent().data('y')/scaling;
            var dataX = +$(this).data('x')/scaling;
            var dataY = +$(this).data('y')/scaling;
            var posX = +controller.getDegreeOfElement( $(this).parent() ).left / +scaling;
            var posY = +controller.getDegreeOfElement( $(this).parent() ).top / +scaling;
            var rotation = +controller.getDegreeOfElement( $(this).parent() ).rotation;

            $(this).attr('data-x', parentDataX);
            $(this).attr('data-y', parentDataY);
            $(this).parent().attr('data-x', parentDataX);
            $(this).parent().attr('data-y', parentDataY);

            // $(this).parent().css({
            //     'width': $(this).data('width') / scaling,
            //     'height': $(this).data('height') / scaling,
            //     '-webkit-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation +'deg)',
            //     '-moz-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation +'deg)',
            //     '-ms-transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation +'deg)',
            //     'transform': 'translate(' + posX + 'px,' + posY + 'px) rotate(' + rotation +'deg)',
            // });
            $(this).width( $(this).data('width') / scaling );
            $(this).height( $(this).data('height') / scaling );

            $(this).parent().width( $(this).data('width') / scaling );
            $(this).parent().height( $(this).data('height') / scaling );

            $(this).parent().children('.rotation-arrow').css('top', $(this).height() + 5 + 'px')
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
        var top = +$('.editor-container').offset().top;
        var left = +$('.editor-container').offset().left;
        var width = +$('.editor-container').width();
        var height = +$('.editor-container').height();

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

    Controller.prototype.redrawImage = function(index, img) {
      console.log('redraw');

      storeImageLocally = function(id, zis) {
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
        link = document.createElement('a');
        link.className = 'temporaryLink';
        link.download = name;
        link.href = uri;
        if (uri) {
          link.click();
        }
      };

      storeImageLocally(index, img[0]);

      $('#save-as-image').on('click', printToFile);
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
        this.removeElement();
    };

    $(document).ready(function() {

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

        $('.subtabs__one-tab').click(function(e) {
          e.preventDefault();
          if ( $('.active-tab').attr('id') === 'room-layout' ) {
            console.log('room-builder-subtab');
            saveRoomLayout();
          }
        });

        $('.main-tabs__one-tab').click(function(e) {
          e.preventDefault();
          if ( $('.active-tab').attr('id') === 'room-layout' ) {
            console.log('room-builder-tab');
            saveRoomLayout();
          }
          window.open( $(this).attr('href') ,"_self");
        });

        function saveRoomLayout() {
          var data = {
            products: {}
          };

          var roomWidth = +$('.editor-container').attr('data-width');
          var roomDepth = +$('.editor-container').attr('data-height');

          data.room_dimensions = {
            width: roomWidth,
            depth: roomDepth
          }

          $(".draggable:visible").each(function() {
            var elemId = $(this).attr('id');

            coX = +$('.editor-container').width() / +controller.getDegreeOfElement( $(this).parent() ).left;
            coY = +$('.editor-container').height() / +controller.getDegreeOfElement( $(this).parent() ).top;

            var posX = +$('.editor-container').attr('data-width') / coX;
            var posY = +$('.editor-container').attr('data-height') / coY;
            var rotation = +controller.getDegreeOfElement( $(this).parent() ).degree;
            data.products[elemId] = {
              layout_posX: posX,
              layout_posY: posY,
              layout_rotation: rotation,
            }
          });

          return $.ajax({
              url: $('#room-layout').attr('data-url'),
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

        $('.layout-submit-room').on('click', function() {
          saveRoomLayout();
          var button = this;
          var data = {
            ids: []
          };

          $(".draggable:hidden").each(function() {
            var elemId = $(this).attr('id');
            data.ids.push(elemId);
          });

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

                  if ( $('.editor-items-panel').height() === 0 ){
                    $('.editor-items-panel').hide();
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
