from flask import request, jsonify
import requests
from app import app
import json
from flask_restful import Api, Resource
import datetime
from functools import wraps
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request

app.config["JWT_SECRET_KEY"] = "anat"
jwt = JWTManager(app)
api = Api(app)
CITIES_NOT_ALLOWED = {'Berlin': 'Berlin', 'Rome': 'Rome', 'Brussels': 'Brussels'}


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            auth_header = request.headers.get('Authorization', None)
            print(auth_header)
            if not auth_header:
                return {'admin need': 'needs admin permissions '}, 500
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["is_administrator"]:
                return fn(*args, **kwargs)
            else:

                return jsonify(msg="Admins only!"), 403

        return decorator

    return wrapper


@app.route("/login", methods=["POST"])
def login():
    access_token = create_access_token(
        "admin_user", additional_claims={"is_administrator": True}
    )
    return jsonify(access_token=access_token)


def search_all(city_to_search, date_to_search):
    with open('sample.json', 'r') as f_data:
        json_data = json.load(f_data)
        for a in json_data['weather']:
            if a['city'] != city_to_search:
                continue
            else:
                if a['date'] != date_to_search:
                    return {'found': True, 'add_data': True}
                else:
                    return {'found': True, 'add_data': False}

    return {'found': False, 'add_data': True}


class UploadingView(Resource):
    @admin_required()
    def post(self):
        payload = request.get_json()
        city = payload['q']
        forecast_date = payload['dt']
        today = datetime.date.today()
        forecast_date_object = datetime.datetime.strptime(forecast_date, '%d-%m-%Y').date()
        format_date_dmy = datetime.datetime.strftime(forecast_date_object, '%d-%m-%Y')
        delta_object = today - forecast_date_object
        f = search_all(city, format_date_dmy)
        if f['add_data'] == True and delta_object.days <= 7:
            self.upload(city, format_date_dmy)
            return {'data updated': 'data updated'}, 200
        else:
            return {'data can not be updated': 'data can not be updated'}, 400
        #return {'unauthorized !! '}

    def get(self):
        newList = {}
        with open('sample.json', 'r') as f_data:
            json_data = json.load(f_data)
            newList['weather'] = [d for d in json_data['weather'] if d['city'] not in CITIES_NOT_ALLOWED.keys()]
            return {"data": newList}

    def upload(self, city, format_date_dmy):
        payload = {'q': city, 'dt': format_date_dmy}
        r = requests.get('https://api.weatherapi.com/v1/history.json?key=f34a643119894baea74201304212312',
                         params=payload)
        data = r.json()
        dict_city_hist_data = {'city': city, 'date': format_date_dmy,
                               'avgtemp_c': data['forecast']['forecastday'][0]['day']['avgtemp_c'],
                               'avgtemp_f': data['forecast']['forecastday'][0]['day']['avgtemp_f'],
                               'condition': data['forecast']['forecastday'][0]['day']['condition']['text'],
                               'icon': data['forecast']['forecastday'][0]['day']['condition']['icon']}
        with open("sample.json", 'r+') as outfile:
            data_test = json.load(outfile)
            data_test["weather"].append(dict_city_hist_data)
            outfile.seek(0)
            json.dump(data_test, outfile, indent=4)
        return {'data uploaded': 'data uploaded'}, 200


class UpdatingView(Resource):
    # search a city and  a forecast date
    def post(self):
        cities_result_data = []
        payload = request.get_json()
        city_to_search = payload['q']
        date_to_search = payload['dt']
        f = search_all(city_to_search, date_to_search)
        if f['found']:
            with open('sample.json', 'r') as f_data:
                json_data = json.load(f_data)
                for a in json_data['weather']:
                    if a['city'] == city_to_search and a['date'] == date_to_search:
                        cities_result_data.append(a)
                        return {'cities_result_data': cities_result_data}, 200
                    else:
                        return {'message': 'the date was not matching'}, 200
        else:
            return {'message': 'the weather and date  were not matching'}, 200

    def delete(self):
        payload = request.get_json()
        city_to_search = payload['q']
        date_to_search = payload['dt']
        f = search_all(city_to_search, date_to_search)
        if f['found'] == True:
            with open('sample.json', 'r+') as f_data:
                json_data = json.load(f_data)
                for a in json_data['weather']:
                    if a['city'] == city_to_search and a['date'] == date_to_search:
                        json_data['weather'].remove(a)
                        with open('sample.json', 'w') as f_data:
                            f_data.seek(0)
                            json.dump(json_data, f_data, indent=4)
                            return 'deleted', 200
                    else:
                        continue
        else:
            return {'message': 'no items to delete'}, 200


api.add_resource(UploadingView, '/uploading')
api.add_resource(UpdatingView, '/updating')
