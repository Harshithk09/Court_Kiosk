#!/usr/bin/env python3

import traceback
from app import app, db
from sqlalchemy import text

def test_database():
    try:
        with app.app_context():
            # Test database connection
            result = db.session.execute(text('SELECT 1')).fetchone()
            print(f"Database connection test: {result}")
            
            # Test QueueEntry model
            from app import QueueEntry
            count = QueueEntry.query.count()
            print(f"QueueEntry count: {count}")
            
            return True
    except Exception as e:
        print(f"Database test failed: {e}")
        traceback.print_exc()
        return False

def test_generate_queue():
    try:
        with app.test_client() as client:
            response = client.post('/api/generate-queue', 
                                json={'case_type': 'TEST', 'priority': 'A', 'language': 'en'})
            print(f"Generate queue test: {response.status_code}")
            print(f"Response: {response.get_data(as_text=True)}")
            return response.status_code == 200
    except Exception as e:
        print(f"Generate queue test failed: {e}")
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Testing database connection...")
    if test_database():
        print("Database test passed!")
        
        print("Testing generate-queue endpoint...")
        if test_generate_queue():
            print("Generate queue test passed!")
        else:
            print("Generate queue test failed!")
    else:
        print("Database test failed!")
