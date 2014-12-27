Mapping Maps
------------
A simple app that searches a remote datasource for airports given a textual input, retrieves data about a particular airport when selected, and plots a geo arc on an embedded google map widget between two selected airports. Airport search results are fetched automatically using Typeahead.js and its Bloodhound remote search engine. GeoPlanet is used as a data source, as their web service allows for string queries to search for a particular type of place, which I have filtered to airports.

Once a result set of airports has been returned by the web service to the Bloodhound search engine, the search engine tokenizes a number of different properties of each airport, and uses these tokens to better prioritize results to an ordering in the result-set. Toeknizing becomes useful as an ordering mechanism because it can match multiple types of parameters, such as both an airport name and its city. Once a particular airport is selected, the coordinates are used to create a Google Maps marker and plot it on an embedded map windowed widget. Once 2 airports have been marked on the map, a geo-arc is drawn between them.

Dependencies
------------
The app is hosted using a Google App Engine python webapp2 server. The server just spits the HTML/JS/CSS files to the browser, where the app makes remote requests for airport data based on search queries using AJAX POST requests. It would be helpful to install the Google App Engine Launcher app and run a local webapp server using the app.yaml file included with this project, but not necessary. If you don't want to host it on a local web server just open the index.html file.

A number of external libraries were used in the development of this project:
jQuery.js - Used for its usefulness in developing javascript websites
Bootstrap.js - Used for general out of the box theming
Typeahead.js - Used for the autocomplete drop-downs for executing airport searches
Knockout.js - Used for data-binding and UI responsiveness
Underscore.js - Used for various utility functions and set-based operations
Handlebars.js - Used for template rendering on the autocomplete drop-downs
LatLong.js - A library included to make a distance calculation from 2 latlong coordinates. This was freely available and hosted online at www.movable-type.co.uk.


Requirements To Run This App
-----------------------------
* This app can be run without a web-server, since it makes all its requests for airport data from the client, but it has been developed so it can be deployed to a remote GAE site, so this project is also set up to run on the Google App Engine Launcher.
* This link provides a comprehensive guide for getting started with Google App Engine and setting up the local web server. It has a full setup guide for those who prefer to get their direction straight from the source.
** https://developers.google.com/appengine/training/intro/gettingstarted#install
* Download and install the App Engine SDK for Python and App Engine Launcher at this link, following the instructions provided:
* https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python
* Download and unzip the source folder to this project
* Open the App Engine Launcher, and click the plus (+) button to create a new application
* Choose the directory that the folder is in, and set the application name to the name in the app.yaml file, 'cssairportmaps'
** If you wanted to re-deploy this, you can change this to whatever your GAE appid is for your site
* Set a port for the app to run on, Run the app, and then navigate to the page in your browser.
* Hooray! You're done!
* If you want to see it hosted on my GAE account, you can find the app at cssairportmaps.appspot.com


Future Enhancements I Haven't Had Time For Yet
-----------------------------------------------
* Create a better package to host that includes all dependencies and automatic updating tools like bower
* Add the ability to have an arbitrary number of airports and stops, and the ability to reconfigure the ordering of the airports with the map automatically reconfiguring the hops between airports.
