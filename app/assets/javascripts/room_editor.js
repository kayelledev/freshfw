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
         * Hold current element on click
         * @type {null}
         */
        this.$currentElement = null;

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
                    r = (parseFloat(target.getAttribute('data-rotation')) || 0);

                // translate the element
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px) rotate(' + r + 'deg)';

                // update the posiion attributes
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
                target.setAttribute('data-rotation', r);
            },
            // call this function on every dragend event
            onend: function (event) {
                var textEl = event.target.querySelector('p');

                textEl && (textEl.textContent =
                    'moved a distance of '
                    + (Math.sqrt(event.dx * event.dx +
                        event.dy * event.dy)|0) + 'px');
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
        interact('.' + elementsClass).draggable(this.$options);
    };

    /**
     * Add new draggadle element on click
     */
    Controller.prototype.addElement = function() {
        this.$addButton.on('click', $.proxy(function() {
            var $element = $('<div class="draggable"></div>');

            this.$holder.append($element);

            this.catchElement();

            this.initElements($element.attr('id'), '#');
        }, this));
    };

    /**
     * Catch element on click
     * Make it current for rotation panel
     */
    Controller.prototype.catchElement = function() {
        var self = this;

        this.$holder.find('div')
            .off('click')
            .on('click', function() {

                self.$holder.find('div').removeClass('active');
                $(this).addClass('active');

                self.$currentElement = $(this);
                self.$rotationPanel.val((parseInt($(this).attr('data-rotation')) || 0));
            });
    };

    /**
     * Rotate current element
     * Remember to save transition too
     */
    Controller.prototype.rotateElement = function() {

            this.$rotationPanel.on('change', $.proxy(function() {
                if(this.$currentElement) {
                    var deg = parseInt(this.$rotationPanel.val()),
                        offsetX = parseFloat(this.$currentElement.attr('data-x')),
                        offsetY = parseFloat(this.$currentElement.attr('data-y'));

                    this.$currentElement.attr('data-rotation', deg)
                        .css({
                            '-webkit-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                            '-moz-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                            '-ms-transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)',
                            'transform': 'translate(' + offsetX + 'px,' + offsetY + 'px) rotate(' + deg + 'deg)'
                        });
                }

            }, this));
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
    };

    $(document).ready(function() {

        var controller = new Controller();

        controller.init();

        // this is used later in the resizing demo
        window.dragMoveListener = dragMoveListener;
    });

})(jQuery);