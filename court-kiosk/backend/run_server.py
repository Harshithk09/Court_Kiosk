#!/usr/bin/env python3

from app import app, db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database initialized successfully")
    
    print("Starting Flask server on port 1904...")
    app.run(host='0.0.0.0', port=1904, debug=False)
