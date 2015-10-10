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
                restriction: "parent",
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
        var scalingX = parseFloat(this.$holder.data('width')) / this.$holder.width(),
            scalingY = parseFloat(this.$holder.data('height')) / this.$holder.height();
        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {
            //$(this).attr('data-x', parseFloat($(this).data('x'))/scalingX || $(this).width()/2.0);
            //$(this).attr('data-y', parseFloat($(this).data('y'))/scalingY || $(this).height()/2.0);

            $(this).parent().attr('data-x', parseFloat($(this).data('x'))/scalingX || $(this).width()/2.0);
            $(this).parent().attr('data-y', parseFloat($(this).data('y'))/scalingY || $(this).height()/2.0);

            //$(this).css({
            //    'width': $(this).data('width'),
            //    'height': $(this).data('heigh'),
            //    '-webkit-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
            //    '-moz-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
            //    '-ms-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
            //    'transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
            //});

            $(this).parent().css({
                'width': $(this).data('width'),
                'height': $(this).data('heigh'),
                '-webkit-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                '-moz-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                '-ms-transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)',
                'transform': 'translate(' + parseFloat($(this).data('x'))/scalingX + 'px,' + $(this).data('y')/scalingY + 'px) rotate(' + parseInt($(this).data('rotation')) +'deg)'
            });
        });

        interact('.' + elementsClass).draggable(this.$options);

        $('[data-toggle="tooltip"]').tooltip();
    };

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

        this.$holder.find('div')
            .off('mousedown')
            .on('mousedown', function() {

                self.$holder.find('div').removeClass('active');
                $(this).addClass('active');

                self.$currentElement = $(this);
                self.$rotationPanel.val((parseInt($(this).attr('data-rotation')) || 0));
                self.$positionPanelX.val((parseFloat($(this).attr('data-x')) || 0));
                self.$positionPanelY.val((parseFloat($(this).attr('data-y')) || 0));

                $('.rotation-arrow').hide();

                $(this).parent().find('.rotation-arrow').show();
            });
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
                    'height': this.$currentElement.data('heigh'),
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
                        $(this).height($(this).data('heigh') * scaleY);
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
            var center_x = offset.left;
            var center_y = offset.top;
            var mouse_x = e.pageX;
            var mouse_y = e.pageY;
            var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
            var degree = (radians * (180 / Math.PI) * -1) + 100;
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

            controller.$holder.find('div').each(function() {
                var data = {
                    'posX': parseInt($(this).parent().attr('data-x')),
                    'posY': parseInt($(this).parent().attr('data-y')),
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