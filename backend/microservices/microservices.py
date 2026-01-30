from flask import Flask, request, jsonify
from storage import get_storage

app = Flask(__name__)
storage = get_storage()

@app.route("/test")
def hello_world():
    return "Hello! This data is coming from our python microservices!"


@app.route("/convert/json/csv", methods=["POST"])
def json_to_csv():
	data = request.json
	input_path = data.get("input_path")
	output_path = data.get("output_path")

	df = storage.read_json(input_path)
	storage.write_csv(output_path, df)

	return jsonify({"output_path": output_path}), 200
