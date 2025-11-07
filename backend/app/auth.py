
from flask import(
    Blueprint, jsonify,request, current_app
)
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_jwt_extended import create_access_token
from .model import User
from . import bcrypt



auth_bp=Blueprint('auth',__name__,url_prefix='/auth')

@auth_bp.route('/google-signin', methods=['POST'])
#this function is handling the signing in and will let our users make a account
def google_signin():
    # this is where I get the token from frontend
    data=request.json
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
        google_user_id=id_info['sub'] #sub for subject

        #query to see if there is any record
        user=User.objects(google_id=google_user_id).first()

        if not user:
            #registers user
            user=User(
                email=users_email,
                username=user_name,
                google_id=google_user_id
            )
            user.save()
            print(f'{users_email} is registered')
        else:
            print(f'{users_email} logged in')
        access_token=create_access_token(identity=str(user.id))

        return jsonify(access_token=access_token),200 #sending the access token
    except ValueError as error:
        print(f"token failed: {error}")
        return jsonify({"error":"bad token"}), 401
    

@auth_bp.route('/register', methods=['POST'])

def register():
    data= request.json

    user_email= data.get('email')

    user_password= data.get('password')

    user_name = data.get('username')
    
    
    #check if entrys are empty and that user does not already exist
    if not all([user_email, user_password, user_name]):
        return jsonify({"error": "Missing email, username, or password"}), 400
    
    
    if User.objects(email=user_email).first():
        return jsonify({"error": "User already exists"}), 409
    
#hash password
    hash_password = bcrypt.generate_password_hash(user_password).decode("utf-8")

   

    #save in database
    user=User(
        email=user_email,
        password=hash_password,
        username=user_name
    )
    user.save()
    return jsonify({
        "message": "Registration done ",
        "email": user_email
    }), 201
    

@auth_bp.route('/login', methods=['POST'])

def login():
    data= request.json

    user_email= data.get('email')
    user_password= data.get('password')
    
    #make sure they are not empty
    if not all([user_email, user_password]):
        return jsonify({"error": "Missing email or password for login"}), 400
     
    
    
    user= User.objects(email=user_email).first()
    #make sure there is already an account
    if not user:
        return jsonify({"error": "no account exist"}), 409
    #check if password is correct
    checker_password= bcrypt.check_password_hash(user.password,user_password)

    if checker_password == False:
        return jsonify({"incorrect password"}), 401
    #create access token for login and send it
    else:
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token
        }), 200 







