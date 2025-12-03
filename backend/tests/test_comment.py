import pytest
from app.model import User, ParkingSpot, Comment
from flask_jwt_extended import create_access_token
from datetime import datetime


def test_create_comment(client):
    #create a user
    user = User(
        email='postowner@gmail.com',
        password='password',
        username='postowner',
        firstname='Post',
        lastname='Owner',
        login_method='local'
    )
    user.save()
    
    #create a parking spot owned by user
    spot = ParkingSpot(
        title='Original Title',
        address = 'test',
        description='Original description',
        url_for_images='http://example.com/image1.jpg',
        tags=['outdoor', 'free'],
        owner=user
    )
    spot.save()
    
    #create access token for user
    access_token = create_access_token(identity=str(user.id))
    
    #create comment on previous spot
    comment = Comment(
        text='test comment',
        author=user,
        parking_spot=spot,
        created_at = datetime.now(),
        likes = [user]
    )
    comment.save()
    
    #post comment
    comment_data = {
        'id' : str(comment.id),
        'text': 'test comment',
        'author': user.username,
        "created_at": comment.created_at.isoformat()
    }
    
    #send post request
    response = client.post(
        f'/api/comments/{str(spot.id)}',
        json=comment_data,
        headers={'Authorization': f'Bearer {access_token}'}
    )

    #verify response
    assert response.status_code == 201
    assert response.json['message'] == 'Comment created successfully'
    
    #verify data in DB
    comment_id = response.json['comment']['id']
    comment = Comment.objects(id=comment_id).first()
    
    assert comment is not None
    assert comment.text == 'test comment'
    assert comment.author == user

def test_like_comment(client):
    #create a user
    user = User(
        email='postowner@gmail.com',
        password='password',
        username='postowner',
        firstname='Post',
        lastname='Owner',
        login_method='local'
    )
    user.save()
    
    #create a parking spot owned by user
    spot = ParkingSpot(
        title='Original Title',
        address='test',
        description='Original description',
        url_for_images='http://example.com/image1.jpg',
        tags=['outdoor', 'free'],
        owner=user
    )
    spot.save()
    
    #create access token for user
    access_token = create_access_token(identity=str(user.id))
    
    #create comment on previous spot
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
    
    # Verify response
    assert response.status_code == 200
    assert response.json['is_liked'] == True
    assert response.json['like_count'] == 1
    
    # Verify data in DB
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert comment_reloaded is not None
    assert len(comment_reloaded.likes) == 1
    assert user in comment_reloaded.likes
    
    # Test unliking the comment
    response = client.post(
        f'/api/comments/{spot_id}/{comment_id}',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    # Verify response
    assert response.status_code == 200
    assert response.json['is_liked'] == False
    assert response.json['like_count'] == 0
    
    # Verify data in DB
    comment_reloaded = Comment.objects(id=comment_id).first()
    assert comment_reloaded is not None
    assert len(comment_reloaded.likes) == 0
    assert user not in comment_reloaded.likes