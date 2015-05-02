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
    var TabBarController = require('./TabBarController');
    //var ProfileView = require('./views/ProfileView');
    var FullImageView = require('./views/FullImageView');
    var NavBarView = require('./views/NavBarView');
    var LocationView = require('./views/LocationView');
    var PhoneFrameView = require('./PhoneFrameView');
    //var AnimationController = require('famous-flex/AnimationController');
    //var Easing = require('famous/transitions/Easing');

    // create the main context
    //Engine.setOptions({appMode: false});
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
        //{tabItem: 'Profile', view: new ProfileView()},
        {tabItem: 'Profile', view: new NavBarView()},
        {tabItem: 'Map', view: new LocationView()}
    ]);
    phoneFrameView.setContent(tabBarController);

    // Since AppMode is disabled, we conditionally disable scrolling ourselves
    // when a normal view is active, and enable it when the map-view is active.
    /*var disableScrolling = true;
    window.addEventListener('touchmove', function(event) {
        if (disableScrolling) {
            event.preventDefault();
        }
    });
    tabBarController.tabBar.on('tabchange', function(event) {
        disableScrolling = (event.index !== 2);
    });*/
});
