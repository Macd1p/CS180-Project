from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .model import Comment, ParkingSpot, User
from datetime import datetime


comment_bp = Blueprint('comment', __name__, url_prefix='/api/comments')

@comment_bp.route('/<parking_spot_id>', methods=['POST'])
@jwt_required()
def create_comment(parking_spot_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        parking_spot = ParkingSpot.objects(id=parking_spot_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        if not parking_spot:
            return jsonify({"error": "Parking spot not found"}), 404
        
        data = request.get_json()
        
        if 'text' not in data or not data['text'].strip():
            return jsonify({"error": "Comment text is required"}), 400
        
        comment = Comment(
            text=data['text'],
            author=user,
            parking_spot=parking_spot
        )
        
        comment.save()
        
        return jsonify({
            "message": "Comment created successfully",
            "comment": {
                "id": str(comment.id),
                "text": comment.text,
                "author": user.username,
                "created_at": comment.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error creating comment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@comment_bp.route('/<parking_spot_id>', methods=['GET'])
def get_comments(parking_spot_id):
    try:
        parking_spot = ParkingSpot.objects(id=parking_spot_id).first()
        if not parking_spot:
            return jsonify({"error": "Parking spot not found"}), 404
        
        comments = Comment.objects(parking_spot=parking_spot).order_by('-created_at')
        
        comments_data = []
        for comment in comments:
            comments_data.append({
                "id": str(comment.id),
                "text": comment.text,
                "author": comment.author.username,
                "created_at": comment.created_at.isoformat()
            })
        
        return jsonify({"comments": comments_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching comments: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500