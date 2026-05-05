from app import app, socketio

# This file is used by production servers like Gunicorn (on Render) 
# to serve the Flask-SocketIO application.

if __name__ == "__main__":
    socketio.run(app)
