/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/*global define, moment, console*/
/*eslint no-use-before-define:0, no-console:0*/

define(function(require) {

    //<webpack>
    require('famous-polyfills');
    require('famous/core/famous.css');
    require('famous-flex/widgets/styles.css');
    require('./styles.css');
    require('./index.html');
    //</webpack>

    // import dependencies
    var Engine = require('famous/core/Engine');
    var TabBarContainer = require('./TabBarContainer');
    var ProfileView = require('./views/ProfileView');

    // create the main context
    var mainContext = Engine.createContext();

    // Create tab-bar container
    var tabBarContainer = new TabBarContainer({
        viewContainer: {
            animations: {
                slide: 'right'
            }
        }
    });
    mainContext.add(tabBarContainer);
    tabBarContainer.setItems([
        {tabItem: 'Profile', view: new ProfileView()},
        {tabItem: 'Profile 2', view: new ProfileView()},
        {tabItem: 'Profile 3', view: new ProfileView()}
    ]);
});
