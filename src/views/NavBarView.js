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
    var ScrollController = require('famous-flex/ScrollController');
    var BkImageSurface = require('famous-bkimagesurface/BkImageSurface');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @alias module:NavBarView
     */
    function NavBarView(options) {
        View.apply(this, arguments);

        _createLayout.call(this);
        _createRenderables.call(this);
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

    function _createLayout() {
        this.layout = new ScrollController({
            autoPipeEvents: true,
            layout: function(context, options) {
                context.set('background', {
                    size: context.size
                });
                context.set('navBarBackground', {
                    size: [context.size[0], this.options.navBar.height],
                    translate: [0, 0, 2]
                });
                context.set('navBarTitle', {
                    size: [context.size[0], this.options.navBar.height],
                    translate: [0, 0, 3]
                });
                context.set('navBarImage', {
                    size: [32, 32],
                    translate: [this.options.navBar.left ? 20 : (context.size[0] - 20 - 32), 9, 3]
                });
                var textSize = context.resolveSize('text', context.size);
                context.set('text', {
                    size: [context.size[0], textSize[1]],
                    translate: [0, this.options.navBar.height + 20 + context.scrollOffset, 1],
                    scrollLength: this.options.navBar.height + 20 + textSize[1] + 20
                });
            }.bind(this)
        });
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);
    }

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
            text: new Surface({
                classes: this.options.classes.concat(['text']),
                content: this.options.profileText,
                size: [undefined, true]
            })
        };
        this.layout.setDataSource(this._renderables);
    }

    module.exports = NavBarView;
});
