from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import os 
import matplotlib.pyplot as plt

app = Flask(__name__, 
    static_url_path='/static',
    static_folder='static',
    template_folder='templates')
CORS(app)  
    
plt.switch_backend('agg') 

# Define the path to the CSV file once to avoid repetition
DATA_PATH = 'data/dataMada.csv'

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/columns")
def get_columns():
    """This is a new route to get the column names for the dropdown."""
    try:
        dataFile = pd.read_csv(DATA_PATH)
       
        columns = [col for col in dataFile.columns if col != 'Year']
        return jsonify(columns)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route("/data")
def get_data():
    try:
        column = request.args.get('column')
        if not column:
            return jsonify({"error": "No column specified"}), 400
            
        dataFile = pd.read_csv(DATA_PATH)
        if column not in dataFile.columns:
            return jsonify({"error": "Column not found"}), 404
            
        # Replace NaN values with None (which becomes null in JSON)
        years = dataFile['Year'].replace([np.nan], [None]).tolist()
        values = dataFile[column].replace([np.nan], [None]).tolist()
        
        data = {
            'years': years,
            'values': values,
            'column': column
        }
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/graph")
def graph_data():
    try:
        column_name = request.args.get('column')
        if not column_name:
            return "<p>Please select a column to plot.</p>", 400

        dataFile = pd.read_csv(DATA_PATH)

        if column_name not in dataFile.columns:
            return f"<p>Error: Column '{column_name}' not found in the data.</p>", 400

        plt.figure(figsize=(10,6))
        plt.plot(dataFile['Year'], dataFile[column_name], marker='o')
        plt.title(f'{column_name} over Years')
        plt.xlabel('Year')
        plt.ylabel(column_name)
        plt.grid(True)
        
        if not os.path.exists('static'):
            os.makedirs('static')
            
        graph_path = os.path.join('static', 'graph.png')
        plt.savefig(graph_path)
        plt.close()
        
        #
        import time
        return f'<img src="/static/graph.png?t={time.time()}" alt="Graph of {column_name}">'
       
    except Exception as e:
        return f"<p>An error occurred: {e}</p>", 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Changed port to 5001