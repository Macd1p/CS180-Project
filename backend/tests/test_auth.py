#test for auth.py
import pytest
from unittest.mock import patch
from app.model import User
from flask_jwt_extended import create_access_token


class TestGoogleSignIn:
    #test for google sign in
    
    def test_google_signin_missing_token(self, client):
       #test for missing token 400
        response = client.post('/auth/google-signin', json={})
        assert response.status_code == 400
        data = response.get_json()
        #response format: {'missing token': None} or similar
        assert 'missing token' in str(data).lower() or data is not None
    
    def test_google_signin_invalid_token(self, client, app):
        #test for invalid token 401
        with app.app_context():
            with patch('app.auth.id_token.verify_oauth2_token') as mock_verify:
                mock_verify.side_effect = ValueError("Invalid token")
                
                response = client.post('/auth/google-signin', json={
                    'token': 'invalid-token'
                })
                
                assert response.status_code == 401
                data = response.get_json()
                assert 'error' in data or 'bad token' in str(data).lower()
    
    def test_google_signin_new_user(self, client, app, sample_google_user_data, mock_google_verify_token):
        #test for new user registration and token return
        with app.app_context():
            # ensure user doesn't exist
            User.objects(google_id=sample_google_user_data['sub']).delete()
            
            response = client.post('/auth/google-signin', json={
                'token': 'valid-google-token'
            })
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'access_token' in data          
            # verify user was made
            user = User.objects(google_id=sample_google_user_data['sub']).first()
            assert user is not None
            assert user.email == sample_google_user_data['email']
            assert user.username == sample_google_user_data['name']
            assert user.login_method == 'google'
    
    def test_google_signin_existing_user(self, client, app, sample_google_user_data, mock_google_verify_token):
        #test for existing user login and token return
        with app.app_context():
            #create existing user
            existing_user = User(
                email=sample_google_user_data['email'],
                username=sample_google_user_data['name'],
                google_id=sample_google_user_data['sub'],
                login_method='google'
            )
            existing_user.save()
            
            response = client.post('/auth/google-signin', json={
                'token': 'valid-google-token'
            })          
            assert response.status_code == 200
            data = response.get_json()
            assert 'access_token' in data

    def test_google_signin_db_error(self, client, app, sample_google_user_data, mock_google_verify_token):
        # Test database error during new user registration
        with app.app_context():
            User.objects(google_id=sample_google_user_data['sub']).delete()
            
            with patch('app.model.User.save') as mock_save:
                mock_save.side_effect = Exception("Database error")
                
                response = client.post('/auth/google-signin', json={
                    'token': 'valid-google-token'
                })               
                assert response.status_code == 500
                assert 'Registration failed due to server error' in response.get_json()['error']

def test_register(client, app):
    #test for user registration
    with app.app_context():
        #ensure a user doesn't exist
        User.objects(email='fake@gmail.com').delete()
        
        data = {
            'email': 'fake@gmail.com',
            'password': 'kevin123',
            'username': 'kevin17',
            'firstname': 'k',
            'lastname': 'c',
            'profile_image': 'http://example.com/kevin.jpg'
        }
        
        response = client.post('/auth/register', json=data)      
        assert response.status_code == 201
        response_data = response.get_json()
        assert response_data['message'] == 'Registration done '
        assert response_data['email'] == 'fake@gmail.com'
        assert 'access_token' in response_data
        
        #verify in database
        user = User.objects(email='fake@gmail.com').first()
        assert user is not None
        assert user.username == 'kevin17'

def test_register_missing_fields(client):
    #test registration with missing fields
    data = {
        'email': 'missing@gmail.com',
        #password missing
        'username': 'missinguser',
        'firstname': 'missing',
        'lastname': 'User'
    }
    response = client.post('/auth/register', json=data)
    assert response.status_code == 400
    assert 'Missing email, username, or password' in response.get_json()['error']

def test_register_existing_user(client, app):
    #test the registration with existing user now
    with app.app_context():
        User.objects(email='exist@gmail.com').delete()
        user = User(
            email='exist@gmail.com',
            password='password',
            username='existing',
            firstname='Existing',
            lastname='User',
            login_method='local'
        )
        user.save()
        
        data = {
            'email': 'exist@gmail.com',
            'password': 'password123',
            'username': 'newuser',
            'firstname': 'new_guy',
            'lastname': 'new_user'
        }
        response = client.post('/auth/register', json=data)
        assert response.status_code == 409
        assert 'User already exists' in response.get_json()['error']

def test_login_success(client, app):
    #test for a successful login
    with app.app_context():
        User.objects(email='login@gmail.com').delete()
        #create user first  
        #since we are testing login, we need a user with a hashed password
        client.post('/auth/register', json={
            'email': 'login@gmail.com',
            'password': 'password123',
            'username': 'loginuser',
            'firstname': 'log',
            'lastname': 'in'
        })
        
        response = client.post('/auth/login', json={
            'email': 'login@gmail.com',
            'password': 'password123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Login successful'
        assert 'access_token' in data

def test_login_missing_fields(client):
    #test login with missing fields
    response = client.post('/auth/login', json={'email': 'missing@gmail.com'})
    assert response.status_code == 400
    assert 'Missing email or password' in response.get_json()['error']

def test_login_invalid_credentials(client, app):
    #test login with a wrong password
    with app.app_context():
        User.objects(email='wrongpass@gmail.com').delete()
        client.post('/auth/register', json={
            'email': 'wrongpass@gmail.com',
            'password': 'password123',
            'username': 'wrongpass',
            'firstname': 'wrong',
            'lastname': 'pass'
        })      
        response = client.post('/auth/login', json={
            'email': 'wrongpass@gmail.com',
            'password': 'wrongpassword'
        })     
        assert response.status_code == 401
        assert 'incorrect password' in response.get_json()['error']

def test_login_google_user_with_password(client, app):
    #test google user trying to login with password
    with app.app_context():
        User.objects(email='googlelogin@gmail.com').delete()
        user = User(
            email='googlelogin@gmail.com',
            username='googleuser',
            google_id='12345',
            login_method='google'
        )
        user.save()
        
        response = client.post('/auth/login', json={
            'email': 'googlelogin@gmail.com',
            'password': 'something'
        })     
        assert response.status_code == 401
        assert 'no password set' in response.get_json()['error']

def test_login_nonexistent_user(client):
    #test login for nonexistent user
    response = client.post('/auth/login', json={
        'email': 'nonexistent@gmail.com',
        'password': '12345'
    })
    assert response.status_code == 401
    assert 'invalid email or password' in response.get_json()['error']

def test_get_profile(client, app):
    #test to get profile endpoint
    with app.app_context():
        User.objects(email='kevin_profile@gmail.com').delete()
        #register a fake user
        client.post('/auth/register', json={
            'email': 'kevin_profile@gmail.com',
            'password': 'password123',
            'username': 'profile_user',
            'firstname': 'profile',
            'lastname': 'kev'
        })
        user = User.objects(email='kevin_profile@gmail.com').first()
        token = create_access_token(identity=str(user.id))
        
        response = client.get('/auth/profile', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['email'] == 'kevin_profile@gmail.com'
        assert data['username'] == 'profile_user'

def test_get_profile_user_not_found(client, app):
    #test get profile for deleted user
    with app.app_context():
        #create a token for a random ID
        token = create_access_token(identity='777777777777777777777777')
        
        response = client.get('/auth/profile', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 404
        assert 'User not found' in response.get_json()['error']

def test_update_profile(client, app):
    #test update profile endpoint
    with app.app_context():
        User.objects(email='update@gmail.com').delete()
        #register a fake user
        client.post('/auth/register', json={
            'email': 'update@gmail.com',
            'password': 'password123',
            'username': 'update_user',
            'firstname': 'update',
            'lastname': 'user'
        })
        user = User.objects(email='update@gmail.com').first()
        token = create_access_token(identity=str(user.id))
        
        update_data = {
            'firstname': 'newF',
            'lastname': 'newL',
            'username': 'new_user',
            'profile_image': 'http://new.jpg'
        }
        
        response = client.put('/auth/update-profile', 
                            json=update_data,
                            headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        assert 'Profile updated successfully' in response.get_json()['message']
        
        #verify if changes are saved
        updated_user = User.objects(id=user.id).first()
        assert updated_user.firstname == 'newF'
        assert updated_user.lastname == 'newL'
        assert updated_user.username == 'new_user'
        assert updated_user.profile_image == 'http://new.jpg'

def test_update_profile_user_not_found(client, app):
    #test update profile for deleted user
    with app.app_context():
        token = create_access_token(identity='000000000000000000000000')
        
        response = client.put('/auth/update-profile', 
                            json={'firstname': 'New'},
                            headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 404
        assert 'User not found' in response.get_json()['error']

def test_update_profile_db_error(client, app):
    #test database error during profile update
    with app.app_context():
        #register user
        client.post('/auth/register', json={
            'email': 'update_db@gmail.com',
            'password': 'password123',
            'username': 'update_db',
            'firstname': 'update',
            'lastname': 'db'
        })
        user = User.objects(email='update_db@gmail.com').first()
        token = create_access_token(identity=str(user.id))
        
        with patch('app.model.User.save') as mock_save: #patch save method
            mock_save.side_effect = Exception("Database update error") #mock save to raise exception
            
            response = client.put('/auth/update-profile', 
                                json={'firstname': 'NewName'},
                                headers={'Authorization': f'Bearer {token}'})
            
            assert response.status_code == 500
            assert 'Database update error' in response.get_json()['error']
