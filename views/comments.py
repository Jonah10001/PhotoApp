from flask import Response, request
from flask_restful import Resource

from tests.utils import get_authorized_user_ids
from . import can_view_post
import json
from models import db, Comment, Post
import flask_jwt_extended

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json()
        text = body.get('text')
        post_id = body.get('post_id')
        user_id = self.current_user.id

        try:
            post_id = int(post_id)
        except:
            return Response(json.dumps({'message': 'invalid post_id'}), mimetype="application/json", status=400)

        post = Post.query.get(post_id)

        if post is None:
            return Response(json.dumps({'message': 'invalid post_id'}), mimetype="application/json", status=404)
        
        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'no access to this post'}), mimetype="application/json", status=404)
        
        if text is not None:
            comment = Comment(text, user_id, post_id)
            db.session.add(comment)
            db.session.commit()
            return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        else:
            return Response(json.dumps({'message': 'must enter text'}), mimetype="application/json", status=400)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        try:
            id = int(id)
        except:
            return Response(json.dumps({'message': 'ID entered is not valid'}), mimetype="application/json", status=400)

        comment = Comment.query.get(id)

        if comment is None:
           return Response(json.dumps({'message': 'Comment_id does not exist'}), mimetype="application/json", status=404)
        elif comment.user_id is not self.current_user.id:
            return Response(json.dumps({'message': 'User does not have access to comment'}), mimetype="application/json", status=404)

        
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
