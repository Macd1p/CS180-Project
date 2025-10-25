#blueprint for database
#pip install flask flask-mongoengine
from . import db #imports the database from init file
class User(db.document): #idk the database set up yet
    email= db.StringField(required=True, unique=True)
    username = db.StringField(required=True)
    google_id = db.StringField() #this is just to store the unique id google gives us back

