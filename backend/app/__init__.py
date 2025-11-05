#where app is created
from flask import Flask
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from flask_jwt_extended import JWTManager  
import cloudinary

db=MongoEngine()
jwt = JWTManager()


def create_app():
    
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('config')
    app.config.from_pyfile('config.py',silent=True) #this just loads the configs from instance
    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key= app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )

    db.init_app(app) #this connects mongoengine to the app
    jwt.init_app(app) #connects the jtw tool for our files
    
    CORS(app, resources={
    r"/auth/*": {"origins": "http://localhost:3000"},
    r"/api/*": {"origins": "http://localhost:3000"} })
    from . import auth
    app.register_blueprint(auth.auth_bp)

    from . import parking
    app.register_blueprint(parking.parking_bp)

    return app