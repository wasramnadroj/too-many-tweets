from flask import Flask, current_app
from flask_script import Manager, Bootstrap #Bootstrap isn't really needed I guess cause of React but I might need later for Jinja
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_PATH = os.path.join(ROOT_DIR, 'build/')

app = Flask(__name__, static_folder='build/', static_url_path=BUILD_PATH, root_path=BUILD_PATH)
manager = Manager(app)
#bootstrap = Bootstrap(app)

@app.route('/')
def root():
    return current_app.send_static_file('index.html')

if __name__ == "__main__":
    manager.run()
