SECRET_KEY = 'dev' 

# Default database settings (for local development)
MONGODB_SETTINGS = {
    'db': 'parking_app_db_dev',
    'host': 'localhost',
    'port': 27017
}

# Placeholders for Google keys
GOOGLE_CLIENT_ID = None
GOOGLE_CLIENT_SECRET = None
JWT_SECRET_KEY = None
JWT_ACCESS_TOKEN_EXPIRES = 86400 #24 hours instead of 15 min expiration for token

WTF_CSRF_ENABLED = False #makes sure csrf does not work for blocking
