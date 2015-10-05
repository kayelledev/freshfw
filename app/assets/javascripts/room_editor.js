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
        this.holderWidth = parseFloat(this.$holder.width());

        /**
         * Calculate holder height
         * @type {Number}
         */
        this.holderHeight = parseFloat(this.$holder.height());

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
                var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
                    r = (parseFloat(target.getAttribute('data-rotation')) || 0),
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
                            new SAT.Vector(parseFloat($element.attr('data-x')) - $element.width()/2.0, parseFloat($element.attr('data-y')) + $element.height()/2.0),
                            $element.width(),
                            $element.height()

                        ).toPolygon().setAngle(parseInt($element.attr('data-rotation'))*Math.PI/180.0);
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
        // target elements with the "draggable" class
        $('.' + elementsClass).each(function() {
            $(this).attr('data-x', $(this).width()/2.0);
            $(this).attr('data-y', $(this).height()/2.0);
            $(this).attr('data-rotation', 0);

            $(this).css({
                'width': $(this).data('width'),
                'height': $(this).data('heigh')
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
            //$element.attr('data-height', $selected.data('height'));
            //$element.attr('title', $selected.val());
            //$element.attr('data-toggle', 'tooltip');

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

        $widthPanel.val(this.holderWidth);
        $heightPanel.val(this.holderHeight);

        $widthPanel.on('change', function() {
            scale('xCord');
        });

        $heightPanel.on('change', function() {
            scale('yCord');
        });
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

    /**
     * Init all Class methods
     *
     */
    Controller.prototype.init = function() {
        this.initElements(this.$initialElenemts);
        this.addElement();
        this.catchElement();
        this.rotateElement();
        //this.managePosition();
        this.manageHolderScaling();
        this.manageCats();
    };

    $(document).ready(function() {

        var controller = new Controller();

        controller.init();

        // this is used later in the resizing demo
        //window.dragMoveListener = dragMoveListener;
    });

})(jQuery);