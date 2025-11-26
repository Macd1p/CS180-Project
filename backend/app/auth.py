
from flask import(
    Blueprint, jsonify,request, current_app
)
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
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
        return jsonify({'error': 'missing token'}),400

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
                google_id=google_user_id,
                login_method= 'google'
            )
            try:
                user.save()
                print(f'{users_email} is registered')
            except Exception as e:
                print(f"Database save failed for new Google user: {e}")
                return jsonify({"error": "Registration failed due to server error"}), 500
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

    user_firstname= data.get('firstname')

    user_lastname= data.get('lastname')
    
    #check if entrys are empty and that user does not already exist
    if not all([user_email, user_password, user_name,user_firstname,user_lastname]):
        return jsonify({"error": "Missing email, username, or password,or first and last name"}), 400
    
    
    if User.objects(email=user_email).first():
        return jsonify({"error": "User already exists"}), 409
    
#hash password
    hash_password = bcrypt.generate_password_hash(user_password).decode("utf-8")

   

    #save in database
    user=User(
        email=user_email,
        password=hash_password,
        username=user_name,
        firstname= user_firstname,
        lastname= user_lastname,
        login_method='local',
        profile_image=data.get('profile_image')#saving profile image in database
    )
    user.save()
    #create access token for registration
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration done ",
        "email": user_email,
        "access_token": access_token
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
        return jsonify({"error": "invalid email or password"}), 401
    
    if user.login_method=='google':
        return jsonify({"error":"no password set for this email make an account"}), 401
    #check if password is correct
    checker_password= bcrypt.check_password_hash(user.password,user_password)

    if checker_password == False:
        return jsonify({"error": "incorrect password"}), 401
    #create access token for login and send it
    else:
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token
        }), 200 







@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
#updates user profile details for account creation
def update_profile():
    current_user_id = get_jwt_identity()
    data = request.json
    user = User.objects(id=current_user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404     
    if 'firstname' in data:
        user.firstname = data['firstname']
    
    if 'lastname' in data:
        user.lastname = data['lastname']
    
    if 'username' in data:
        user.username = data['username']
        
    if 'profile_image' in data:
        user.profile_image = data['profile_image']#saving profile image user chooses
        
    try:
        user.save()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
