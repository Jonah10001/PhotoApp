from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
from sqlalchemy import and_
import json
import flask_jwt_extended

from tests.utils import get_authorized_user_ids

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        following = Following.query.filter_by(user_id = self.current_user.id)
        return Response(json.dumps([follower.to_dict_following() for follower in following]), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        body = request.get_json()
        id = body.get('user_id')

        try:
            id = int(id)
        except:
            return Response(json.dumps({'message': 'ID entered is not valid'}), mimetype="application/json", status=400)
        
        if id is None:
            return Response(json.dumps({'message': 'must enter a user_id'}), mimetype="application/json", status=400)    

        following = User.query.get(id)

        if following is None:
            return Response(json.dumps({'message': 'Invalid user_id'}), mimetype="application/json", status=404)
        else:
            try:
                new_following = Following(self.current_user.id, id)
                db.session.add(new_following)
                db.session.commit()
                return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)
            except:
                return Response(json.dumps({'message': 'Not enough space'}), mimetype="application/json", status=400)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        try:
            id = int(id)
        except:
            return Response(json.dumps({'message': 'ID entered is not valid'}), mimetype="application/json", status=400)
        
        possible_user = Following.query.get(id)


        if possible_user is None:
            return Response(json.dumps({'message': 'Following_id does not exist'}), mimetype="application/json", status=404)
        elif not (possible_user.user_id is self.current_user.id):
            return Response(json.dumps({'message': 'User does not have access to this follower'}), mimetype="application/json", status=404)

        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Follower {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
