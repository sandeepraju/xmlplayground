from flask import Flask
from flask.ext.assets import Environment, Bundle
import redis

# Configuring Flask Application
app = Flask(__name__)
app.config.from_object("core.settings")

# Web Assets Configuration
webAssets = Environment(app)
webAssets.register("js_main", Bundle("js/main.js", filters="jsmin",
                        output="assets/min.main.js"))

# Configure redis
redisConn = redis.StrictRedis(host=app.config["REDIS_HOST"],
                port=app.config["REDIS_PORT"],
                db=app.config["REDIS_DB"])

__import__("core.views")
