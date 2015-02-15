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
 * TabBarContainer.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var ViewContainer = require('./ViewContainer');
    var TabBar = require('famous-flex/widgets/TabBar');
    var HeaderFooterLayout = require('famous-flex/layouts/HeaderFooterLayout');
    var LayoutController = require('famous-flex/LayoutController');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} [options.layoutController] Options that are passed to the LayoutController.
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.viewContainer] Options that are passed to the ViewContainer.
     * @alias module:TabBarContainer
     */
    function TabBarContainer(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
        _setListeners.call(this);
    }
    TabBarContainer.prototype = Object.create(View.prototype);
    TabBarContainer.prototype.constructor = TabBarContainer;

    TabBarContainer.DEFAULT_OPTIONS = {
        layoutController: {
            layout: HeaderFooterLayout,
            layoutOptions: {
                headerSize: 50
            }
        },
        tabBar: {
            createRenderables: {
                selectedItemOverlay: true
            }
        },
        viewContainer: {
            autoHide: true,
            animations: {
                fade: '0.5'
            }
        }
    };

    /**
     * Creates the renderables (tabBar, viewContainer).
     */
    function _createRenderables() {
        this.tabBar = new TabBar(this.options.tabBar);
        this.viewContainer = new ViewContainer(this.options.viewContainer);
        this._renderables = {
            header: this.tabBar,
            content: this.viewContainer
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
            this._eventOutput.emit(event);
        }.bind(this));
    }

    /**
     * Updates the view-container with the selected view.
     */
    function _updateView(event) {
        var index = this.tabBar.getSelectedItemIndex();
        var options;
        if (this.options.viewContainer.animations && this.options.viewContainer.animations.slide && event && (event.oldIndex > index)) {
            var slide;
            switch (this.options.viewContainer.animations.slide) {
                case 'left': slide = 'right'; break;
                case 'right': slide = 'left'; break;
                case 'up': slide = 'down'; break;
                case 'down': slide = 'up'; break;
            }
            options = {animations: {slide: slide}};
        }
        this.viewContainer.hide(undefined, options);
        this.viewContainer.show(this._items[index].view, options);
    }

    /**
     * Patches the TabBarContainer instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {Object} [options.layoutController] Options that are passed to the LayoutController.
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.viewContainer] Options that are passed to the ViewContainer.
     * @return {TabBarContainer} this
     */
    TabBar.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        if (options.tabBar !== undefined) {
            this.tabBar.setOptions(options.tabBar);
        }
        if (options.viewContainer !== undefined) {
            this.tabBar.viewContainer(options.viewContainer);
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar container.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBarContainer = new TabBarContainer();
     * tabBar.setItems([
     *   {tabItem: 'Profile', view: new ProfileView()},
     *   {tabItem: 'Map', view: new MapView()},
     *   {tabItem: 'Login', view: new LoginView()}
     *   {tabItem: 'Settings', view: new SettingsView()}
     * ]);
     *```
     *
     * @param {Array} items Array of tab-bar container items.
     * @return {TabBarContainer} this
     */
    TabBarContainer.prototype.setItems = function(items) {
        this._items = items;
        var tabItems = [];
        for (var i = 0; i < items.length; i++) {
            tabItems.push(items[i].tabItem);
        }
        this.tabBar.setItems(tabItems);
        _updateView.call(this);
        return this;
    };

    module.exports = TabBarContainer;
});
