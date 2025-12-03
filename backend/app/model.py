#blueprint for database
#pip install flask flask-mongoengine
from . import db #imports the database from init file
from datetime import datetime

class User(db.Document): #idk the database set up yet
    email= db.StringField(required=True, unique=True)
    username = db.StringField(required=True)
    google_id = db.StringField() #this is just to store the unique id google gives us back
    password = db.StringField()
    firstname= db.StringField()
    lastname= db.StringField()
    login_method= db.StringField()
    profile_image = db.StringField()


class ParkingSpot(db.Document):
    
    description=db.StringField()
    url_for_images=db.StringField()
    tags=db.ListField(db.StringField())
    
    
    # Required fields
    title = db.StringField(required=True, max_length=100)
    address = db.StringField(required = True, max_length=200)
    
    # Coordinates
    lat = db.FloatField()
    lng = db.FloatField()
    
    
    # Owner reference
    owner = db.ReferenceField(User, required=True)
    
    # Timestamps
    created_at = db.DateTimeField(default=datetime.now)
    updated_at = db.DateTimeField(default=datetime.now)
    likes = db.ListField(db.ReferenceField(User))
    
    meta = {
        'collection': 'parking_spots',
        'indexes': [
            'owner'
        ]
    }
    
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.now()
        self.updated_at = datetime.now()
        return super(ParkingSpot, self).save(*args, **kwargs)
    
class Comment(db.Document):
    text = db.StringField(required=True)
    author = db.ReferenceField('User', required=True)
    parking_spot = db.ReferenceField('ParkingSpot', required=True)
    created_at = db.DateTimeField(default=datetime.utcnow)
    likes = db.ListField(db.ReferenceField(User))
    
    meta = {
        'collection': 'comments',
        'indexes': [
            'parking_spot',
            'created_at'
        ]
    }
class Message(db.Document):
    sender = db.ReferenceField(User, required=True)
    receiver = db.ReferenceField(User, required=True)
    message = db.StringField(required=True)
    created_at = db.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'messages',
        'indexes': [
            'sender',
            'receiver',
            'created_at'
        ]
    }