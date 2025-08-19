import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import './EnhancedAdminDashboard.css';

const EnhancedAdminDashboard = () => {
  const { language } = useContext(LanguageContext);
  const [queueData, setQueueData] = useState({
    waiting: [],
    in_progress: [],
    completed: []
  });
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSummary, setCaseSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const translations = {
    en: {
      title: "Facilitator Dashboard",
      subtitle: "Manage court cases and provide assistance",
      queue: {
        title: "Queue Management",
        waiting: "Waiting",
        inProgress: "In Progress",
        completed: "Completed",
        totalWaiting: "Total Waiting",
        totalInProgress: "Total In Progress",
        nextCase: "Next Case",
        callNext: "Call Next",
        completeCase: "Complete Case",
        viewDetails: "View Details"
      },
      caseDetails: {
        title: "Case Details",
        queueNumber: "Queue Number",
        caseType: "Case Type",
        userName: "User Name",
        language: "Language",
        waitTime: "Wait Time",
        priority: "Priority",
        status: "Status",
        progress: "Progress",
        summary: "Summary",
        forms: "Forms Needed",
        nextSteps: "Next Steps",
        concerns: "Concerns",
        timeRemaining: "Time Remaining"
      },
      actions: {
        callNext: "Call Next Case",
        complete: "Complete Case",
        assign: "Assign to Me",
        refresh: "Refresh Queue",
        export: "Export Data"
      },
      priority: {
        A: "High Priority (DV)",
        B: "Medium Priority",
        C: "Lower Priority",
        D: "General Assistance"
      },
      status: {
        waiting: "Waiting",
        in_progress: "In Progress",
        completed: "Completed"
      }
    },
    es: {
      title: "Panel de Facilitador",
      subtitle: "Gestionar casos judiciales y proporcionar asistencia",
      queue: {
        title: "Gestión de Cola",
        waiting: "Esperando",
        inProgress: "En Progreso",
        completed: "Completado",
        totalWaiting: "Total Esperando",
        totalInProgress: "Total En Progreso",
        nextCase: "Próximo Caso",
        callNext: "Llamar Próximo",
        completeCase: "Completar Caso",
        viewDetails: "Ver Detalles"
      },
      caseDetails: {
        title: "Detalles del Caso",
        queueNumber: "Número de Cola",
        caseType: "Tipo de Caso",
        userName: "Nombre del Usuario",
        language: "Idioma",
        waitTime: "Tiempo de Espera",
        priority: "Prioridad",
        status: "Estado",
        progress: "Progreso",
        summary: "Resumen",
        forms: "Formularios Necesarios",
        nextSteps: "Próximos Pasos",
        concerns: "Preocupaciones",
        timeRemaining: "Tiempo Restante"
      },
      actions: {
        callNext: "Llamar Próximo Caso",
        complete: "Completar Caso",
        assign: "Asignar a Mí",
        refresh: "Actualizar Cola",
        export: "Exportar Datos"
      },
      priority: {
        A: "Alta Prioridad (DV)",
        B: "Prioridad Media",
        C: "Prioridad Baja",
        D: "Asistencia General"
      },
      status: {
        waiting: "Esperando",
        in_progress: "En Progreso",
        completed: "Completado"
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadQueueData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadQueueData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadQueueData = async () => {
    try {
      const response = await fetch('/api/queue/status');
      const data = await response.json();
      setQueueData(data);
    } catch (error) {
      console.error('Error loading queue data:', error);
    }
  };

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/queue/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilitator_id: 'current_user' })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadQueueData();
        if (result.queue_entry) {
          setSelectedCase(result.queue_entry);
          await loadCaseSummary(result.queue_entry.queue_number);
        }
      }
    } catch (error) {
      console.error('Error calling next case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCase = async (queueNumber) => {
    try {
      const response = await fetch('/api/queue/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_number: queueNumber })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadQueueData();
        if (selectedCase?.queue_number === queueNumber) {
          setSelectedCase(null);
          setCaseSummary(null);
        }
      }
    } catch (error) {
      console.error('Error completing case:', error);
    }
  };

  const handleViewDetails = async (queueEntry) => {
    setSelectedCase(queueEntry);
    await loadCaseSummary(queueEntry.queue_number);
  };

  const loadCaseSummary = async (queueNumber) => {
    try {
      const response = await fetch(`/api/queue/summary/${queueNumber}`);
      const data = await response.json();
      setCaseSummary(data);
    } catch (error) {
      console.error('Error loading case summary:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return '#e74c3c';
      case 'B': return '#f39c12';
      case 'C': return '#3498db';
      case 'D': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#f39c12';
      case 'in_progress': return '#3498db';
      case 'completed': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderQueueSection = (title, cases, status) => (
    <div className="queue-section">
      <div className="section-header">
        <h3>{title}</h3>
        <span className="case-count">{cases.length}</span>
      </div>
      
      <div className="case-list">
        {cases.length === 0 ? (
          <div className="empty-state">
            <p>{language === 'en' ? 'No cases' : 'Sin casos'}</p>
          </div>
        ) : (
          cases.map((queueEntry) => (
            <div 
              key={queueEntry.id} 
              className={`case-card ${selectedCase?.id === queueEntry.id ? 'selected' : ''}`}
              onClick={() => handleViewDetails(queueEntry)}
            >
              <div className="case-header">
                <div className="queue-number">
                  <span className="number">{queueEntry.queue_number}</span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(queueEntry.priority_level) }}
                  >
                    {queueEntry.priority_level}
                  </span>
                </div>
                
                <div className="case-info">
                  <div className="user-name">{queueEntry.user_name || 'Anonymous'}</div>
                  <div className="case-type">{queueEntry.case_type}</div>
                  <div className="language">{queueEntry.language.toUpperCase()}</div>
                </div>
                
                <div className="case-metrics">
                  <div className="wait-time">
                    {formatWaitTime(queueEntry.estimated_wait_time)}
                  </div>
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(queueEntry.status) }}
                  >
                    {t.status[queueEntry.status]}
                  </div>
                </div>
              </div>
              
              {status === 'in_progress' && (
                <div className="case-actions">
                  <button 
                    className="btn-complete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteCase(queueEntry.queue_number);
                    }}
                  >
                    {t.actions.complete}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCaseDetails = () => {
    if (!selectedCase) return null;

    return (
      <div className="case-details-panel">
        <div className="panel-header">
          <h2>{t.caseDetails.title}</h2>
          <button 
            className="btn-close"
            onClick={() => {
              setSelectedCase(null);
              setCaseSummary(null);
            }}
          >
            ×
          </button>
        </div>
        
        <div className="case-info-grid">
          <div className="info-item">
            <label>{t.caseDetails.queueNumber}</label>
            <span className="value">{selectedCase.queue_number}</span>
          </div>
          
          <div className="info-item">
            <label>{t.caseDetails.caseType}</label>
            <span className="value">{selectedCase.case_type}</span>
          </div>
          
          <div className="info-item">
            <label>{t.caseDetails.userName}</label>
            <span className="value">{selectedCase.user_name || 'Not provided'}</span>
          </div>
          
          <div className="info-item">
            <label>{t.caseDetails.language}</label>
            <span className="value">{selectedCase.language.toUpperCase()}</span>
          </div>
          
          <div className="info-item">
            <label>{t.caseDetails.waitTime}</label>
            <span className="value">{formatWaitTime(selectedCase.estimated_wait_time)}</span>
          </div>
          
          <div className="info-item">
            <label>{t.caseDetails.priority}</label>
            <span 
              className="value priority"
              style={{ color: getPriorityColor(selectedCase.priority_level) }}
            >
              {t.priority[selectedCase.priority_level]}
            </span>
          </div>
        </div>
        
        {caseSummary && (
          <div className="case-summary">
            <h3>{t.caseDetails.summary}</h3>
            <div className="summary-content">
              <p>{caseSummary.summary}</p>
            </div>
            
            <div className="summary-details">
              <div className="detail-section">
                <h4>{t.caseDetails.forms}</h4>
                <ul>
                  {caseSummary.forms_needed?.map((form, index) => (
                    <li key={index}>{form}</li>
                  )) || <li>No specific forms identified</li>}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>{t.caseDetails.nextSteps}</h4>
                <ul>
                  {caseSummary.next_steps?.map((step, index) => (
                    <li key={index}>{step}</li>
                  )) || <li>Continue with court process</li>}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>{t.caseDetails.concerns}</h4>
                <ul>
                  {caseSummary.concerns?.map((concern, index) => (
                    <li key={index}>{concern}</li>
                  )) || <li>No immediate concerns</li>}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>{t.caseDetails.timeRemaining}</h4>
                <p className="time-remaining">
                  {caseSummary.time_estimate || 30} minutes
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="case-actions-panel">
          <button 
            className="btn-primary"
            onClick={() => handleCompleteCase(selectedCase.queue_number)}
          >
            {t.actions.complete}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => {
              // Print or export case details
              window.print();
            }}
          >
            {t.actions.export}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleCallNext}
            disabled={isLoading || queueData.waiting.length === 0}
          >
            {isLoading ? 'Processing...' : t.actions.callNext}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={loadQueueData}
          >
            {t.actions.refresh}
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="queue-overview">
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-number">{queueData.waiting.length}</div>
              <div className="stat-label">{t.queue.totalWaiting}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{queueData.in_progress.length}</div>
              <div className="stat-label">{t.queue.totalInProgress}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{queueData.completed.length}</div>
              <div className="stat-label">{t.queue.completed}</div>
            </div>
          </div>
          
          <div className="queue-sections">
            <div className="queue-column">
              {renderQueueSection(t.queue.waiting, queueData.waiting, 'waiting')}
            </div>
            
            <div className="queue-column">
              {renderQueueSection(t.queue.inProgress, queueData.in_progress, 'in_progress')}
            </div>
            
            <div className="queue-column">
              {renderQueueSection(t.queue.completed, queueData.completed, 'completed')}
            </div>
          </div>
        </div>
        
        {renderCaseDetails()}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
