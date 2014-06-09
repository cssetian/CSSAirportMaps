#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import json as simplejson
from webapp2_extras import json as webapp_json
import logging
import urllib
import urllib2
# import requests

# ndb is the new version of db
# from google.appengine.ext import db
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util

def handleError(e):
  logging.info('Need to handle the error!')

class DebugHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(template.render('debug.html', {}))

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(template.render('index.html', {}))

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
      #search_query = kwargs.get('search_query')

      test = 'https://maps.googleapis.com/maps/api/place/search/json?types="cafe|bakery"&location=37.787930,-122.4074990&radius=5000&sensor=false&key=AIzaSyDC0_jxucNVmD3mA40DOUB8463jhdQ0yPE'
      #airportSearchBaseUrl = 'https://maps.googleapis.com/maps/api/place/search/json?sensor=false&rankby=prominence&keyword=airport&types=airport'
      #googlePlacesAPIKey = '&key=' + 'AIzaSyDC0_jxucNVmD3mA40DOUB8463jhdQ0yPE'
      #queryKey = '&name='
      #fullSearchUrl = airportSearchBaseUrl + googlePlacesAPIKey + queryKey + search_query
      cssairportmapsAPIKey = 'AIzaSyDC0_jxucNVmD3mA40DOUB8463jhdQ0yPE'
      apiprojectAPIKey = 'AIzaSyC_i9CE-MZrDZDLY9MdrfukhcEBkatg3Jc'
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
      #searchInput = self.request.get('searchInput')
      #logging.info('Search Input Sent: ' + searchInput)
      #url_base = 'http://airports.pidgets.com/v1/airports?format=json&name='
      #url_suffix = '?format=json&callback=alert'
      #url = url_base + searchInput #+ url_suffix
      #logging.info('Searching for airports! Url Below')
      #logging.info(url)

      #yql_base_url = 'http://query.yahooapis.com/v1/public/yql'
      #yql = 'select * from geo.airports where location=\'' + searchInput + '\'and search_text=\'dance\''
      #yql_encoded = urllib.urlencode(yql)
      #yql_query_url = yql_base_url + "?q=" + yql_encoded


      #request = urllib2.Request(url)
      #results = urllib2.urlopen(url)
      #logging.info('Request URLOpened Data Below') 
      #logging.info(type(results))
      #logging.info(results)
      #logging.info('Got the request! Request Full URL: ' + request.get_full_url())
      #output = results.read()
      #logging.info('Request Read Data Below') 
      #logging.info(type(output))
      #logging.info(output)
      logging.info('This app should never get here!')
      #self.response.out.write(output)

app = webapp2.WSGIApplication([
    #webapp2.Route('/airportsearch<search_query:((\?)([^/\?\.])+)*>', handler=AirportSearchHandler),
    webapp2.Route('/airportsearch', handler=AirportSearchHandler),
    ('/debug', DebugHandler),
    ('/', MainHandler)
], debug=True)
