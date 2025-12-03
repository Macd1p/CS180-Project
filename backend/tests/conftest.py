#pytest configuration and fixtures
import pytest
from unittest.mock import patch, MagicMock
from mongoengine import connect, disconnect
from app import create_app


@pytest.fixture(scope='function') #create application for testing
def app():
    # Use a test database
    app = create_app()
    app.config['TESTING'] = True
    app.config['MONGODB_SETTINGS'] = {
        'db': 'parking_app_test_db',
        'host': 'localhost',
        'port': 27017
    }
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    app.config['GOOGLE_CLIENT_ID'] = 'test-google-client-id'
    app.config['CLOUDINARY_CLOUD_NAME'] = 'test-cloud'
    app.config['CLOUDINARY_API_KEY'] = 'test-api-key'
    app.config['CLOUDINARY_API_SECRET'] = 'test-api-secret'
    
    # disconnect any existing connections to our program
    try:
        disconnect()
    except Exception:
        pass
    
    # connect to our test database
    connect('parking_app_test_db', host='localhost', port=27017)
    
    with app.app_context():
        #this will clear the database before each test for documents
        from app.model import User, ParkingSpot, Comment, Message
        User.objects().delete()
        ParkingSpot.objects().delete()
        Comment.objects().delete()
        Message.objects().delete()
        
        yield app
    
    #cleans up after test
    with app.app_context():
        try:
            from app.model import User, ParkingSpot, Comment, Message
            User.objects().delete()
            ParkingSpot.objects().delete()
            Comment.objects().delete()
            Message.objects().delete()
        except Exception:
            pass
    
    try: 
        disconnect()
    except Exception:
        pass


@pytest.fixture 
def client(app): #creates test client
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app): #cli runner
    """Create test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_user_data(): # reusable user data
    """Sample user data for testing."""
    return {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'testpassword123',
        'firstname': 'Test',
        'lastname': 'User'
    }


@pytest.fixture
def sample_google_user_data(): #
    # Sample Google user data for testing.
    return {
        'email': 'google@example.com',
        'name': 'Google User',
        'sub': 'google-user-id-123'
    }


@pytest.fixture
def auth_token(client, sample_user_data):
   # Get auth token for sample user.
    # Register user
    client.post('/auth/register', json=sample_user_data)
    
    #login to get token
    response = client.post('/auth/login', json={
        'email': sample_user_data['email'],
        'password': sample_user_data['password']
    })
    
    if response.status_code == 200:
        data = response.get_json()
        return data.get('access_token')
    return None


@pytest.fixture
def mock_google_verify_token(sample_google_user_data):
    # Mock for Google token verification.
    with patch('app.auth.id_token.verify_oauth2_token') as mock_verify:
        mock_verify.return_value = {
            'email': sample_google_user_data['email'],
            'name': sample_google_user_data['name'],
            'sub': sample_google_user_data['sub']
        }
        yield mock_verify

