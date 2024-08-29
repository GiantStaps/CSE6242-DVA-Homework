from Q1 import TMDBAPIUtils
import http.client
import json
import csv
import requests as re
import time

movie_id = '329'
util = TMDBAPIUtils(api_key='0952c64efc9500a3a556268cbce792c0')

print(len(util.get_movie_cast(movie_id)))