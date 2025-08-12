import unittest
import json
import tempfile
import os
from app import app, db, Config

class CourtKioskTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test environment"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        """Clean up after tests"""
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = self.app.get('/api/health')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'OK')
    
    def test_generate_queue_missing_data(self):
        """Test queue generation with missing data"""
        response = self.app.post('/api/generate-queue', 
                               json={})
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', data)
    
    def test_generate_queue_success(self):
        """Test successful queue generation"""
        response = self.app.post('/api/generate-queue', 
                               json={
                                   'case_type': 'DVRO',
                                   'priority': 'A',
                                   'language': 'en'
                               })
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('queue_number', data)
        self.assertTrue(data['queue_number'].startswith('DVRO'))
    
    def test_flowchart_endpoint_missing_file(self):
        """Test flowchart endpoint when file is missing"""
        # Temporarily rename the file to test missing file scenario
        original_name = 'flowchart.json'
        temp_name = 'flowchart_temp.json'
        
        if os.path.exists(original_name):
            os.rename(original_name, temp_name)
        
        try:
            response = self.app.get('/api/flowchart')
            data = json.loads(response.data)
            
            self.assertEqual(response.status_code, 404)
            self.assertIn('error', data)
        finally:
            # Restore the file
            if os.path.exists(temp_name):
                os.rename(temp_name, original_name)
    
    def test_dvro_rag_missing_question(self):
        """Test DVRO RAG endpoint with missing question"""
        response = self.app.post('/api/dvro_rag', 
                               json={'language': 'en'})
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('answer', data)
    
    def test_config_validation(self):
        """Test configuration validation"""
        # Test that config can be imported and has required attributes
        self.assertTrue(hasattr(Config, 'SQLALCHEMY_DATABASE_URI'))
        self.assertTrue(hasattr(Config, 'EMAIL_HOST'))
        self.assertTrue(hasattr(Config, 'get_search_url'))
    
    def test_queue_number_format(self):
        """Test queue number format handling"""
        # Test with single character case type
        response1 = self.app.post('/api/generate-queue', 
                                json={
                                    'case_type': 'A',
                                    'priority': 'A',
                                    'language': 'en'
                                })
        data1 = json.loads(response1.data)
        self.assertTrue(data1['queue_number'].startswith('A'))
        
        # Test with multi-character case type
        response2 = self.app.post('/api/generate-queue', 
                                json={
                                    'case_type': 'DVRO',
                                    'priority': 'A',
                                    'language': 'en'
                                })
        data2 = json.loads(response2.data)
        self.assertTrue(data2['queue_number'].startswith('DVRO'))

if __name__ == '__main__':
    unittest.main() 