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
        
        # Validate required fields
        required_fields = ['title', 'lotnumber']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Extract hashtags from description
        description = data.get('description', '')
        tags = extract_hashtags(description)
        
        parking_spot = ParkingSpot(
            title=data['title'],
            description=description,
            lotnumber=data['lotnumber'],
            url_for_images=data.get('url_for_images', []),
            tags=tags,  # Store extracted hashtags
            owner=user
        )
        
        parking_spot.save()
        
        return jsonify({
            "message": "Parking spot created successfully",
            "spot": {
                "id": str(parking_spot.id),
                "title": parking_spot.title,
                "tags": parking_spot.tags
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error creating parking spot: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



@parking_bp.route('/spots', methods=['GET'])
def get_parking_spots():
    try:
        query = ParkingSpot.objects()
        
        spots = query.order_by('-created_at')
        
        spots_data = []
        for spot in spots:
            spots_data.append({
                "id": str(spot.id),
                "title": spot.title,
                "lotnumber": spot.lotnumber,
                "description": spot.description,
                "url_for_images": spot.url_for_images,
                "tags": spot.tags,
                "owner": spot.owner.username
            })
        
        return jsonify({"spots": spots_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching parking spots: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@parking_bp.route('/spots', methods=['GET'])
def get_single_parking_spot(post_id):
    try:
        query = ParkingSpot.objects()
        
        spots = query.order_by('-created_at')
        
        spots_data = []
        for spot in spots:
            if(spot.id == post_id):
                spots_data.append({
                    "time_created": spot.created_at,
                    "id": str(spot.id),
                    "title": spot.title,
                    "lotnumber": spot.lotnumber,
                    "description": spot.description,
                    "url_for_images": spot.url_for_images,
                    "tags": spot.tags,
                    "owner": spot.owner.username
                })
        
        return jsonify({"spots": spots_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching parking spots: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@parking_bp.route('/generate-signature', methods=['POST'])
@jwt_required() 
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


@parking_bp.route('/update-post', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        post_to_update = ParkingSpot.objects(id=post_id, owner=user).first()
        
        if not post_to_update:
            return jsonify({"error": "Missing POST ID"}), 400
        
        data = request.get_json()
        
        # Update fields if they exist in the request
        for field in ['title', 'description', 'url_for_images']:
            if field in data:
                setattr(post_to_update, field, data[field])
        
        # If description is updated, extract new hashtags
        if 'description' in data:
            post_to_update.tags = extract_hashtags(data['description'])
        
        # If tags are explicitly provided (optional), use them instead
        if 'tags' in data:
            post_to_update.tags = data['tags']
        
        post_to_update.save()
        
        return jsonify({
            "message": "Parking spot updated successfully",
            "post": post_to_update.to_json()    
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error updating post: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@parking_bp.route('/<post_id>', methods=['DELETE']) 
@jwt_required()
def delete_post(post_id):
    try:
        current_user_id = get_jwt_identity() 
        user = User.objects(id=current_user_id).first()
        
        if not user: 
            return jsonify({"error": "user not found"}), 404
        
        post_to_delete = ParkingSpot.objects(id=post_id, owner=user).first()
        
        if not post_to_delete: #spot does not exist or user is not owner
            return jsonify({"error": "post not found or unauthorized"}), 404
        
        post_to_delete.delete()
        
        return jsonify({"message": "post deleted"}), 200
        
    except Exception as e: 
        current_app.logger.error(f"error deleting post: {str(e)}")
        return jsonify({"error": "internal server error"}), 500
    

# Helper function to extract hashtags from text
def extract_hashtags(text):
    if not text:
        return []
    
    import re
    # Find all words that start with # and are followed by word characters
    hashtags = re.findall(r'#(\w+)', text)
    # Return unique hashtags
    return list(set(hashtags))