/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */
/*global google, ol, L*/
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var MapView = require('famous-map/MapView');
    var MapModifier = require('famous-map/MapModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var LayoutController = require('famous-flex/LayoutController');
    var BkImageSurface = require('famous-bkimagesurface/BkImageSurface');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @alias module:LocationView
     */
    function LocationView(options) {
        View.apply(this, arguments);

        _createMap.call(this);
        _createMarker.call(this);
    }
    LocationView.prototype = Object.create(View.prototype);
    LocationView.prototype.constructor = LocationView;

    LocationView.DEFAULT_OPTIONS = {
        classes: ['view', 'location'],
        mapView: {
            //type: MapView.MapType.OPENLAYERS3,
            type: MapView.MapType.GOOGLEMAPS,
            //type: MapView.MapType.LEAFLET,
            mapOptions: {
                zoom: 13,
                center: {lat: 48.8570519, lng: 2.3457724}
            }
        },
        marker: {
            size: [44, 60],
            borderWidth: 3,
            pinSize: [20, 16]
        }
    };

    function _createMap() {
        this.mapView = new MapView(this.options.mapView);
        this.add(this.mapView);

        // Wait for the map to load and initialize
        this.mapView.on('load', function() {

            // Add tile-layer (OSM is just one of many options)
            if (this.options.mapView.type === MapView.MapType.OPENLAYERS3) {
                this.mapView.getMap().addLayer(new ol.layer.Tile({
                    source: new ol.source.OSM()
                }));
            }
            else if (this.options.mapView.type === MapView.MapType.LEAFLET) {
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
                }).addTo(this.mapView.getMap());
            }
        }.bind(this));
    }

    /**
     * Create a nice marker on the map view.
     */
    function _createMarker() {
        this.mapMarker = {
            image: new BkImageSurface({
                classes: this.options.classes.concat(['marker', 'image']),
                content: require('../images/scarlett.jpg'),
                sizeMode: 'cover'
            }),
            mod: new MapModifier({
                mapView: this.mapView,
                position: this.options.mapView.mapOptions.center
            }),
            lc: new LayoutController({
                layout: function(context, size) {
                    var marker = this.options.marker;
                    var backSize = [marker.size[0], marker.size[1] - marker.pinSize[1]];
                    var top = -marker.size[1];
                    context.set('back', {
                        size: backSize,
                        translate: [backSize[0] / -2, top, 1]
                    });
                    var imageSize = [this.options.marker.size[0] - (this.options.marker.borderWidth * 2), this.options.marker.size[0] - (this.options.marker.borderWidth * 2)];
                    context.set('image', {
                        size: imageSize,
                        translate: [imageSize[0] / -2, top + ((backSize[1] - imageSize[1]) / 2), 5]
                    });
                    context.set('pin', {
                        size: marker.pinSize,
                        translate: [marker.pinSize[0] / -2, top + backSize[1], 1]
                    });
                }.bind(this),
                dataSource: {
                    back: new Surface({
                        classes: this.options.classes.concat(['marker', 'back'])
                    }),
                    pin: new Surface({
                        classes: this.options.classes.concat(['marker', 'pin']),
                        content: '<div></div>'
                    })
                }
            })
        };
        this.add(this.mapMarker.mod).add(this.mapMarker.lc);
        this.mapMarker.lc.insert('image', this.mapMarker.image);
    }

    LocationView.prototype.getTransferable = function(id) {
        if (id !== 'image') {
            return undefined;
        }
        var getSpec = function(callback) {
            var pnt = this.mapView.pointFromPosition(this.mapMarker.mod.getPosition());
            var imageSize = [this.options.marker.size[0] - (this.options.marker.borderWidth * 2), this.options.marker.size[0] - (this.options.marker.borderWidth * 2)];
            var backHeight = this.options.marker.size[1] - this.options.marker.pinSize[1];
            callback({
                size: imageSize,
                transform: Transform.translate(
                    pnt.x - (imageSize[0] / 2),
                    pnt.y - this.options.marker.size[1] + ((backHeight - imageSize[1]) / 2),
                    0
                )
            });
        }.bind(this);
        return {
            get: function() {
                return this.mapMarker.image;
            }.bind(this),
            show: function(renderable) {
                this.mapMarker.lc.replace('image', renderable);
            }.bind(this),
            getSpec: function(callback) {
                if (this.mapView.isInitialized()) {
                    getSpec.call(this, callback);
                }
                else {
                    this.mapView.on('load', getSpec.bind(this, callback));
                }
            }.bind(this)
        };
    };

    module.exports = LocationView;
});
