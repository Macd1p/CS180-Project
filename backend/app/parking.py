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
        
        parking_spot = ParkingSpot(
            title=data['title'],
            description=data.get('description', ''),
            lotnumber = data['lotnumber'],
            owner=user
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
def get_parking_spots():
    try:
        query = query
        
        spots = query.order_by('-created_at')
        
        spots_data = []
        for spot in spots:
            spots_data.append({
                "id": str(spot.id),
                "title": spot.title,
                "lotnumber": spot.lotnumber,
                "description": spot.description,
                "owner": spot.owner.username
            })
        
        return jsonify({"spots": spots_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching parking spots: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    

@parking_bp.route('/generate-signature', methods=['POST'])
@jwt_required() #checks the the token from user
def upload_permission():
    currtime=time.clock_gettime()
    
