/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * TabBarController.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var AnimationController = require('famous-flex/AnimationController');
    var TabBar = require('famous-flex/widgets/TabBar');
    var LayoutDockHelper = require('famous-flex/helpers/LayoutDockHelper');
    var LayoutController = require('famous-flex/LayoutController');
    var Easing = require('famous/transitions/Easing');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} [options.layoutController] Options that are passed to the LayoutController.
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @alias module:TabBarController
     */
    function TabBarController(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
        _setListeners.call(this);
    }
    TabBarController.prototype = Object.create(View.prototype);
    TabBarController.prototype.constructor = TabBarController;

    TabBarController.TabBarPosition = {
        TOP: 0,
        BOTTOM: 1,
        LEFT: 2,
        RIGHT: 3
    };

    /**
     * Default layout-function for the TabBarController. Supports simple
     * docking to any of the four edges.
     */
    TabBarController.DEFAULT_LAYOUT = function(context, options) {
        var dock = new LayoutDockHelper(context, options);
        switch (options.tabBarPosition) {
            case TabBarController.TabBarPosition.TOP:
                dock.top('tabBar', options.tabBarSize, options.tabBarZIndex);
                break;
            case TabBarController.TabBarPosition.BOTTOM:
                dock.bottom('tabBar', options.tabBarSize, options.tabBarZIndex);
                break;
            case TabBarController.TabBarPosition.LEFT:
                dock.left('tabBar', options.tabBarSize, options.tabBarZIndex);
                break;
            case TabBarController.TabBarPosition.RIGHT:
                dock.right('tabBar', options.tabBarSize, options.tabBarZIndex);
                break;
        }
        dock.fill('content');
    };

    TabBarController.DEFAULT_OPTIONS = {
        layoutController: {
            layout: TabBarController.DEFAULT_LAYOUT,
            layoutOptions: {
                tabBarSize: 50,
                tabBarZIndex: 10,
                tabBarPosition: TabBarController.TabBarPosition.BOTTOM
            }
        },
        tabBar: {
            createRenderables: {
                background: true
            }
        },
        animationController: {
            transition: {duration: 300, curve: Easing.inOutQuad},
            animation: AnimationController.Animation.FadedZoom
        }
    };

    /**
     * Creates the renderables (tabBar, animationController).
     */
    function _createRenderables() {
        this.tabBar = new TabBar(this.options.tabBar);
        this.animationController = new AnimationController(this.options.animationController);
        this._renderables = {
            tabBar: this.tabBar,
            content: this.animationController
        };
    }

    /**
     * Creates the outer (header-footer) layout.
     */
    function _createLayout() {
        this.layout = new LayoutController(this.options.layoutController);
        this.layout.setDataSource(this._renderables);
        this.add(this.layout);
    }

    /**
     * Sets the listeners.
     */
    function _setListeners() {
        this.tabBar.on('tabchange', function(event) {
            _updateView.call(this, event);
        }.bind(this));
    }

    /**
     * Updates the view-container with the selected view.
     */
    function _updateView(event) {
        var index = this.tabBar.getSelectedItemIndex();
        this.animationController.halt();
        if (index >= 0) {
            this.animationController.show(this._items[index].view);
        }
        else {
            this.animationController.hide();
        }
    }

    /**
     * Patches the TabBarController instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {Object} [options.layoutController] Options that are passed to the LayoutController.
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (this.layout && options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        if (this.tabBar && options.tabBar) {
            this.tabBar.setOptions(options.tabBar);
        }
        if (this.animationController && options.animationController) {
            this.animationController(options.animationController);
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar controller.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBarController = new TabBarController();
     * tabBarController.setItems([
     *   {tabItem: 'Profile', view: new ProfileView()},
     *   {tabItem: 'Map', view: new MapView()},
     *   {tabItem: 'Login', view: new LoginView()}
     *   {tabItem: 'Settings', view: new SettingsView()}
     * ]);
     *```
     *
     * @param {Array} items Array of tab-bar controller items.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setItems = function(items) {
        this._items = items;
        var tabItems = [];
        for (var i = 0; i < items.length; i++) {
            tabItems.push(items[i].tabItem);
        }
        this.tabBar.setItems(tabItems);
        _updateView.call(this);
        return this;
    };

    /**
     * Get the tab-items (also see `setItems`).
     *
     * @return {Array} tab-items
     */
    TabBarController.prototype.getItems = function() {
        return this._items;
    };

    module.exports = TabBarController;
});
