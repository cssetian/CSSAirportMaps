Mapping Maps
------------
A simple app that searches for airports given a string input, retrieves data about a selected airport, and plots geo-arcs on a google map connecting two selected airports. Airport search results are fetched automatically using Typeahead.js and its Bloodhound remote search engine. GeoPlanet is used as a data source, as their web service allows for string queries to search for a particular type of place, which I have filtered to airports. 

Once a result set of airports has been returned by the web service to the Bloodhound search engine, the search engine tokenizes a number of different properties of each airport, and uses these tokens to better match results to an input, for instance being able to match to both an airport name and its city. Once a particular airport is selected, the coordinates are used to create Google Maps markers and plot them on an embedded map widget. Once 2 airports have been marked on the map, a geo-arc is drawn between them.

Dependencies
------------
The app is hosted using a Google App Engine python webapp2 server. This used to be necessary when I was trying to use the Google Places API for data because I couldn't make cross domain AJAX requests and wasn't using Bloodhound at the time, but now because of the Bloodhound remote engine, I can just use that and the base URL and it'll be able to make the request.

Bootstrap was used for general out of the box theming and knockout.js was used for data-binding. Also includes underscore.js for various utility functions, and handlebars.js for template rendering on the autocomplete. A library was also included to make the distance calculation form 2 latlng coordinates. This was freely available and hosted online at www.movable-type.co.uk.

Requirements To Run This App
-----------------------------
* This app can in theory be run without a web-server, but has been developed using one to allow for google app engine deployment, so I cannot guarrantee bug-free functionality when running from the local filesystem, but I suspect it will work the same as the requests I make from the client are a part of the respective client API's that I implemented and not straight AJAX requests to a different domain.
* This link provides a comprehensive guide for getting started with Google App Engine. It has a full setup guide for those who prefer to get their direction straight from the source.
** https://developers.google.com/appengine/training/intro/gettingstarted#install
* Download and install the App Engine SDK for Python and App Engine Launcher at this link, following the instructions provided:
* https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python
* Download and unzip the source folder to this project
* Open the App Engine Launcher, and click the plus (+) button to create a new application
* Choose the directory that the folder is in, and set the application name to the name in the app.yaml file, 'cssairportmaps'
** If you wanted to re-deploy this, you can change this to whatever your GAE appid is for the site
* Set a port for the app to run on, Run the app, and then navigate to the page in your browser.
* Hooray! You're done!
* If you want to see it hosted on my GAE account, you can find the app at cssairportmaps.appspot.com


Future Enhancements I Haven't Had Time For Yet
-----------------------------------------------
* Make the tab/enter responses when searching feel more intuitive
* Handle partial strings in the remote search
* Create a better package to host that includes all dependencies and automatic updating tools like bower
* Add the ability to have an arbitrary number of airports and stops, and the ability to reconfigure the ordering of the airports with the map automatically reconfiguring the hops between airports.
