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
    
    #post data with coordinates
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

