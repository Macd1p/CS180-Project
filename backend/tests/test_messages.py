# test_message.py
import pytest
from app.model import User, Message, ParkingSpot
from flask_jwt_extended import create_access_token
from datetime import datetime


# Helper function to create test user
def create_test_user(email='test@gmail.com', username='testuser'):
    return User(
        email=email,
        password='password',
        username=username,
        firstname='Test',
        lastname='User',
        login_method='local',
        profile_image='http://example.com/profile.jpg'
    )


def test_send_message_success(client):
    """Test successfully sending a message"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'receiver_username': 'receiver',
        'message': 'Hello, this is a test message!'
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['message'] == 'message sent successfully'
    
    # Verify message was saved in database
    message = Message.objects.first()
    assert message is not None
    assert message.sender == sender
    assert message.receiver == receiver
    assert message.message == 'Hello, this is a test message!'


def test_send_message_without_auth(client):
    """Test sending message without authentication"""
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    message_data = {
        'receiver_username': 'receiver',
        'message': 'Hello!'
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data
    )
    
    assert response.status_code == 401  # Unauthorized


def test_send_message_invalid_sender(client):
    """Test sending message with invalid sender token"""
    access_token = create_access_token(identity='507f1f77bcf86cd799439011')  # Invalid ID
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    message_data = {
        'receiver_username': 'receiver',
        'message': 'Hello!'
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'user not found'


def test_send_message_missing_receiver_username(client):
    """Test sending message missing receiver_username field"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'message': 'Hello!'  # Missing receiver_username
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'missing required field'


def test_send_message_missing_message_field(client):
    """Test sending message missing message field"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'receiver_username': 'receiver'  # Missing message
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'missing required field'


def test_send_message_missing_all_fields(client):
    """Test sending message with empty JSON"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {}  # Empty JSON
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'missing required field'


def test_send_message_nonexistent_receiver(client):
    """Test sending message to non-existent user"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'receiver_username': 'nonexistent_user',
        'message': 'Hello!'
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'receiver not found'


def test_send_message_empty_message(client):
    """Test sending empty message"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'receiver_username': 'receiver',
        'message': ''  # Empty message
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'message cannot be empty'


def test_send_message_whitespace_message(client):
    """Test sending message with only whitespace"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    message_data = {
        'receiver_username': 'receiver',
        'message': '   '  # Only whitespace
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'message cannot be empty'


def test_inbox_success(client):
    """Test getting inbox successfully"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    user3 = create_test_user('user3@gmail.com', 'user3')
    user3.save()
    
    # Create messages between users
    message1 = Message(
        sender=user1,
        receiver=user2,
        message='Hello from user1 to user2',
        created_at=datetime(2024, 1, 1, 10, 0, 0)
    )
    message1.save()
    
    message2 = Message(
        sender=user2,
        receiver=user1,
        message='Reply from user2 to user1',
        created_at=datetime(2024, 1, 1, 10, 5, 0)
    )
    message2.save()
    
    message3 = Message(
        sender=user1,
        receiver=user3,
        message='Hello from user1 to user3',
        created_at=datetime(2024, 1, 1, 11, 0, 0)
    )
    message3.save()
    
    # Get inbox for user1
    access_token = create_access_token(identity=str(user1.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'inbox' in response.json
    inbox = response.json['inbox']
    
    # Should have 2 conversations (with user2 and user3)
    assert len(inbox) == 2
    
    # Check that conversations are sorted by most recent message
    # The most recent message was to user3 at 11:00
    assert inbox[0]['username'] == 'user3'
    assert inbox[0]['last_message'] == 'Hello from user1 to user3'
    
    # Next most recent was with user2 at 10:05
    assert inbox[1]['username'] == 'user2'
    assert inbox[1]['last_message'] == 'Reply from user2 to user1'
    
    # Check structure of each conversation
    for conv in inbox:
        assert 'user_id' in conv
        assert 'username' in conv
        assert 'profile_image' in conv
        assert 'last_message' in conv
        assert 'timestamp' in conv


def test_inbox_without_auth(client):
    """Test getting inbox without authentication"""
    response = client.get('/api/message/inbox')
    
    assert response.status_code == 401  # Unauthorized


def test_inbox_invalid_user(client):
    """Test getting inbox with invalid user token"""
    access_token = create_access_token(identity='507f1f77bcf86cd799439011')  # Invalid ID
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'user not found'


def test_inbox_empty(client):
    """Test getting empty inbox (no messages)"""
    user = create_test_user('user@gmail.com', 'user')
    user.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'inbox' in response.json
    assert response.json['inbox'] == []  # Empty list


def test_inbox_as_receiver_only(client):
    """Test inbox when user is only receiver of messages"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    # Create messages where receiver only receives
    message1 = Message(
        sender=sender,
        receiver=receiver,
        message='Message 1 to receiver',
        created_at=datetime(2024, 1, 1, 10, 0, 0)
    )
    message1.save()
    
    message2 = Message(
        sender=sender,
        receiver=receiver,
        message='Message 2 to receiver',
        created_at=datetime(2024, 1, 1, 11, 0, 0)
    )
    message2.save()
    
    # Get inbox for receiver
    access_token = create_access_token(identity=str(receiver.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert len(response.json['inbox']) == 1
    assert response.json['inbox'][0]['username'] == 'sender'
    assert response.json['inbox'][0]['last_message'] == 'Message 2 to receiver'


def test_inbox_as_sender_only(client):
    """Test inbox when user is only sender of messages"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    # Create messages where sender only sends
    message1 = Message(
        sender=sender,
        receiver=receiver,
        message='Message 1 from sender',
        created_at=datetime(2024, 1, 1, 10, 0, 0)
    )
    message1.save()
    
    message2 = Message(
        sender=sender,
        receiver=receiver,
        message='Message 2 from sender',
        created_at=datetime(2024, 1, 1, 11, 0, 0)
    )
    message2.save()
    
    # Get inbox for sender
    access_token = create_access_token(identity=str(sender.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert len(response.json['inbox']) == 1
    assert response.json['inbox'][0]['username'] == 'receiver'
    assert response.json['inbox'][0]['last_message'] == 'Message 2 from sender'


def test_get_conversation_success(client):
    """Test getting conversation between two users"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    # Create messages between users
    messages = [
        Message(sender=user1, receiver=user2, message='Hello', created_at=datetime(2024, 1, 1, 10, 0, 0)),
        Message(sender=user2, receiver=user1, message='Hi there', created_at=datetime(2024, 1, 1, 10, 1, 0)),
        Message(sender=user1, receiver=user2, message='How are you?', created_at=datetime(2024, 1, 1, 10, 2, 0)),
        Message(sender=user2, receiver=user1, message='Good thanks!', created_at=datetime(2024, 1, 1, 10, 3, 0))
    ]
    
    for msg in messages:
        msg.save()
    
    # Get conversation as user1
    access_token = create_access_token(identity=str(user1.id))
    
    response = client.get(
        f'/api/message/{str(user2.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'messages' in response.json
    messages_response = response.json['messages']
    
    # Should have 4 messages
    assert len(messages_response) == 4
    
    # Should be in chronological order
    assert messages_response[0]['message'] == 'Hello'
    assert messages_response[1]['message'] == 'Hi there'
    assert messages_response[2]['message'] == 'How are you?'
    assert messages_response[3]['message'] == 'Good thanks!'
    
    # Check message structure
    for msg in messages_response:
        assert 'id' in msg
        assert 'sender_id' in msg
        assert 'message' in msg
        assert 'timestamp' in msg


def test_get_conversation_without_auth(client):
    """Test getting conversation without authentication"""
    user = create_test_user()
    user.save()
    
    response = client.get(f'/api/message/{str(user.id)}')
    
    assert response.status_code == 401  # Unauthorized


def test_get_conversation_invalid_current_user(client):
    """Test getting conversation with invalid current user token"""
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    access_token = create_access_token(identity='507f1f77bcf86cd799439011')  # Invalid ID
    
    response = client.get(
        f'/api/message/{str(user2.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'user not found'


def test_get_conversation_invalid_other_user(client):
    """Test getting conversation with invalid other user ID"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    access_token = create_access_token(identity=str(user1.id))
    
    response = client.get(
        f'/api/message/507f1f77bcf86cd799439011',  # Invalid user ID
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'user not found'


def test_get_conversation_empty(client):
    """Test getting empty conversation (no messages between users)"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    # Create a message with a third user to ensure there are messages in DB
    user3 = create_test_user('user3@gmail.com', 'user3')
    user3.save()
    
    message = Message(
        sender=user1,
        receiver=user3,
        message='Message to third user',
        created_at=datetime.now()
    )
    message.save()
    
    # Get conversation between user1 and user2 (should be empty)
    access_token = create_access_token(identity=str(user1.id))
    
    response = client.get(
        f'/api/message/{str(user2.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'messages' in response.json
    assert response.json['messages'] == []  # Empty list


def test_get_conversation_one_direction_only(client):
    """Test conversation where messages are only in one direction"""
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    # Only sender sends messages, no replies
    messages = [
        Message(sender=sender, receiver=receiver, message='Message 1', created_at=datetime(2024, 1, 1, 10, 0, 0)),
        Message(sender=sender, receiver=receiver, message='Message 2', created_at=datetime(2024, 1, 1, 11, 0, 0)),
        Message(sender=sender, receiver=receiver, message='Message 3', created_at=datetime(2024, 1, 1, 12, 0, 0))
    ]
    
    for msg in messages:
        msg.save()
    
    # Get conversation as sender
    access_token = create_access_token(identity=str(sender.id))
    
    response = client.get(
        f'/api/message/{str(receiver.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert len(response.json['messages']) == 3
    
    # Get conversation as receiver
    access_token = create_access_token(identity=str(receiver.id))
    
    response = client.get(
        f'/api/message/{str(sender.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert len(response.json['messages']) == 3


def test_server_error_send_message(client, mocker):
    """Test server error when sending message"""
    import app.message as message_module
    
    sender = create_test_user('sender@gmail.com', 'sender')
    sender.save()
    
    receiver = create_test_user('receiver@gmail.com', 'receiver')
    receiver.save()
    
    access_token = create_access_token(identity=str(sender.id))
    
    # Mock Message.save to raise an exception
    mocker.patch('app.model.Message.save', side_effect=Exception('Database error'))
    
    message_data = {
        'receiver_username': 'receiver',
        'message': 'Hello!'
    }
    
    response = client.post(
        '/api/message/send',
        json=message_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 500
    assert response.json['error'] == 'internal server error'


def test_server_error_inbox(client, mocker):
    """Test server error when getting inbox"""
    import app.message as message_module
    
    user = create_test_user('user@gmail.com', 'user')
    user.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    # Mock Message.objects to raise an exception
    mocker.patch('app.model.Message.objects', side_effect=Exception('Database error'))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 500
    assert response.json['error'] == 'internal server error'


def test_server_error_get_conversation(client, mocker):
    """Test server error when getting conversation"""
    import app.message as message_module
    
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    access_token = create_access_token(identity=str(user1.id))
    
    # Mock Message.objects to raise an exception
    mocker.patch('app.model.Message.objects', side_effect=Exception('Database error'))
    
    response = client.get(
        f'/api/message/{str(user2.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 500
    assert response.json['error'] == 'internal server error'


# Test with user having no profile_image
def test_inbox_user_without_profile_image(client):
    """Test inbox when user has no profile image"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.profile_image = None  # No profile image
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    # Create a message
    message = Message(
        sender=user1,
        receiver=user2,
        message='Hello',
        created_at=datetime.now()
    )
    message.save()
    
    # Get inbox for user2
    access_token = create_access_token(identity=str(user2.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert len(response.json['inbox']) == 1
    assert response.json['inbox'][0]['username'] == 'user1'
    assert response.json['inbox'][0]['profile_image'] is None


# Test conversation ordering
def test_conversation_ordering(client):
    """Test that conversation messages are ordered chronologically"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    # Create messages out of order
    message3 = Message(
        sender=user1,
        receiver=user2,
        message='Third message',
        created_at=datetime(2024, 1, 1, 12, 0, 0)
    )
    message3.save()
    
    message1 = Message(
        sender=user1,
        receiver=user2,
        message='First message',
        created_at=datetime(2024, 1, 1, 10, 0, 0)
    )
    message1.save()
    
    message2 = Message(
        sender=user2,
        receiver=user1,
        message='Second message',
        created_at=datetime(2024, 1, 1, 11, 0, 0)
    )
    message2.save()
    
    # Get conversation
    access_token = create_access_token(identity=str(user1.id))
    
    response = client.get(
        f'/api/message/{str(user2.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    messages = response.json['messages']
    
    # Should be in chronological order
    assert len(messages) == 3
    assert messages[0]['message'] == 'First message'
    assert messages[1]['message'] == 'Second message'
    assert messages[2]['message'] == 'Third message'


# Test inbox with many conversations
def test_inbox_many_conversations(client):
    """Test inbox with many conversations"""
    main_user = create_test_user('main@gmail.com', 'main')
    main_user.save()
    
    conversations = []
    
    # Create 5 other users and messages with each
    for i in range(5):
        other_user = create_test_user(f'user{i}@gmail.com', f'user{i}')
        other_user.save()
        
        # Create a message from main to other user
        message = Message(
            sender=main_user,
            receiver=other_user,
            message=f'Message to user{i}',
            created_at=datetime(2024, 1, 1, 10 + i, 0, 0)  # Different times
        )
        message.save()
        
        conversations.append(other_user)
    
    # Get inbox
    access_token = create_access_token(identity=str(main_user.id))
    
    response = client.get(
        '/api/message/inbox',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    inbox = response.json['inbox']
    
    # Should have 5 conversations
    assert len(inbox) == 5
    
    # Should be ordered by most recent (descending created_at)
    # Last user (user4 at 14:00) should be first
    assert inbox[0]['username'] == 'user4'
    assert inbox[4]['username'] == 'user0'