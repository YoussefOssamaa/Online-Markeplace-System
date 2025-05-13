Resources Needed

1. Python Environment:
 Python 3.9 or higher
 pip (Python package manager)

2. Database:
 PostgreSQL 13.0 or higher
 pgAdmin (optional, for database management)

3. Web Browser:
 Google Chrome (recommended)
 Mozilla Firefox
 Microsoft Edge (Chromium-based)

4. Code Editor (optional for code examination):
 Visual Studio Code
 PyCharm
 Any text editor

Required Python Packages
Install the following packages using pip:
pip install flask
pip install flask-cors
pip install sqlalchemy
pip install marshmallow
pip install psycopg2-binary
pip install werkzeug


Setup Instructions

1. Database Configuration
 Install PostgreSQL if not already installed
 Create a new database named online_marketplace
 Configure database connection in db_config.py:
         Update host, port, username, password, and database name as needed


2. Application Setup

 Clone or download the repository 

 https://github.com/YoussefOssamaa/Online-Markeplace-System.git

 Navigate to the project directory
 Install required packages:
 pip install -r requirements.txt


 Set up the database tables:
 python db_config.py


 Initialize categories:

python -
c "from index import app, reset_categories; with app.app_context(): print(reset_categories())"

3. Running the Application
 Start the backend server:
 python index.py
 The API will be available at http://127.0.0.1:5000/
 Open the frontend HTML file in a web browser:
 Navigate to frontend/index.html
 Or set up a simple HTTP server: python -m http.server 5500 in the frontend directory