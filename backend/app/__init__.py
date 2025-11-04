#where app is created
from flask import Flask

from flask_mongoengine import MongoEngine

db=MongoEngine()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('config')
    app.config.from_pyfile('config.py',silent=True) #this just loads the configs from instance

    db.init_app(app) #this connects mongoengine to the app

    from . import auth
    app.register_blueprint(auth.bp)

    from . import parking
    app.register_blueprint(parking.bp)

    return app