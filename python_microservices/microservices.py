from flask import Flask

app = Flask(__name__)

@app.route("/test")
def hello_world():
    return "Hello! This data is coming from our python microservices!"

