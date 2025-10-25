
from flask import(
    Blueprint, jsonify,request, current_app
)
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_jwt_extended import create_access_token
from .model import User



auth_bp=Blueprint('auth',__name__,url_prefix='/auth')

@auth_bp.route('/google-signin', method=(['POST']))
#this function is handling the signing in and will let our users make a account
def google_signin():
    # this is where I get the token from frontend
    data=request.json()
    google_token= data.get('token')

    if not google_token:
        return jsonify({'missing token'}),400

    try:
        #verifys token with the google servers
        id_info=id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            current_app.config['GOOGLE_CLIENT_ID'])
        users_email=id_info['email']
        user_name=id_info.get('name') #just getting info from token if verified

        #query to see if there is any record
        user=User.objects(email=users_email).first()

        if not user:
            #registers user
            user=User(
                email=users_email,
                username=user_name
            )
            user.save()
        access_token=create_access_token(identity=str(user.id))

        return jsonify(access_token=access_token),200 #sending the access token
    except ValueError as error:
        print(f"token failed: {error}")
        return jsonify({"error":"bad token"}), 401



