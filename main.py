import webapp2
import logging
import urllib2

# ndb is the new version of db
# from google.appengine.ext import db
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util

def handleError(e):
  logging.info('Need to handle the error!')

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(template.render('index.html', {}))

# This class is no longer needed now that I'm using GeoPlanet for data instead of the google maps api
#       But is also a good example of a places API attempt at searching for Airport data
class AirportSearchHandler(webapp2.RequestHandler):
    def get(self, *args, **kwargs):
      #url = self;
      search_query = self.request.get('search_query')
      search_query_prefix = '&query='

      logging.info(self)
      logging.info('----------------------------')
      logging.info(search_query)
      logging.info('----------------------------')
      logging.info(args)
      logging.info('----------------------------')
      logging.info(kwargs)
      logging.info('----------------------------')

      test = 'https://maps.googleapis.com/maps/api/place/search/json?types="cafe|bakery"&location=37.787930,-122.4074990&radius=5000&sensor=false&key='
     
      #airportSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/search/json?sensor=false&rankby=prominence&keyword=airport&types=airport'
      #googlePlacesAPIKey = '&key='
      #queryKey = '&name='
      #fullSearchUrl = airportSearchBaseUrl + googlePlacesAPIKey + queryKey + search_query
      
      cssairportmapsAPIKey = '';
      apiprojectAPIKey = '';
      APIKeyPrefix = '&key='
      airportTextSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?name=airport&types=airport&sensor=false'
      fullTextSearchUrl = airportTextSearchBaseUrl + APIKeyPrefix + apiprojectAPIKey + search_query_prefix + search_query
      logging.info(fullTextSearchUrl)
      logging.info('search query:(' + search_query + ')')
      try:
        results = urllib2.urlopen(fullTextSearchUrl)
        logging.info('url\'s urllib2.urlopen \'results\'-type listed below') 
        logging.info(type(results))
        logging.info(results)
        output = results.read()
        logging.info('reuslts.read() Data listed below') 
        logging.info(type(output))
        logging.info(output)
        self.response.out.write(output)
      except urllib2.URLError, e:
        logging.info('Error searching for airports!')
        handleError(e)

      logging.info('This app should never get here!')

app = webapp2.WSGIApplication([
    webapp2.Route('/airportsearch', handler=AirportSearchHandler),
    ('/debug', DebugHandler),
    ('/', MainHandler)
], debug=True)
