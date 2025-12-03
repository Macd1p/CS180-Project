from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .model import ParkingSpot, User, Message
from datetime import datetime
import cloudinary.utils
import time

message_bp=Blueprint('message',__name__,url_prefix='/api/message')

@message_bp.route('/send', methods=['POST'])
@jwt_required()
def sender():
    try:
        current_user_id=get_jwt_identity()
        current_user=User.objects(id=current_user_id).first()

        if not current_user:
            return jsonify({"error":"user not found"}),404
        data=request.get_json()
        
        required_fields=['receiver_username','message'] #check for required fields
        for field in required_fields:
            if field not in data:
                return jsonify({"error":"missing required field"}),400
        
        receiver_id=data['receiver_username'] 
        receiver=User.objects(username=receiver_id).first()
        if not receiver: #check if receiver exists
            return jsonify({"error":"receiver not found"}),404
        
        message_text=data['message']

        if message_text.strip() == "":
            return jsonify({"error":"message cannot be empty"}),400
        
        message=Message(
            sender=current_user,
            receiver=receiver,
            message=message_text,
            created_at=datetime.now(),
        )   
        message.save()

        return jsonify({"message":"message sent successfully"}),200
    except Exception as e:
        current_app.logger.error(f"error sending message: {str(e)}")
        return jsonify({"error":"internal server error"}),500   

@message_bp.route('/inbox', methods=['GET'])
@jwt_required()
def inbox():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        
        if not current_user:
            return jsonify({"error": "user not found"}), 404

        from mongoengine.queryset.visitor import Q #import Q for using or logic in queries
        
        messages = Message.objects(#get messages where user is either sender or receiver
            Q(sender=current_user) | Q(receiver=current_user)
        ).order_by('-created_at')
        
        #dictionary that groups by other user to get unique conversations
        conversations = {}
        for msg in messages:
            #determine who the other person is
            if msg.sender == current_user:
                other_user = msg.receiver
            else:
                other_user = msg.sender
                
            other_user_id = str(other_user.id)
            
            #since its ordered by created_at in descending the first time we see a user its the most recent message
            if other_user_id not in conversations:
                conversations[other_user_id] = {
                    "user_id": other_user_id,
                    "username": other_user.username,
                    "profile_image": other_user.profile_image,
                    "last_message": msg.message,
                    "timestamp": msg.created_at
                }
        
        return jsonify({"inbox": list(conversations.values())}), 200
        
    except Exception as e:
        current_app.logger.error(f"error fetching inbox: {str(e)}")
        return jsonify({"error": "internal server error"}), 500

@message_bp.route('/<user_id>', methods=['GET'])
@jwt_required() 

def get_conversation(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.objects(id=current_user_id).first()
        second_user = User.objects(id=user_id).first() #get second user from paramter
        
        if not current_user or not second_user: #check if users exist
            return jsonify({"error": "user not found"}), 404
            
        #get messages between these two users
        from mongoengine.queryset.visitor import Q
        messages = Message.objects( (Q(sender=current_user) & 
        Q(receiver=second_user)) |
        (Q(sender=second_user) & Q(receiver=current_user))
        ).order_by('created_at') 
        
        chat_history = []
        for msg in messages: #append messages to chat history
            chat_history.append({
                "id": str(msg.id),
                "sender_id": str(msg.sender.id),
                "message": msg.message,
                "timestamp": msg.created_at
            })
            
        return jsonify({"messages": chat_history}), 200  #list of messages  
    except Exception as e:
        current_app.logger.error(f"error fetching conversation: {str(e)}")
        return jsonify({"error": "internal server error"}), 500
