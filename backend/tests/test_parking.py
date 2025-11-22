import pytest
from app.model import User, ParkingSpot
from flask_jwt_extended import create_access_token
import json

def test_update_post_success(client):
    #create a user
    user = User(
        email='postowner@gmail.com',
        password='password',
        username='postowner',
        firstname='Post',
        lastname='Owner',
        login_method='local'
    )
    user.save()
    
    #create a parking spot owned by user
    spot = ParkingSpot(
        title='Original Title',
        description='Original description',
        lotnumber='A123',
        url_for_images='http://example.com/image1.jpg',
        tags=['outdoor', 'free'],
        owner=user
    )
    spot.save()
    
    #create access token for user
    access_token = create_access_token(identity=str(user.id))
    
    #update data
    update_data = {
        'title': 'Updated Title',
        'description': 'Updated description',
        'tags': ['covered', 'paid']
    }
    
    response = client.put(
        f'/api/parking/update-post/{str(spot.id)}',
        json=update_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['message'] == 'Parking spot updated successfully'
    
    #verify update in DB
    updated_spot = ParkingSpot.objects(id=spot.id).first()
    assert updated_spot.title == 'Updated Title'
    assert updated_spot.description == 'Updated description'
    assert 'covered' in updated_spot.tags

def test_delete_post_success(client):
    #create a user
    user = User(
        email='deleter@gmail.com',
        password='password',
        username='deleter',
        firstname='Del',
        lastname='Eter',
        login_method='local'
    )
    user.save()
    
    #create a parking spot
    spot = ParkingSpot(
        title='To Be Deleted',
        description='This will be deleted',
        lotnumber='C789',
        url_for_images='http://example.com/delete.jpg',
        tags=['temporary'],
        owner=user
    )
    spot.save()
    spot_id = str(spot.id)
    
    #create access token
    access_token = create_access_token(identity=str(user.id))
    
    response = client.delete(
        f'/api/parking/{spot_id}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['message'] == 'post deleted'
    
    #verify deletion from DB
    deleted_spot = ParkingSpot.objects(id=spot_id).first()
    assert deleted_spot is None
