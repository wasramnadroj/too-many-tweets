from flask import Flask
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_PATH = os.path.join(ROOT_DIR, 'build/')

app = Flask(__name__, static_folder='build/', static_url_path=BUILD_PATH, root_path=BUILD_PATH)

@app.route('/')
def root():
    return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run()
