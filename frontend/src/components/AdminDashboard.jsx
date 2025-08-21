import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { language } = useLanguage();
  const [queueStatus, setQueueStatus] = useState(null);
  const [facilitatorCases, setFacilitatorCases] = useState([]);
  const [facilitators, setFacilitators] = useState([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSummary, setCaseSummary] = useState(null);
  const [selectedCaseInfo, setSelectedCaseInfo] = useState(null);

  // Use the same API base URL as the existing system
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    fetchQueueStatus();
    fetchFacilitators();
    const interval = setInterval(fetchQueueStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedFacilitator) {
      fetchFacilitatorCases(selectedFacilitator.id);
    } else {
      fetchFacilitatorCases();
    }
  }, [selectedFacilitator]);

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/status`);
      const data = await response.json();
      setQueueStatus(data);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const fetchFacilitators = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facilitators`);
      const data = await response.json();
      setFacilitators(data);
    } catch (error) {
      console.error('Error fetching facilitators:', error);
      // Fallback to empty array if API fails
      setFacilitators([]);
    }
  };

  const fetchFacilitatorCases = async (facilitatorId = null) => {
    try {
      const url = facilitatorId 
        ? `${API_BASE_URL}/api/facilitator/cases?facilitator_id=${facilitatorId}`
        : `${API_BASE_URL}/api/facilitator/cases`;
      const response = await fetch(url);
      const data = await response.json();
      setFacilitatorCases(data);
    } catch (error) {
      console.error('Error fetching facilitator cases:', error);
      // Fallback to empty array if API fails
      setFacilitatorCases([]);
    }
  };

  const getNextCase = async () => {
    setLoading(true);
    try {
      const url = selectedFacilitator 
        ? `${API_BASE_URL}/api/facilitator/next-case?facilitator_id=${selectedFacilitator.id}`
        : `${API_BASE_URL}/api/facilitator/next-case`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.case) {
        // Assign the case to the selected facilitator
        await assignCase(data.case.queue_number, selectedFacilitator?.id);
        fetchFacilitatorCases(selectedFacilitator?.id);
        fetchQueueStatus();
      } else {
        alert(language === 'es' ? 'No hay casos esperando en la cola' : 'No cases waiting in queue');
      }
    } catch (error) {
      console.error('Error getting next case:', error);
      alert(language === 'es' ? 'Error al obtener el siguiente caso' : 'Error getting next case');
    } finally {
      setLoading(false);
    }
  };

  const assignCase = async (queueNumber, facilitatorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/${queueNumber}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facilitator_id: facilitatorId }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error assigning case:', error);
      return false;
    }
  };

  const getCaseSummary = async (queueEntry) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/${queueEntry.queue_number}/summary`);
      const data = await response.json();
      if (data.success) {
        setCaseSummary(data.summary);
        setSelectedCase(queueEntry.queue_number);
        setSelectedCaseInfo(queueEntry);
      }
    } catch (error) {
      console.error('Error getting case summary:', error);
    }
  };

  const completeCase = async (queueNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/${queueNumber}/complete`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchFacilitatorCases(selectedFacilitator?.id);
        fetchQueueStatus();
        setSelectedCase(null);
        setCaseSummary(null);
        setSelectedCaseInfo(null);
      }
    } catch (error) {
      console.error('Error completing case:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return '#dc2626';
      case 'B': return '#ea580c';
      case 'C': return '#ca8a04';
      case 'D': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="court-branding">
          <div className="court-seal-small">
            <span>SM</span>
          </div>
          <div className="court-title">
            <h1>San Mateo Family Court Clinic</h1>
            <p>Facilitator Dashboard</p>
          </div>
        </div>
        <div className="facilitator-selector">
          <label>{language === 'es' ? 'Facilitador:' : 'Facilitator:'}</label>
          <select 
            value={selectedFacilitator?.id || ''} 
            onChange={(e) => {
              const facilitator = facilitators.find(f => f.id === parseInt(e.target.value));
              setSelectedFacilitator(facilitator || null);
            }}
          >
            <option value="">{language === 'es' ? 'Todos los facilitadores' : 'All facilitators'}</option>
            {facilitators.map(facilitator => (
              <option key={facilitator.id} value={facilitator.id}>
                {facilitator.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Status Overview */}
      <div className="queue-overview">
        <h2>{language === 'es' ? 'Estado de la Cola' : 'Queue Status'}</h2>
        {queueStatus && (
          <div className="status-cards">
            <div className="status-card">
              <div className="status-number">{queueStatus.total_waiting || 0}</div>
              <div className="status-label">{language === 'es' ? 'Esperando' : 'Waiting'}</div>
            </div>
            <div className="status-card">
              <div className="status-number">{queueStatus.total_in_progress || 0}</div>
              <div className="status-label">{language === 'es' ? 'En Proceso' : 'In Progress'}</div>
            </div>
            <div className="status-card">
              <div className="status-number">
                {queueStatus.waiting?.filter(c => c.priority_level === 'A').length || 0}
              </div>
              <div className="status-label">{language === 'es' ? 'Prioridad A' : 'Priority A'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Next Case Button */}
      <div className="next-case-section">
        <button 
          className="btn btn-primary"
          onClick={getNextCase}
          disabled={loading}
        >
          {loading 
            ? (language === 'es' ? 'Obteniendo caso...' : 'Getting case...')
            : (language === 'es' ? 'Obtener Siguiente Caso' : 'Get Next Case')
          }
        </button>
      </div>

      {/* Waiting Cases */}
      {queueStatus?.waiting && queueStatus.waiting.length > 0 && (
        <div className="cases-section">
          <h2>{language === 'es' ? 'Casos en espera' : 'Waiting Cases'}</h2>
          <div className="cases-grid">
            {queueStatus.waiting.map((entry) => (
              <div
                key={entry.queue_number}
                className={`case-card ${selectedCase === entry.queue_number ? 'selected' : ''}`}
                onClick={() => getCaseSummary(entry)}
              >
                <div className="case-header">
                  <div
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(entry.priority_level) }}
                  >
                    {entry.priority_level}
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(entry.status) }}
                  >
                    {entry.status}
                  </div>
                </div>
                <div className="case-number">{entry.queue_number}</div>
                <div className="case-type">{entry.case_type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Cases */}
      <div className="cases-section">
        <h2>{language === 'es' ? 'Casos Asignados' : 'Assigned Cases'}</h2>
        <div className="cases-grid">
          {facilitatorCases.map((facilitatorCase) => {
            const queueEntry = facilitatorCase.queue_entry;
            return (
              <div
                key={facilitatorCase.id}
                className={`case-card ${selectedCase === queueEntry.queue_number ? 'selected' : ''}`}
                onClick={() => getCaseSummary(queueEntry)}
              >
                <div className="case-header">
                  <div
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(queueEntry.priority_level) }}
                  >
                    {queueEntry.priority_level}
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(queueEntry.status) }}
                  >
                    {queueEntry.status}
                  </div>
                </div>
                <div className="case-number">{queueEntry.queue_number}</div>
                <div className="case-type">{queueEntry.case_type}</div>
                <div className="case-info">
                  <p><strong>{language === 'es' ? 'Idioma:' : 'Language:'}</strong> {queueEntry.language}</p>
                  {queueEntry.user_name && (
                    <p><strong>{language === 'es' ? 'Nombre:' : 'Name:'}</strong> {queueEntry.user_name}</p>
                  )}
                  <p><strong>{language === 'es' ? 'Creado:' : 'Created:'}</strong> {new Date(queueEntry.created_at).toLocaleTimeString()}</p>
                </div>
                {queueEntry.current_node && (
                  <div className="current-node">
                    <strong>{language === 'es' ? 'Nodo actual:' : 'Current node:'}</strong> {queueEntry.current_node}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Summary Modal */}
      {selectedCase && caseSummary && (
        <div className="modal-overlay" onClick={() => { setSelectedCase(null); setSelectedCaseInfo(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{language === 'es' ? 'Resumen del Caso' : 'Case Summary'}</h3>
              <button
                className="close-btn"
                onClick={() => { setSelectedCase(null); setSelectedCaseInfo(null); }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="case-details">
                <h4>{language === 'es' ? 'Información del Caso' : 'Case Information'}</h4>
                <p><strong>{language === 'es' ? 'Número de cola:' : 'Queue number:'}</strong> {selectedCase}</p>
                <p><strong>{language === 'es' ? 'Tipo de caso:' : 'Case type:'}</strong> {selectedCaseInfo?.case_type}</p>
              </div>
              <div className="case-summary">
                <h4>{language === 'es' ? 'Resumen de la Conversación' : 'Conversation Summary'}</h4>
                <div className="summary-text">{caseSummary}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => { setSelectedCase(null); setSelectedCaseInfo(null); }}
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
              <button
                className="btn btn-success"
                onClick={() => completeCase(selectedCase)}
              >
                {language === 'es' ? 'Marcar como Completado' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
