import pytest
from app.model import User
from app import bcrypt
import json

def test_register_success(client):
    data = {
        'email': 'test@gmail.com',
        'password': 'password123',
        'username': 'testuser',
        'firstname': 'Test',
        'lastname': 'User'
    }
    response = client.post('/auth/register', json=data)
    assert response.status_code == 201
    assert response.json['message'] == 'Registration done '
    assert response.json['email'] == 'test@gmail.com'
    
    #verify user in our DB
    user = User.objects(email='test@gmail.com').first()
    assert user is not None
    assert user.username == 'testuser'

def test_register_missing_fields(client):
    data = {
        'email': 'test@gmail.com',
        # missing password and others
    }
    response = client.post('/auth/register', json=data)
    assert response.status_code == 400
    assert 'Missing email, username, or password' in response.json['error']

def test_register_existing_user(client):
    #create the user first
    user = User(
        email='existing@gmail.com',
        password='hashedpassword',
        username='existing',
        firstname='Exist',
        lastname='Ing',
        login_method='local'
    )
    user.save()

    data = {
        'email': 'existing@gmail.com',
        'password': 'password123',
        'username': 'newname',
        'firstname': 'New',
        'lastname': 'User'
    }
    response = client.post('/auth/register', json=data)
    assert response.status_code == 409
    assert response.json['error'] == 'User already exists'

def test_login_success(client):
    #create a user
    pw_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
    user = User(
        email='login@gmail.com',
        password=pw_hash,
        username='loginuser',
        firstname='Login',
        lastname='User',
        login_method='local'
    )
    user.save()

    data = {
        'email': 'login@gmail.com',
        'password': 'password123'
    }
    response = client.post('/auth/login', json=data)
    assert response.status_code == 200
    assert response.json['message'] == 'Login successful'
    assert 'access_token' in response.json

def test_login_invalid_credentials(client):
    #create a user
    pw_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
    user = User(
        email='wrong@gmail.com',
        password=pw_hash,
        username='wronguser',
        firstname='Wrong',
        lastname='User',
        login_method='local'
    )
    user.save()

    data = {
        'email': 'wrong@gmail.com',
        'password': 'wrongpassword'
    }
    response = client.post('/auth/login', json=data)
    assert response.status_code == 401
    assert response.json['error'] == 'incorrect password'

def test_login_google_account_no_password(client):
    user = User(
        email='google@gmail.com',
        username='googleuser',
        google_id='12345',
        login_method='google'
    )
    user.save()

    data = {
        'email': 'google@gmail.com',
        'password': 'any'
    }
    response = client.post('/auth/login', json=data)
    assert response.status_code == 401
    assert response.json['error'] == 'no password set for this email make an account'

def test_google_signin_success_new_user(client, mock_google_verify):
    mock_google_verify.return_value = {
        'email': 'newgoogle@gmail.com',
        'name': 'New Google User',
        'sub': 'google123'
    }

    data = {'token': 'valid_token'}
    response = client.post('/auth/google-signin', json=data)
    
    assert response.status_code == 200
    assert 'access_token' in response.json
    
    user = User.objects(email='newgoogle@gmail.com').first()
    assert user is not None
    assert user.google_id == 'google123'

def test_google_signin_success_existing_user(client, mock_google_verify):
    user = User(
        email='existinggoogle@gmail.com',
        username='Existing Google',
        google_id='google456',
        login_method='google'
    )
    user.save()

    mock_google_verify.return_value = {
        'email': 'existinggoogle@gmail.com',
        'name': 'Existing Google',
        'sub': 'google456'
    }

    data = {'token': 'valid_token'}
    response = client.post('/auth/google-signin', json=data)
    
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_google_signin_invalid_token(client, mock_google_verify):
    mock_google_verify.side_effect = ValueError('Invalid token')

    data = {'token': 'invalid_token'}
    response = client.post('/auth/google-signin', json=data)
    
    assert response.status_code == 401
    assert response.json['error'] == 'bad token'
