from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .model import ParkingSpot, User
from datetime import datetime
import cloudinary.utils
import time

parking_bp = Blueprint('parking', __name__, url_prefix='/api/parking')

@parking_bp.route('/spots', methods=['POST'])
@jwt_required()
def create_parking_spot():
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()

        # Required fields for now: title, address, lat, lng
        required_fields = ['title', 'address', 'lat', 'lng']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        parking_spot = ParkingSpot(
            title=data['title'],
            description=data.get('description', ''),
            address=data['address'],
            url_for_images=data.get('url_for_images', ''),  # safe default
            tags=data.get('tags', '').split(),
            owner=user,
            lat=data.get('lat'),
            lng=data.get('lng'),
        )
        
        parking_spot.save()
        
        return jsonify({
            "message": "Parking spot created successfully",
            "spot": {
                "id": str(parking_spot.id),
                "title": parking_spot.title
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error creating parking spot: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@parking_bp.route('/spots', methods=['GET'])
@jwt_required(optional=True)
def get_parking_spots():
    try:
        current_user_id = get_jwt_identity()
        current_user = None
        if current_user_id:
            current_user = User.objects(id=current_user_id).first()

        spots = ParkingSpot.objects().order_by('-created_at')
        
        spots_data = []
        for spot in spots:
            is_liked = False
            if current_user and spot.likes:
                is_liked = current_user in spot.likes

            spots_data.append({
                "id": str(spot.id),
                "title": spot.title,
                "address": spot.address,
                "description": spot.description,
                "url_for_images": spot.url_for_images,
                "tags": spot.tags,
                "owner": getattr(spot.owner, "username", "Unknown"),
                "time_created": spot.created_at,
                "lat": spot.lat,
                "lng": spot.lng,
                "like_count": len(spot.likes) if spot.likes else 0,
                "is_liked": is_liked
            })
        
        return jsonify({"spots": spots_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching parking spots: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@parking_bp.route('/spots/<post_id>', methods=['GET'])
@jwt_required(optional=True)
def get_single_parking_spot(post_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = None
        if current_user_id:
            current_user = User.objects(id=current_user_id).first()

        spot = ParkingSpot.objects(id=post_id).first()
        if not spot:
            return jsonify({"error": "Spot not found"}), 404
        
        is_liked = False
        if current_user and spot.likes:
            is_liked = current_user in spot.likes

        spot_data = {
            "id": str(spot.id),
            "title": spot.title,
            "address": spot.address,
            "description": spot.description,
            "url_for_images": spot.url_for_images,
            "tags": spot.tags,
            "owner": getattr(spot.owner, "username", "Unknown"),
            "time_created": spot.created_at,
            "like_count": len(spot.likes) if spot.likes else 0,
            "is_liked": is_liked
        }
        
        return jsonify({"spot": spot_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching single parking spot: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@parking_bp.route('/generate-signature', methods=['POST'])
@jwt_required() #checks the the token from user
def upload_permission():
    currtime=int(time.time())
    cloud_secret=current_app.config['CLOUDINARY_API_SECRET']
    clouds_api_key= current_app.config['CLOUDINARY_API_KEY']
    clouds_name=current_app.config['CLOUDINARY_CLOUD_NAME']
    
    payload_to_sign={"timestamp":currtime}
    permission_signature=cloudinary.utils.api_sign_request(payload_to_sign,cloud_secret)

    return jsonify({
        "timestamp": currtime,
        "signature": permission_signature,
        "cloud_name": clouds_name,
        "api_key": clouds_api_key,
    }),200


@parking_bp.route('/update-post/<post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    try:
        current_user_id = get_jwt_identity() #get current user id from token
        user = User.objects(id=current_user_id).first()
        
        if not user: #user not found
            return jsonify({"error": "User not found"}), 404
        
        post_to_update= ParkingSpot.objects(id=post_id, owner=user).first() #finds document with id and owner
        
        if not post_to_update:  #missing post id
            return jsonify({"error": "Missing POST ID"}), 400
        
        data= request.get_json()
        
        # update fields if they exist in the request
        for field in ['title', 'description', 'url_for_images']:
            if field in data:
                setattr(post_to_update, field, data[field])
        
        if 'tags' in data:
            post_to_update.tags = data.get('tags', '').split()

        post_to_update.save()
        
        return jsonify({ #success message
            "message": "Parking spot updated successfully",
            "post":  post_to_update.to_json()    
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error updating post: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@parking_bp.route('/spots/<post_id>', methods=['DELETE']) 
@jwt_required()
def delete_post(post_id):
    try:
        current_user_id = get_jwt_identity() #get current user id from token
        user = User.objects(id=current_user_id).first()
        
        if not user: #user not found
            return jsonify({"error": "user not found"}), 404
        
        post_to_delete = ParkingSpot.objects(id=post_id, owner=user).first()
        
        if not post_to_delete: #spot does not exist or user is not owner
            return jsonify({"error": "post not found or unauthorized"}), 404
        
        post_to_delete.delete()
        
        return jsonify({"message": "post deleted"}), 200
        
    except Exception as e: #general exception catch
        current_app.logger.error(f"error deleting post: {str(e)}")
        return jsonify({"error": "internal server error"}), 500

@parking_bp.route('/spots/<post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        post = ParkingSpot.objects(id=post_id).first()
        
        if not post:
            return jsonify({"error": "Post not found"}), 404
            
        if user in post.likes:
            post.likes.remove(user)
            liked = False
        else:
            post.likes.append(user)
            liked = True
            
        post.save()
        
        return jsonify({
            "like_count": len(post.likes),
            "is_liked": liked
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"error liking post: {str(e)}")
        return jsonify({"error": "internal server error"}), 500
