import pytest
from app.model import User, ParkingSpot
from flask_jwt_extended import create_access_token
import json

def test_update_post_success(client):
    #create a user and save it to the database
    user = User(
        email='kevin@gmail.com',
        password='password',
        username='kevin',
        firstname='kevin',
        lastname='carrillo',
        login_method='local'
    )
    user.save()
    
    #create a parking spot owned by user
    spot = ParkingSpot(
        title='a fake bad parking',
        description='test parking description',
        url_for_images='http://example.com/kevin.jpg',
        tags=['nice!', 'bad_parking'],
        address='400 W Big springs rd',
        owner=user
    )
    spot.save()
    
    #create access token for user
    access_token = create_access_token(identity=str(user.id))
    
    #update data
    update_data = {
        'title': 'new title',
        'description': 'new description',
        'tags': 'covered paid'
    }   
    response = client.put(
        f'/api/parking/update-post/{str(spot.id)}',
        json=update_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['message'] == 'Parking spot updated successfully'
    
    #verify update in database to make sure update works
    updated_spot = ParkingSpot.objects(id=spot.id).first()
    assert updated_spot.title == 'new title'
    assert updated_spot.description == 'new description'
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
        title='delete parking',
        description='delete parking description',
        url_for_images='http://kevin.com/delete.jpg',
        tags=['gone'],
        address='777 Delete Ave',
        owner=user
    )
    spot.save()
    spot_id = str(spot.id)
    
    #create access token for permission
    access_token = create_access_token(identity=str(user.id))   
    response = client.delete( #page is deleted
        f'/api/parking/spots/{spot_id}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['message'] == 'post deleted'
    
    #verify deletion of post in the database
    deleted_spot = ParkingSpot.objects(id=spot_id).first()
    assert deleted_spot is None

def test_create_parking_spot_success(client):
    #test creating a parking spot
    
    #create a user first
    user = User(
        email='post@gmail.com',
        password='password123',
        username='post123',
        firstname='po',
        lastname='st',
        login_method='local'
    )
    user.save()
    access_token = create_access_token(identity=str(user.id))    
    data = {
        'title': 'my very first post',
        'description': 'this is my very first post',
        'address': '123 Parking St',
        'lat': 34.1111,
        'lng': -118.1111,
        'url_for_images': 'http://example.com/post.jpg',
        'tags': 'first new'
    }  
    response = client.post(
        '/api/parking/spots',
        json=data,
        headers={'Authorization': f'Bearer {access_token}'}
    )    
    assert response.status_code == 201
    assert response.json['message'] == 'Parking spot created successfully'
    assert 'id' in response.json['spot']
    assert response.json['spot']['title'] == 'my very first post'
    
    #verify in database that it shows up
    spot = ParkingSpot.objects(title='my very first post').first()
    assert spot is not None   
    user_in_db = User.objects(id=user.id).first()
    assert user_in_db is not None, f"user {user.id} disappeared" #check if user still exists and does not disappear
    assert spot.address == '123 Parking St'
    assert 'new' in spot.tags

def test_get_parking_spots(client):
    #test getting all parking spots
    
    user = User(
        email='getter@gmail.com',
        password='password',
        username='getter',
        firstname='get',
        lastname='ter',
        login_method='local'
    )
    user.save()   
    #create 2 spots
    spot1 = ParkingSpot(
        title='spot 1',
        description='first spot',
        address='111 First St',
        lat=1.0,
        lng=1.0,
        url_for_images='http://img1.jpg',
        tags=['one'],
        owner=user
    )
    spot1.save()
    
    spot2 = ParkingSpot(
        title='spot 2',
        description='second spot',
        address='222 Second St',
        lat=2.0,
        lng=2.0,
        url_for_images='http://img2.jpg',
        tags=['two'],
        owner=user
    )
    spot2.save()
    
    #get all spots   
    response = client.get('/api/parking/spots')
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'spots' in data
    assert len(data['spots']) >= 2    
    #verify data of one spot
    titles = [s['title'] for s in data['spots']]
    assert 'spot 1' in titles
    assert 'spot 2' in titles

def test_get_single_parking_spot(client):
    #test getting a single parking spot
    user = User(
        email='single@gmail.com',
        password='password',
        username='single',
        firstname='sin',
        lastname='gle',
        login_method='local'
    )
    user.save()
    spot = ParkingSpot(
        title='single spot',
        description='the only spot',
        address='1 Single Way',
        lat=3.0,
        lng=3.0,
        url_for_images='http://single.jpg',
        tags=['solo'],
        owner=user
    )
    spot.save()
    response = client.get(f'/api/parking/spots/{str(spot.id)}')
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'spot' in data
    assert data['spot']['title'] == 'single spot'
    assert data['spot']['address'] == '1 Single Way'
    assert data['spot']['owner'] == 'single'
    
    #test for a spot that DNE
    response = client.get('/api/parking/spots/000000000000000000000000')
    assert response.status_code == 404
    assert 'Spot not found' in response.get_json()['error']

def test_like_post(client):
    #test liking and unliking a post  
    user = User(
        email='liker@gmail.com',
        password='password',
        username='liker',
        firstname='li',
        lastname='ker',
        login_method='local'
    )
    user.save()
    access_token = create_access_token(identity=str(user.id))
    
    spot = ParkingSpot(
        title='Spot to Like',
        description='Like this spot',
        address='1 Like St',
        lat=4.0,
        lng=4.0,
        url_for_images='http://like.jpg',
        tags=['like'],
        owner=user
    )
    spot.save()
    
    #like the post
    response = client.post(
        f'/api/parking/spots/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['is_liked'] is True
    assert data['like_count'] == 1
    
    #verify in database
    spot.reload()
    assert user in spot.likes
    
    #unlike the post
    response = client.post(
        f'/api/parking/spots/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data['is_liked'] is False
    assert data['like_count'] == 0
    
    spot.reload()
    assert user not in spot.likes


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

def test_create_parking_spot_user_not_found(client):
    #test creating a parking spot when user does not exist
    
    user = User(
        email='ghost@gmail.com',
        password='password',
        username='ghost',
        firstname='gh',
        lastname='ost',
        login_method='local'
    )
    user.save()
    access_token = create_access_token(identity=str(user.id))
    user.delete()   
    
    data = {
        'title': 'ghost spot',
        'address': '123 Ghost St',
        'lat': 0.0,
        'lng': 0.0
    }   
    response = client.post(
        '/api/parking/spots',
        json=data,
        headers={'Authorization': f'Bearer {access_token}'}
    )   
    assert response.status_code == 404
    assert response.json['error'] == 'User not found'


def test_create_parking_spot_missing_fields(client):
    #test creating a parking spot with missing fields
    user = User(
        email='missing@gmail.com',
        password='password',
        username='missing',
        firstname='mis',
        lastname='sing',
        login_method='local'
    )
    user.save()
    access_token = create_access_token(identity=str(user.id))
    
    #missing title
    data = {
        'address': '123 Missing St',
        'lat': 0.0,
        'lng': 0.0
    }    
    response = client.post(
        '/api/parking/spots',
        json=data,
        headers={'Authorization': f'Bearer {access_token}'}
    )   
    assert response.status_code == 400
    assert 'Missing required field: title' in response.json['error']

def test_create_parking_spot_db_error(client):
    #test server error when creating a parking spot
    from unittest.mock import patch
    user = User(
        email='error@gmail.com',
        password='password',
        username='error',
        firstname='er',
        lastname='ror',
        login_method='local'
    )
    user.save()
    access_token = create_access_token(identity=str(user.id))   
    data = {
        'title': 'Error Spot',
        'address': '123 Error St',
        'lat': 0.0,
        'lng': 0.0
    }
    
    #mock save to raise exception
    with patch('app.parking.ParkingSpot.save') as mock_save:
        mock_save.side_effect = Exception("Database error")
        
        response = client.post(
            '/api/parking/spots',
            json=data,
            headers={'Authorization': f'Bearer {access_token}'}
        )      
        assert response.status_code == 500
        assert response.json['error'] == 'Internal server error'

def test_update_post_db_error(client):
    from unittest.mock import patch
    user = User(email='upderr@g.com', username='updater', password='p', firstname='u', lastname='po', login_method='local')
    user.save()
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    token = create_access_token(str(user.id))
    
    with patch('app.parking.ParkingSpot.save') as mock_save:
        mock_save.side_effect = Exception("DB Error")
        response = client.put(f'/api/parking/update-post/{spot.id}', json={'title': 'new'}, headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 500
        assert response.json['error'] == 'Internal server error'

def test_delete_post_db_error(client):
    from unittest.mock import patch
    user = User(email='delerr@g.com', username='delerr', password='p', firstname='d', lastname='e', login_method='local')
    user.save()
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    token = create_access_token(str(user.id))
  
    with patch('app.parking.ParkingSpot.delete') as mock_delete:
        mock_delete.side_effect = Exception("DB Error")
        response = client.delete(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 500
        assert response.json['error'] == 'internal server error'

def test_update_post_user_not_found(client):
    user = User(email='ghostupd@g.com', username='ghostupd', password='p', firstname='g', lastname='u', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    user.delete()   
    response = client.put(f'/api/parking/update-post/{spot.id}', json={'title': 'new'}, headers={'Authorization': f'Bearer {token}'})
    
    assert response.status_code == 404
    assert response.json['error'] == 'User not found'

def test_delete_post_user_not_found(client):
    user = User(email='ghostdelete@g.com', username='ghostdel', password='p', firstname='g', lastname='d', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    user.delete()
    
    response = client.delete(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'user not found'

def test_get_parking_spots_authenticated_with_likes(client):
    user = User(email='liker_get@g.com', username='liker_get', password='p', firstname='l', lastname='g', login_method='local')
    user.save()
    token = create_access_token(str(user.id))   
    spot = ParkingSpot(title='Liked Spot', address='123 Liked St', owner=user, lat=0, lng=0)
    spot.likes.append(user)
    spot.save()  
    #get spots authenticated
    response = client.get('/api/parking/spots', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200  
    
    data = response.json['spots']
    found_spot = next((s for s in data if s['id'] == str(spot.id)), None)
    
    assert found_spot is not None
    assert found_spot['is_liked'] is True
    assert found_spot['like_count'] == 1

def test_get_single_parking_spot_authenticated_with_likes(client):
    user = User(email='liker_single@g.com', username='liker_single', password='p', firstname='l', lastname='s', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    
    spot = ParkingSpot(title='Single Liked Spot', address='456 Liked St', owner=user, lat=0, lng=0)
    spot.likes.append(user)
    spot.save()
    
    #get single spot authenticated
    response = client.get(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    
    data = response.json['spot']
    assert data['id'] == str(spot.id)
    assert data['is_liked'] is True
    assert data['like_count'] == 1

def test_upload_permission_success(client):
    #test getting upload signature for cloudinary
    from unittest.mock import patch

    user = User(email='upload@g.com', username='upload', password='p', firstname='u', lastname='p', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    
    #mock cloudinary signature generation
    with patch('cloudinary.utils.api_sign_request') as mock_sign:
        mock_sign.return_value = 'mock_signature' 
        response = client.post(
            '/api/parking/generate-signature',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = response.json
        assert data['signature'] == 'mock_signature'
        assert 'timestamp' in data
        assert data['cloud_name'] == 'test-cloud'
        assert data['api_key'] == 'test-api-key'

def test_get_parking_spots_db_error(client):
    from unittest.mock import patch
    user = User(email='geterr@g.com', username='geterr', password='p', firstname='g', lastname='e', login_method='local')
    user.save()
    token = create_access_token(str(user.id))

    with patch('app.parking.ParkingSpot.objects') as mock_objects:
        mock_objects.side_effect = Exception("DB Error")
        response = client.get('/api/parking/spots', headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 500
        assert response.json['error'] == 'Internal server error'

def test_get_single_parking_spot_db_error(client):
    from unittest.mock import patch
    user = User(email='geterr@g.com', username='geterr', password='p', firstname='g', lastname='e', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    
    with patch('app.parking.ParkingSpot.objects') as mock_objects:
        mock_objects.side_effect = Exception("DB Error")
        response = client.get(f'/api/parking/spots/{user.id}', headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 500
        assert response.json['error'] == 'Internal server error'

def test_missing_post_id(client):
    user = User(email='ghost@g.com',username='ghost', password='p', firstname='g', lastname='h', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    
    response = client.put('/api/parking/update-post/000000000000000000000001', json={'title': 'new'}, headers={'Authorization': f'Bearer {token}'})
    
    assert response.status_code == 400
    assert response.json['error'] == 'Missing POST ID'

def test_delete_postnotfound(client):
    user = User(email='ghost@g.com',username='ghost', password='p', firstname='g', lastname='h', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    
    response = client.delete('/api/parking/spots/000000000000000000000001', headers={'Authorization': f'Bearer {token}'})
    
    assert response.status_code == 404
    assert response.json['error'] == 'post not found or unauthorized'


def test_like_usernotfound(client):
    user = User(email='ghostlike@g.com',username='ghostlike', password='p', firstname='g', lastname='h', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    user.delete()
    
    response = client.post(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'User not found'

def test_like_postnotfound(client):
    user = User(email='ghostlike@g.com',username='ghostlike', password='p', firstname='g', lastname='h', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()
    spot.delete()
    
    response = client.post(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'Post not found'


def test_like_db_error(client):
    from unittest.mock import patch
    user = User(email='ghostlike@g.com',username='ghostlike', password='p', firstname='g', lastname='h', login_method='local')
    user.save()
    token = create_access_token(str(user.id))
    spot = ParkingSpot(title='t', address='a', owner=user, lat=0, lng=0)
    spot.save()

    with patch('app.parking.ParkingSpot.objects') as mock_objects:
        mock_objects.side_effect = Exception("DB Error")
        response = client.post(f'/api/parking/spots/{spot.id}', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 500
        assert response.json['error'] == 'internal server error'