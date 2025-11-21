import io
from _pyrepl import console

from flask import Flask, request, send_file
import warnings
import pandas as pd
import csv
import json
import os

app = Flask(__name__)

@app.route("/excel", methods=['POST'])
def toExcel():
    filePath = request.form['filePath']

    with open(filePath,"r") as infile:
        text = infile.read()
    data = json.loads(text)
    df = pd.json_normalize(data)

    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)

    original_filename = os.path.splitext(os.path.basename(filePath))[0]
    csv_filename = f"{original_filename}.csv"

    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=csv_filename

    )


@app.route("/csv", methods=['POST'])
def toCSV():
    filePath = request.form['filePath']
    outputPath = request.form['outputPath']

    with open(filePath,"r") as infile:
        text = infile.read()
    data = json.loads(text)
    df = pd.json_normalize(data)

    if outputPath:
        output = os.path.splitext(os.path.basename(filePath))[0] + ".csv"
        outfile = os.path.normpath(os.path.join(outputPath, output))
        df.to_csv(str(outfile), index=False)
        console.log(f"Created CSV file, saved to {outfile}")
    else:
        df.to_csv(str(filePath)+".csv", index=False)
        filedest = str(filePath)+".csv"
        console.log(f"Created CSV file, saved to {filedest}")

    return