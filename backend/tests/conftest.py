import pytest
import sys
from pathlib import Path

#add backend directory to sys.path to allow imports from any location
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app import create_app
from flask_mongoengine import MongoEngine
from mongoengine import disconnect, connect
import mongomock
from unittest.mock import MagicMock

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['MONGODB_SETTINGS'] = {
        'db': 'testdb',
        'mongo_client_class': mongomock.MongoClient,
        'alias': 'default'
    }
    # disables CSRF 
    app.config['WTF_CSRF_ENABLED'] = False
    
    #mock cloudinary to avoid errors during app creation if it tries to connect
    app.config['CLOUDINARY_CLOUD_NAME'] = 'test'
    app.config['CLOUDINARY_API_KEY'] = 'test'
    app.config['CLOUDINARY_API_SECRET'] = 'test'

    disconnect() #disconnect from any previous connections
    
    connect('testdb', mongo_client_class=mongomock.MongoClient, alias='default')

    ctx = app.app_context()
    ctx.push()

    yield app

    ctx.pop()
    disconnect() #clean up

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def mock_google_verify(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr('google.oauth2.id_token.verify_oauth2_token', mock)
    return mock
