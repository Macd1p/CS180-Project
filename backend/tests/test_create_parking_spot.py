import pytest
from app.model import User, ParkingSpot
from flask_jwt_extended import create_access_token

def test_create_parking_spot_with_coordinates(client):
    #create user
    user = User(
        email='coord_test@example.com',
        password='password',
        username='coord_tester',
        firstname='Coord',
        lastname='Tester',
        login_method='local'
    )
    user.save()
    
    #create access token
    access_token = create_access_token(identity=str(user.id))
    
    #post data with coordinates
    post_data = {
        'title': 'Test Spot with Coords',
        'address': '123 Test St',
        'description': 'A test spot',
        'lat': 34.0522,
        'lng': -118.2437,
        'tags': 'test coords'
    }
    
    #send post request
    response = client.post(
        '/api/parking/spots',
        json=post_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    #verify response
    assert response.status_code == 201
    assert response.json['message'] == 'Parking spot created successfully'
    
    #verify data in DB
    spot_id = response.json['spot']['id']
    spot = ParkingSpot.objects(id=spot_id).first()
    
    assert spot is not None
    assert spot.title == 'Test Spot with Coords'
    assert spot.lat == 34.0522
    assert spot.lng == -118.2437
    assert spot.owner == user
