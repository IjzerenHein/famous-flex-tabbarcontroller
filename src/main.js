/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */
define(function(require) {

    //<webpack>
    require('famous-polyfills');
    require('famous/core/famous.css');
    require('famous-flex/widgets/styles.css');
    require('./styles.css');
    require('./index.html');
    //</webpack>

    // Fast-click
    var FastClick = require('fastclick/lib/fastclick');
    FastClick.attach(document.body);

    // import dependencies
    var Engine = require('famous/core/Engine');
    var isMobile = require('ismobilejs');
    var TabBarController = require('famous-flex/widgets/TabBarController');
    var FullImageView = require('./views/FullImageView');
    var NavBarView = require('./views/NavBarView');
    var ProfileView = require('./views/ProfileView');
    var LocationView = require('./views/LocationView');
    var PhoneFrameView = require('./PhoneFrameView');
    var MapView = require('famous-map/MapView');

    // On mobile, disable app-mode and install the custom MapView
    // touch-handler so that Google Maps works.
    if (isMobile.any) {
        Engine.setOptions({appMode: false});
        MapView.installSelectiveTouchMoveHandler();
    }

    // create the main context
    var mainContext = Engine.createContext();

    // Create a nice phone frame
    var phoneFrameView = new PhoneFrameView();
    mainContext.add(phoneFrameView);

    // Create tab-bar controller
    var tabBarController = new TabBarController({
        animationController: {
            transfer: {
                zIndez: 1000,
                items: {
                    'image': ['image', 'navBarImage'],
                    'navBarImage': ['image', 'navBarImage']
                }
            }
        }
    });
    tabBarController.setItems([
        {tabItem: 'Image', view: new FullImageView()},
        {tabItem: 'Profile', view: new ProfileView()},
        {tabItem: 'NavBar', view: new NavBarView()},
        {tabItem: 'Map', view: new LocationView()}
    ]);
    phoneFrameView.setContent(tabBarController);
});
