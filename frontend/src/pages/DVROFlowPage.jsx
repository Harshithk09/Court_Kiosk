import React from 'react';
import DVROFlowRunner from '../components/DVROFlowRunner';
import './DVROFlowPage.css';

const DVROFlowPage = () => {
  return (
    <div className="dvro-flow-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Court Kiosk</h1>
          <p>Domestic Violence Restraining Order Assistant</p>
        </div>
      </div>
      
      <main className="page-main">
        <DVROFlowRunner />
      </main>
      
      <footer className="page-footer">
        <div className="footer-content">
          <p>&copy; 2024 San Mateo County Court. This tool provides general information only and is not legal advice.</p>
          <div className="footer-links">
            <a href="/help">Help</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/accessibility">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DVROFlowPage;
