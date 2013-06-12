# Local project imports
from core import app,redisConn

# Standard python imports
import json
import os

# Third party imports
from flask import render_template, send_from_directory, jsonify, request, Response
import plivo


# Application index
@app.route("/")
def index():
    return render_template("index.html",
        pxExamples=app.config["PLIVOXML_EXAMPLES"])


# testxml
@app.route("/testxml", methods=["POST"])
def testXML():
    if request.form.get("xml", None) not in ["", None] and request.form.get("uname", None) not in ["", None]:
        plivoXML = request.form["xml"]
        userName = request.form["uname"]
        if not redisConn.set(userName, plivoXML):
            return jsonify({ "status": "failure" })

        p = plivo.RestAPI(app.config["PLIVO_AUTH_ID"], app.config["PLIVO_AUTH_TOKEN"])
        params = {
            'to': 'sip:%s@phone.plivo.com' % userName,
            'from': '0123456789',
            'ring_url': 'http://%s.localtunnel.com/plivoxml/%s' % (app.config['LOCALTUNNEL_PREFIX'], userName),
            'answer_url': 'http://%s.localtunnel.com/plivoxml/%s' % (app.config['LOCALTUNNEL_PREFIX'], userName),
            'hangup_url': 'http://%s.localtunnel.com/plivoxml/%s' % (app.config['LOCALTUNNEL_PREFIX'], userName),
            'answer_method': 'GET',
            'ring_method': 'GET',
            'hangup_method': 'GET'
        }

        code, resp = p.make_call(params)
        print "-"*50
        print params
        print code
        print resp
        print "-"*50

        return jsonify({ "status": "success" }) if code in [200, 201] else jsonify({ "status": "failure" })
    else:
        return jsonify({ "status": "failure" }), 400 # bad request


@app.route("/plivoxml/<userName>")
def plivoXML(userName):
    plivoXML = redisConn.get(userName)
    print plivoXML
    return Response(response= plivoXML if plivoXML else "<Response></Response>",
                    status=200,
                    mimetype="text/xml")

# Application error handlers
@app.errorhandler(404)
def not_found(error=None):
    return render_template("404.html"), 404


# Etc routes (favicon, robots.txt, humans.txt, etc.)
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/robots.txt')
def robots():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'robots.txt', mimetype='text/plain')


@app.route('/humans.txt')
def humans():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'humans.txt', mimetype='text/plain')
