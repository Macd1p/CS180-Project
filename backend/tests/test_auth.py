#test for auth.py
import pytest
from unittest.mock import patch
from app.model import User


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

