/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var LayoutController = require('famous-flex/LayoutController');
    var LayoutDockHelper = require('famous-flex/helpers/LayoutDockHelper');
    var BkImageSurface = require('famous-bkimagesurface/BkImageSurface');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @alias module:NavBarView
     */
    function NavBarView(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
    }
    NavBarView.prototype = Object.create(View.prototype);
    NavBarView.prototype.constructor = NavBarView;

    NavBarView.DEFAULT_OPTIONS = {
        classes: ['view', 'profile'],
        navBar: {
            height: 50,
            left: false
        },
        profileText: 'Scarlett Johansson was born in New York City. Her mother, Melanie Sloan, is from an Ashkenazi Jewish family, and her father, Karsten Johansson, is Danish. Scarlett showed a passion for acting at a young age and starred in many plays.<br><br>She has a sister named Vanessa Johansson, a brother named Adrian, and a twin brother named Hunter Johansson born three minutes after her. She began her acting career starring as Laura Nelson in the comedy film North (1994).<br><br>The acclaimed drama film The Horse Whisperer (1998) brought Johansson critical praise and worldwide recognition. Following the film\'s success, she starred in many other films including the critically acclaimed cult film Ghost World (2001) and then the hit Lost in Translation (2003) with Bill Murray in which she again stunned critics. Later on, she appeared in the drama film Girl with a Pearl Earring (2003).'
    };

    function _createRenderables() {
        this._renderables = {
            background: new Surface({
                classes: this.options.classes.concat(['background'])
            }),
            navBarBackground: new Surface({
                classes: this.options.classes.concat(['navbar', 'background'])
            }),
            navBarTitle: new Surface({
                classes: this.options.classes.concat(['navbar', 'title']),
                content: '<div>' + 'Scarlett Johansson' + '</div>'
            }),
            navBarImage: new BkImageSurface({
                classes: this.options.classes.concat(['navbar', 'image']),
                content: require('../images/scarlett.jpg'),
                sizeMode: 'cover'
            }),
            content: new Surface({
                classes: this.options.classes.concat(['text']),
                content: this.options.profileText
            })
        };
    }

    function _createLayout() {
        this.layout = new LayoutController({
            autoPipeEvents: true,
            layout: function(context, options) {
                var dock = new LayoutDockHelper(context, options);
                dock.fill('background');
                dock.top('navBarBackground', this.options.navBar.height, 1);
                context.set('navBarTitle', {
                    size: [context.size[0], this.options.navBar.height],
                    translate: [0, 0, 2]
                });
                context.set('navBarImage', {
                    size: [32, 32],
                    translate: [this.options.navBar.left ? 20 : (context.size[0] - 20 - 32), 9, 2]
                });
                dock.top(undefined, 20);
                dock.fill('content', 1);
            }.bind(this),
            dataSource: this._renderables
        });
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);
    }

    module.exports = NavBarView;
});
