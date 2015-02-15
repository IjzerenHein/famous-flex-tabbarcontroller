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
    var Surface = require('famous/core/Surface');
    var LayoutController = require('famous-flex/LayoutController');
    var BkImageSurface = require('famous-bkimagesurface/BkImageSurface');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} options.factory Factory delegate for creating new renderables.
     * @alias module:ProfileView
     */
    function ProfileView(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
    }
    ProfileView.prototype = Object.create(View.prototype);
    ProfileView.prototype.constructor = ProfileView;

    ProfileView.DEFAULT_OPTIONS = {
        classes: ['view', 'profile'],
        imageSize: [200, 200],
        imageScale: [1, 1, 1],
        nameHeight: 60,
        profileText: 'Scarlett Johansson was born in New York City. Her mother, Melanie Sloan, is from an Ashkenazi Jewish family, and her father, Karsten Johansson, is Danish. Scarlett showed a passion for acting at a young age and starred in many plays.<br><br>She has a sister named Vanessa Johansson, a brother named Adrian, and a twin brother named Hunter Johansson born three minutes after her. She began her acting career starring as Laura Nelson in the comedy film North (1994).<br><br>The acclaimed drama film The Horse Whisperer (1998) brought Johansson critical praise and worldwide recognition. Following the film\'s success, she starred in many other films including the critically acclaimed cult film Ghost World (2001) and then the hit Lost in Translation (2003) with Bill Murray in which she again stunned critics. Later on, she appeared in the drama film Girl with a Pearl Earring (2003).'
    };

    function _createRenderables() {
        this._renderables = {
            background: new Surface({
                classes: this.options.classes.concat(['background'])
            }),
            image: new BkImageSurface({
                classes: this.options.classes.concat(['image']),
                content: require('../images/scarlett.jpg')
            }),
            name: new Surface({
                classes: this.options.classes.concat(['name']),
                content: '<div>Scarlett Johansson</div>'
            }),
            text: new Surface({
                classes: this.options.classes.concat(['text']),
                content: this.options.profileText
            })
        };
    }

    function _createLayout() {
        this.layout = new LayoutController({
            autoPipeEvents: true,
            layout: function(context, options) {
                context.set('background', {
                    size: context.size
                });
                var image = context.set('image', {
                    size: this.options.imageSize,
                    translate: [(context.size[0] - this.options.imageSize[0]) / 2, 20, 0.001],
                    scale: this.options.imageScale
                });
                var name = context.set('name', {
                    size: [context.size[0], this.options.nameHeight],
                    translate: [0, image.size[1] + image.translate[1], 0.001]
                });
                context.set('text', {
                    size: [context.size[0], context.size[1] - name.size[1] - name.translate[1]],
                    translate: [0, name.translate[1] + name.size[1], 0.001]
                });
            }.bind(this),
            dataSource: this._renderables
        });
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);
    }

    module.exports = ProfileView;
});
