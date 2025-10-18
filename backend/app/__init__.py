#where app is created
from flask import Flask

from flask_mongoengine import MongoEngine

db=MongoEngine()

def our_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_pyfile('config.py') #this just loads the configs from instance

    db.init_app() #this connects mongoengine to the app


    return app