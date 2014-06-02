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

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(template.render('index.html', {}))

class AirportSearchHandler(webapp2.RequestHandler):
    def get(self):
      searchInput = self.request.get('searchInput')
      logging.info('Search Input Sent: ' + searchInput)
      url_base = 'http://airports.pidgets.com/v1/airports?format=json&name='
      #url_suffix = '?format=json&callback=alert'
      url = url_base + searchInput #+ url_suffix
      logging.info('Searching for airports! Url Below')
      logging.info(url)

      yql_base_url = 'http://query.yahooapis.com/v1/public/yql'
      yql = 'select * from geo.airports where location=\'' + searchInput + '\'and search_text=\'dance\''
      yql_encoded = urllib.urlencode(yql)
      yql_query_url = yql_base_url + "?q=" + yql_encoded


      #request = urllib2.Request(url)
      results = urllib2.urlopen(url)
      logging.info('Request URLOpened Data Below') 
      logging.info(type(results))
      logging.info(results)
      #logging.info('Got the request! Request Full URL: ' + request.get_full_url())
      output = results.read()
      logging.info('Request Read Data Below') 
      logging.info(type(output))
      logging.info(output)
      self.response.out.write(output)

app = webapp2.WSGIApplication([
    ('/AirportSearch', AirportSearchHandler),
    ('/', MainHandler)
], debug=True)
