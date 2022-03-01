from flask import Response, request
from flask_restful import Resource
from models import LikePost, User, db
from sqlalchemy import and_
import json
from . import can_view_post

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self, post_id):
        try:
            post_id = int(post_id)
        except:
            return Response(json.dumps({'message': 'Post_id is not valid'}), mimetype="application/json", status=400)
        
        no_duplicates = db.session.query(LikePost.post_id).filter(and_(LikePost.user_id == self.current_user.id, LikePost.post_id == post_id)).all()

        if len(no_duplicates) > 0:
            return Response(json.dumps({'message': 'Like already generated'}), mimetype="application/json", status=400)

        if not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'User cannot view post'}), mimetype="application/json", status=404)

        like = LikePost(self.current_user.id, post_id)
        db.session.add(like)
        db.session.commit()
        return Response(json.dumps(like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, post_id, id):
        try:
            post_id = int(post_id)
            id = int(id)
        except:
            return Response(json.dumps({'message': 'Post_id is not valid'}), mimetype="application/json", status=400)

        like = LikePost.query.get(id)

        if like is None:
           return Response(json.dumps({'message': 'Post_id does not exist'}), mimetype="application/json", status=404)
        elif like.user_id is not self.current_user.id:
            return Response(json.dumps({'message': 'User does not have access to post'}), mimetype="application/json", status=404)

        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Like {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
