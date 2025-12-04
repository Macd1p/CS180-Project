import pytest
from app.model import User, ParkingSpot, Comment
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
        login_method='local'
    )


# Helper function to create test parking spot
def create_test_parking_spot(owner, title='Test Spot'):
    return ParkingSpot(
        title=title,
        address='test address',
        description='test description',
        url_for_images='http://example.com/image1.jpg',
        tags=['outdoor', 'free'],
        owner=owner
    )


def test_create_comment(client):
    user = create_test_user('postowner@gmail.com', 'postowner')
    user.save()
    
    spot = create_test_parking_spot(user, 'Original Title')
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment_data = {
        'text': 'test comment',
        'author': user.username
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )

    assert response.status_code == 201
    assert response.json['message'] == 'Comment created successfully'
    
    comment_id = response.json['comment']['id']
    comment = Comment.objects(id=comment_id).first()
    
    assert comment is not None
    assert comment.text == 'test comment'
    assert comment.author == user


def test_create_comment_without_auth(client):
    """Test creating comment without authentication"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment_data = {
        'text': 'test comment'
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data
    )
    
    assert response.status_code == 401  # Unauthorized


def test_create_comment_invalid_user(client):
    """Test creating comment with invalid user token"""
    access_token = create_access_token(identity='507f1f77bcf86cd799439011')  # Invalid but valid format
    
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment_data = {
        'text': 'test comment'
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'User not found'


def test_create_comment_invalid_parking_spot(client):
    """Test creating comment for non-existent parking spot"""
    user = create_test_user()
    user.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment_data = {
        'text': 'test comment'
    }
    
    # Use a non-existent but valid format ObjectId
    response = client.post(
        f'/api/comments/507f1f77bcf86cd799439011',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'Parking spot not found'


def test_create_comment_empty_text(client):
    """Test creating comment with empty text"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment_data = {
        'text': ''  # Empty text
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'Comment text is required'


def test_create_comment_whitespace_text(client):
    """Test creating comment with only whitespace"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment_data = {
        'text': '   '  # Only whitespace
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'Comment text is required'


def test_create_comment_missing_text_field(client):
    """Test creating comment without text field"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment_data = {}  # Missing text field
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 400
    assert response.json['error'] == 'Comment text is required'


def test_get_comments_with_auth(client):
    """Test getting comments with authentication"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    # Create multiple comments
    comment1 = Comment(
        text='First comment',
        author=user,
        parking_spot=spot
    )
    comment1.save()
    
    comment2 = Comment(
        text='Second comment',
        author=user,
        parking_spot=spot
    )
    comment2.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    response = client.get(
        f'/api/comments/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'comments' in response.json
    assert len(response.json['comments']) == 2
    assert response.json['comments'][0]['text'] == 'Second comment'  # Order by -created_at
    assert response.json['comments'][1]['text'] == 'First comment'
    
    # Verify comment structure
    comment_data = response.json['comments'][0]
    assert 'id' in comment_data
    assert 'text' in comment_data
    assert 'author' in comment_data
    assert 'created_at' in comment_data
    assert 'like_count' in comment_data
    assert 'is_liked' in comment_data


def test_get_comments_without_auth(client):
    """Test getting comments without authentication"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment = Comment(
        text='Test comment',
        author=user,
        parking_spot=spot
    )
    comment.save()
    
    response = client.get(f'/api/comments/{str(spot.id)}')
    
    assert response.status_code == 200
    assert 'comments' in response.json
    assert len(response.json['comments']) == 1
    assert response.json['comments'][0]['text'] == 'Test comment'
    assert response.json['comments'][0]['is_liked'] == False  # No user to like


def test_get_comments_invalid_parking_spot(client):
    """Test getting comments for non-existent parking spot"""
    # Use a valid format ObjectId that doesn't exist
    response = client.get('/api/comments/507f1f77bcf86cd799439011')
    
    assert response.status_code == 404
    assert response.json['error'] == 'Parking spot not found'


def test_get_comments_with_likes(client):
    """Test getting comments with likes from authenticated user"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    spot = create_test_parking_spot(user1)
    spot.save()
    
    comment = Comment(
        text='Test comment',
        author=user1,
        parking_spot=spot,
        likes=[user2]  # user2 likes this comment
    )
    comment.save()
    
    # Test with user1 (not liked)
    access_token1 = create_access_token(identity=str(user1.id))
    response1 = client.get(
        f'/api/comments/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token1}'}
    )
    
    assert response1.status_code == 200
    assert response1.json['comments'][0]['like_count'] == 1
    assert response1.json['comments'][0]['is_liked'] == False
    
    # Test with user2 (liked)
    access_token2 = create_access_token(identity=str(user2.id))
    response2 = client.get(
        f'/api/comments/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token2}'}
    )
    
    assert response2.status_code == 200
    assert response2.json['comments'][0]['like_count'] == 1
    assert response2.json['comments'][0]['is_liked'] == True


def test_get_comments_empty_list(client):
    """Test getting comments when no comments exist"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    response = client.get(
        f'/api/comments/{str(spot.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert 'comments' in response.json
    assert len(response.json['comments']) == 0
    assert response.json['comments'] == []


def test_like_comment(client):
    user = create_test_user('postowner@gmail.com', 'postowner')
    user.save()
    
    spot = create_test_parking_spot(user, 'Original Title')
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    comment = Comment(
        text='test comment',
        author=user,
        parking_spot=spot,
        created_at=datetime.now(),
        likes=[]
    )
    comment.save()
    
    spot_id = str(spot.id)
    comment_id = str(comment.id)
    
    # Test liking the comment
    response = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['is_liked'] == True
    assert response.json['like_count'] == 1
    
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert comment_reloaded is not None
    assert len(comment_reloaded.likes) == 1
    assert user in comment_reloaded.likes
    
    # Test unliking the comment
    response = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 200
    assert response.json['is_liked'] == False
    assert response.json['like_count'] == 0
    
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert comment_reloaded is not None
    assert len(comment_reloaded.likes) == 0
    assert user not in comment_reloaded.likes


def test_like_comment_invalid_user(client):
    """Test liking comment with invalid user token"""
    access_token = create_access_token(identity='507f1f77bcf86cd799439011')  # Invalid but valid format
    
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment = Comment(
        text='test comment',
        author=user,
        parking_spot=spot
    )
    comment.save()
    
    response = client.post(
        f'/api/comments/{str(spot.id)}/{str(comment.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'User not found'


def test_like_comment_invalid_comment(client):
    """Test liking non-existent comment"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    response = client.post(
        f'/api/comments/{str(spot.id)}/507f1f77bcf86cd799439011',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 404
    assert response.json['error'] == 'Comment not found'


def test_like_comment_without_auth(client):
    """Test liking comment without authentication"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment = Comment(
        text='test comment',
        author=user,
        parking_spot=spot
    )
    comment.save()
    
    response = client.post(
        f'/api/comments/{str(spot.id)}/{str(comment.id)}'
    )
    
    assert response.status_code == 401  # Unauthorized


def test_like_comment_multiple_users(client):
    """Test multiple users liking the same comment"""
    user1 = create_test_user('user1@gmail.com', 'user1')
    user1.save()
    
    user2 = create_test_user('user2@gmail.com', 'user2')
    user2.save()
    
    spot = create_test_parking_spot(user1)
    spot.save()
    
    comment = Comment(
        text='test comment',
        author=user1,
        parking_spot=spot
    )
    comment.save()
    
    spot_id = str(spot.id)
    comment_id = str(comment.id)
    
    # User1 likes the comment
    access_token1 = create_access_token(identity=str(user1.id))
    response1 = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token1}'}
    )
    
    assert response1.status_code == 200
    assert response1.json['is_liked'] == True
    assert response1.json['like_count'] == 1
    
    # User2 likes the comment
    access_token2 = create_access_token(identity=str(user2.id))
    response2 = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token2}'}
    )
    
    assert response2.status_code == 200
    assert response2.json['is_liked'] == True
    assert response2.json['like_count'] == 2
    
    # Verify both users are in likes
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert len(comment_reloaded.likes) == 2
    assert user1 in comment_reloaded.likes
    assert user2 in comment_reloaded.likes
    
    # User1 unlikes
    response1 = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token1}'}
    )
    
    assert response1.status_code == 200
    assert response1.json['is_liked'] == False
    assert response1.json['like_count'] == 1
    
    # Verify only user2 remains
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert len(comment_reloaded.likes) == 1
    assert user1 not in comment_reloaded.likes
    assert user2 in comment_reloaded.likes

def test_server_error_handling(client, mocker):
    """Test server error handling by mocking exceptions"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    # Mock an exception in create_comment endpoint
    mocker.patch('app.comments.Comment.save', side_effect=Exception('Test error'))
    
    comment_data = {
        'text': 'test comment'
    }
    
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 500
    assert response.json['error'] == 'Internal server error'


def test_server_error_get_comments(client, mocker):
    """Test server error in get_comments endpoint"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    # Mock an exception
    mocker.patch('app.comments.Comment.objects', side_effect=Exception('Test error'))
    
    response = client.get(f'/api/comments/{str(spot.id)}')
    
    assert response.status_code == 500
    assert response.json['error'] == 'Internal server error'


def test_server_error_like_comment(client, mocker):
    """Test server error in like_comment endpoint"""
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    comment = Comment(
        text='test comment',
        author=user,
        parking_spot=spot
    )
    comment.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    # Mock an exception
    mocker.patch('app.comments.Comment.save', side_effect=Exception('Test error'))
    
    response = client.post(
        f'/api/comments/{str(spot.id)}/{str(comment.id)}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    assert response.status_code == 500
    assert response.json['error'] == 'Internal server error'


# Alternative simpler error test without mocker fixture:
def test_internal_server_error(client, monkeypatch):
    """Test internal server error without using mocker fixture"""
    import app.comments as comments_module
    
    user = create_test_user()
    user.save()
    
    spot = create_test_parking_spot(user)
    spot.save()
    
    access_token = create_access_token(identity=str(user.id))
    
    # Temporarily replace Comment.save to raise an exception
    original_save = Comment.save
    
    def mock_save(*args, **kwargs):
        raise Exception("Test error")
    
    Comment.save = mock_save
    
    try:
        comment_data = {
            'text': 'test comment'
        }
        
        response = client.post(
            f'/api/comments/{str(spot.id)}',
            json=comment_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        assert response.status_code == 500
        assert response.json['error'] == 'Internal server error'
    finally:
        # Restore original method
        Comment.save = original_save