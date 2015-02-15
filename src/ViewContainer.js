/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/*global define, console*/
/*eslint no-use-before-define:0, no-console:0 */

/**
 * ViewContainer.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var LayoutController = require('famous-flex/LayoutController');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var RenderNode = require('famous/core/RenderNode');
    var OptionsManager = require('famous/core/OptionsManager');
    var Timer = require('famous/utilities/Timer');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} options.factory Factory delegate for creating new renderables.
     * @alias module:ViewContainer
     */
    function ViewContainer(options) {
        View.apply(this, arguments);

        _createLayout.call(this);

        if (options) {
            this.setOptions(options);
        }
    }
    ViewContainer.prototype = Object.create(View.prototype);
    ViewContainer.prototype.constructor = ViewContainer;

    ViewContainer.DEFAULT_OPTIONS = {
        zIndexOffset: 0.1,
        transition: {
            duration: 700,
            curve: Easing.outBack
        },
        origin: [0.5, 0.5],
        animations: {
            /*slide: 'left',
            fade: 0,
            flip: 'top',
            zoom: [0, 0]*/
        }
    };

    /**
     * Out of the box supported animations.
     */
    ViewContainer.animations = {
        slide: function(show, value, size) {
            switch (value) {
            case 'left':
                return {transform: Transform.translate(show ? size[0] : -size[0], 0, 0)};
            case 'right':
                return {transform: Transform.translate(show ? -size[0] : size[0], 0, 0)};
            case 'up':
                return {transform: Transform.translate(0, show ? size[1] : -size[1], 0)};
            case 'down':
                return {transform: Transform.translate(0, show ? -size[1] : size[1], 0)};
            }
        },
        fade: function(show, value, size) {
            return {opacity: value};
        },
        zoom: function(show, value, size) {
            return {transform: Transform.scale(value[0], value[1], 1)};
        },
        flip: function(show, value, size) {
            switch (value) {
            case 'left':
                return {transform: Transform.rotate(0, show ? Math.PI : -Math.PI, 0)};
            case 'right':
                return {transform: Transform.rotate(0, show ? -Math.PI : Math.PI, 0)};
            case 'up':
                return {transform: Transform.rotate(show ? Math.PI : -Math.PI, 0, 0)};
            case 'down':
                return {transform: Transform.rotate(show ? -Math.PI : Math.PI, 0, 0)};
            }
        }
    };

    /**
     * Stacks the renderables on top of each other
     * with a z-translation of this.options.zIndexOffset.
     */
    function ViewStackLayout(context, options) {
        var set = {
            size: context.size,
            translate: [0, 0, 0],
            align: [0.5, 0.5],
            origin: [0.5, 0.5]
        };
        var views = context.get('views');
        var transferables = context.get('transferables');
        for (var i = 0; i < views.length; i++) {

            // Layout view
            var view = views[i];
            set.size = context.resolveSize(view, context.size);
            context.set(view, set);

            // Layout any transferables
            var item = this._viewStack[i];
            for (var j = 0; j < transferables.length; j++) {
                for (var key in item.transferables) {
                    if (transferables[j].renderNode === item.transferables[key].renderNode) {
                        context.set(transferables[j], {
                            translate: [0, 0, set.translate[2]],
                            size: [context.size[0], context.size[1]]
                        });
                    }
                }
            }

            // Increase z-index for next view
            set.translate[2] += options.zIndexOffset;
        }
    }

    /**
     * Creates the view-stack layout.
     */
    function _createLayout() {
        this._renderables = {
            views: [],
            transferables: []
        };
        this._viewStack = [];
        this.layout = new LayoutController({
            layout: ViewStackLayout.bind(this),
            layoutOptions: this.options,
            dataSource: this._renderables
        });
        this.add(this.layout);
        this.layout.on('layoutend', _startAnimations.bind(this));
    }

    /**
     * Helper function that gets the spec from a view.
     */
    function _viewGetSpec(view, id) {
        return view.layout.getSpec(id);
    }

    /**
     * Helper function that gets the renderable from a view.
     */
    function _viewGet(view, id) {
        return view.layout.get(id);
    }

    /**
     * Helper function that replaces a renderable in a view.
     */
    function _viewReplace(view, id, renderable) {
        return view.layout.replace(id, renderable);
    }

    /**
     * Wait until the spec can be retrieved from the view.
     */
    function _waitForSettledSpec(context) {
        if (!context.item.view) {
            return Timer.clear(context.fn);
        }
        var spec = _viewGetSpec(context.item.view, context.id);
        if (spec) {
            Timer.clear(context.fn);
            return context.callback(spec);
        }
    }

    /**
     * Animates the given modifier from the source-spec to the target-spec
     * using the given transition.
     */
    function _animateTransferable(mod, transition, sourceSpec, targetSpec) {
        if (sourceSpec.transform || targetSpec.transform) {
            mod.setTransform(targetSpec.transform || Transform.identity, transition);
        }
        if ((sourceSpec.opacity !== undefined) || (targetSpec.opacity !== undefined)) {
            mod.setOpacity((targetSpec.opacity === undefined) ? 1 : targetSpec.opacity, transition);
        }
        if (sourceSpec.size || targetSpec.size) {
            mod.setSize(targetSpec.size || sourceSpec.size, transition);
        }
        //mod.setAlign(targetSpec.align|| [0, 0]);
        //mod.setOrigin(targetSpec.origin || [0, 0]);
    }

    /**
     * Begins visual transfer or renderables from the previous item
     * to the new item.
     */
    function _startTransferableAnimations(item, prevItem) {
        for (var sourceId in item.options.transfer) {
            var targetId = item.options.transfer[sourceId];
            var sourceSpec = _viewGetSpec(prevItem.view, sourceId);
            var targetRenderable = _viewGet(item.view, targetId);
            if (sourceSpec && targetRenderable) {

                // Replace source & target renderables in the views
                // source: dummy-node
                // target: target-renderable with opacity: 0.
                var sourceRenderable = _viewReplace(prevItem.view, sourceId, new RenderNode(new Modifier(sourceSpec)));
                var targetNode = new RenderNode(new Modifier({opacity: 0}));
                targetNode.add(targetRenderable);
                targetRenderable = _viewReplace(item.view, targetId, targetNode);

                // Take ownership of the source renderable.
                // This renderable will be layouted by the layout-function
                var mod = new StateModifier(sourceSpec);
                var renderNode = new RenderNode(mod);
                renderNode.add(sourceRenderable);
                item.transferables[targetId] = {
                    renderNode: renderNode,
                    sourceId: sourceId,
                    sourceView: prevItem.view,
                    sourceRenderable: sourceRenderable,
                    targetId: targetId,
                    targetRenderable: targetRenderable
                };
                this._renderables.transferables.push(renderNode);
                this.layout.reflowLayout();

                // Wait for the target spec to have settled. This may take a couple render
                // cycles if for instance, this involves a true-size renderable or the
                // renderable is affected by other true-size renderables around itsself.
                var waitContext = {
                    item: item,
                    id: targetId,
                    callback: _animateTransferable.bind(this, mod, item.options.transition, sourceSpec)
                };
                waitContext.fn = _waitForSettledSpec.bind(this, waitContext);
                Timer.every(waitContext.fn, 1);
            }
        }
    }

    /**
     * Called whenever the view has been shown and the
     * transferable animations should be ended. This returns
     * the renderables to their original views.
     */
    function _endTransferableAnimations(item) {

        // Restore renderables to to the views in their original state.
        for (var key in item.transferables) {
            var transferable = item.transferables[key];
            for (var i = 0; i < this._renderables.transferables.length; i++) {
                if (this._renderables.transferables[i] === transferable.renderNode) {
                    this._renderables.transferables.splice(i, 1);
                    break;
                }
            }
            _viewReplace(transferable.sourceView, transferable.sourceId, transferable.sourceRenderable);
            _viewReplace(item.view, transferable.targetId, transferable.targetRenderable);
        }
        item.transferables = {};
        this.layout.reflowLayout();
    }

    /**
     * Starts a show or hide animation.
     */
    function _startAnimations(event) {
        var prevItem;
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[i];
            if (item.show || item.hide) {
                _startAnimation.call(this, item, prevItem, event.size);
            }
            prevItem = item;
        }
    }

    /**
     * Starts the view animation.
     */
    function _startAnimation(item, prevItem, size) {
        var transform = Transform.identity;
        var opacity = 1;
        for (var key in item.options.animations) {
            if (item.options.animations[key] !== undefined) {
                var result = ViewContainer.animations[key](item.show, item.options.animations[key], size);
                if (result && result.transform) {
                    transform = Transform.multiply(transform, result.transform);
                }
                if (result && (result.opacity !== undefined)) {
                    opacity *= result.opacity;
                }
            }
        }
        item.mod.halt();
        if (item.show) {
            item.show = false;
            item.mod.setTransform(transform);
            item.mod.setOpacity(opacity);
            item.mod.setTransform(Transform.identity, item.options.transition, item.callback);
            item.mod.setOpacity(1, item.options.transition);
            if (item.options.transfer && prevItem) {
                _startTransferableAnimations.call(this, item, prevItem);
            }
        }
        else if (item.hide) {
            item.hide = false;
            item.mod.setTransform(transform, item.options.transition, item.callback);
            item.mod.setOpacity(opacity, item.options.transition);
        }
    }

    /**
     * Creates a view-item.
     */
    function _createItem(view, options, callback) {
        var itemOptions = this.options;
        if (options) {
            itemOptions = Object.create(this.options);
            var optionsManager = new OptionsManager(itemOptions);
            optionsManager.setOptions(options);
        }
        var item = {
            view: view,
            options: itemOptions,
            mod: new StateModifier({
                align: itemOptions.origin,
                origin: itemOptions.origin
            }),
            show: true,
            callback: callback,
            transferables: {} // renderables currently being transfered
        };
        item.node = new RenderNode(item.mod);
        item.node.add(view);
        return item;
    }

    /**
     * Shows a view and puts it on top of the view-stack.
     *
     * @return {ViewContainer} this
     */
    ViewContainer.prototype.show = function(view, options, callback) {
        var item = _createItem.call(this, view, options, callback);
        item.callback = function() {
            _endTransferableAnimations.call(this, item);
            if (callback) {
                callback();
            }
        }.bind(this);
        item.view.pipe(this._eventOutput);
        this._renderables.views.push(item.node);
        this._viewStack.push(item);
        this.layout.reflowLayout();
        return this;
    };

    /**
     * Hides the view and removes it from the view-stack.
     *
     * @return {ViewContainer} this
     */
    ViewContainer.prototype.hide = function(view, options, callback) {
        var index = view ? -1 : (this._viewStack.length - 1);
        for (var i = 0; i < this._viewStack.length; i++) {
            if (this._viewStack[i].view === view) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            if (callback) {
                callback();
            }
            return this;
        }
        var item = this._viewStack[index];
        view = view || this._viewStack[index].view;
        item.hide = true;
        item.callback = function() {
            view.unpipe(this._eventOutput);
            this._renderables.views.splice(index, 1);
            this._viewStack.splice(index, 1);
            this.layout.reflowLayout();
            item.view = undefined;
            if (callback) {
                callback();
            }
        }.bind(this);
        item.options = this.options;
        if (options) {
            item.options = Object.create(this.options);
            var optionsManager = new OptionsManager(item.options);
            optionsManager.setOptions(options);
        }
        this.layout.reflowLayout();
        return this;
    };

    /**
     * Get the number of views currently in the container.
     *
     * @return {Number} number of views
     */
    ViewContainer.prototype.getCount = function() {
        return this._viewStack.length;
    };

    module.exports = ViewContainer;
});
