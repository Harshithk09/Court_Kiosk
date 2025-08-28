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
        timeRemaining: "Time Remaining",
        urgencyLevel: "Urgency Level",
        safetyConcerns: "Safety Concerns",
        immediateNeeds: "Immediate Needs",
        complexityFactors: "Complexity Factors",
        specialConsiderations: "Special Considerations",
        progressCompleted: "Progress Completed",
        progressPending: "Progress Pending",
        keyPoints: "Key Points to Cover",
        potentialIssues: "Potential Issues",
        recommendedApproach: "Recommended Approach",
        formsPriority: "Forms Priority",
        timeAllocation: "Time Allocation",
        followUpNeeded: "Follow-up Needed"
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
      urgency: {
        high: "High Urgency",
        medium: "Medium Urgency",
        low: "Low Urgency"
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
        callNext: "Llamar Siguiente",
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
        timeRemaining: "Tiempo Restante",
        urgencyLevel: "Nivel de Urgencia",
        safetyConcerns: "Preocupaciones de Seguridad",
        immediateNeeds: "Necesidades Inmediatas",
        complexityFactors: "Factores de Complejidad",
        specialConsiderations: "Consideraciones Especiales",
        progressCompleted: "Progreso Completado",
        progressPending: "Progreso Pendiente",
        keyPoints: "Puntos Clave a Cubrir",
        potentialIssues: "Problemas Potenciales",
        recommendedApproach: "Enfoque Recomendado",
        formsPriority: "Prioridad de Formularios",
        timeAllocation: "Asignación de Tiempo",
        followUpNeeded: "Seguimiento Necesario"
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
      urgency: {
        high: "Alta Urgencia",
        medium: "Urgencia Media",
        low: "Baja Urgencia"
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

  const API_BASE_URL = 'http://localhost:1904';

  const loadQueueData = async () => {
    try {
      console.log('Loading enhanced queue data...');
      const response = await fetch(`${API_BASE_URL}/api/queue/enhanced/status`);
      const data = await response.json();
      console.log('Enhanced queue data received:', data);
      
      if (data.success) {
        setQueueData(data.queue_data);
      } else {
        console.error('Failed to load queue data:', data.error);
      }
    } catch (error) {
      console.error('Error loading enhanced queue data:', error);
    }
  };

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      // Get the first waiting ticket
      const waitingTickets = queueData.waiting || [];
      if (waitingTickets.length === 0) {
        alert('No cases waiting in queue');
        return;
      }
      
      const nextTicket = waitingTickets[0];
      
      // Update ticket status to in_progress
      const response = await fetch(`${API_BASE_URL}/api/queue/enhanced/ticket/${nextTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'in_progress',
          facilitator_id: 'current_user' 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadQueueData();
        setSelectedCase(nextTicket);
        await loadCaseSummary(nextTicket.summary_id);
      }
    } catch (error) {
      console.error('Error calling next case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCase = async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/enhanced/ticket/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadQueueData();
        if (selectedCase?.id === ticketId) {
          setSelectedCase(null);
          setCaseSummary(null);
        }
      }
    } catch (error) {
      console.error('Error completing case:', error);
    }
  };

  const handleViewDetails = async (ticket) => {
    setSelectedCase(ticket);
    await loadCaseSummary(ticket.summary_id);
  };

  const loadCaseSummary = async (summaryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/case-summary/${summaryId}`);
      const data = await response.json();
      
      if (data.success) {
        setCaseSummary(data.summary);
      } else {
        console.error('Failed to load case summary:', data.error);
      }
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

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
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
                      handleCompleteCase(queueEntry.id);
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

    const situationDetails = caseSummary?.situation_details || {};
    const facilitatorGuidance = caseSummary?.facilitator_guidance || {};

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
            {/* Urgency and Safety Section */}
            <div className="urgency-section">
              <h3>{t.caseDetails.urgencyLevel}</h3>
              <div className="urgency-indicator" style={{ backgroundColor: getUrgencyColor(situationDetails.urgency_level) }}>
                {t.urgency[situationDetails.urgency_level] || 'Medium Urgency'}
              </div>
              
              {situationDetails.safety_concerns && situationDetails.safety_concerns.length > 0 && (
                <div className="safety-concerns">
                  <h4>{t.caseDetails.safetyConcerns}</h4>
                  <ul>
                    {situationDetails.safety_concerns.map((concern, index) => (
                      <li key={index} className="safety-item">{concern}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {situationDetails.immediate_needs && situationDetails.immediate_needs.length > 0 && (
                <div className="immediate-needs">
                  <h4>{t.caseDetails.immediateNeeds}</h4>
                  <ul>
                    {situationDetails.immediate_needs.map((need, index) => (
                      <li key={index} className="urgent-item">{need}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* User Situation Section */}
            {situationDetails.user_situation && Object.keys(situationDetails.user_situation).length > 0 && (
              <div className="user-situation-section">
                <h3>User Situation</h3>
                <div className="situation-grid">
                  {Object.entries(situationDetails.user_situation).map(([key, value]) => (
                    <div key={key} className="situation-item">
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <span className="value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case Specific Details */}
            {situationDetails.case_specific_details && Object.keys(situationDetails.case_specific_details).length > 0 && (
              <div className="case-details-section">
                <h3>Case Specific Details</h3>
                
                {situationDetails.case_specific_details.abuse_types && situationDetails.case_specific_details.abuse_types.length > 0 && (
                  <div className="abuse-types">
                    <h4>Types of Abuse Reported</h4>
                    <ul>
                      {situationDetails.case_specific_details.abuse_types.map((type, index) => (
                        <li key={index} className="abuse-type-item">• {type}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {situationDetails.case_specific_details.incident_description && situationDetails.case_specific_details.incident_description !== 'Not provided' && (
                  <div className="incident-description">
                    <h4>Incident Description</h4>
                    <p>{situationDetails.case_specific_details.incident_description}</p>
                  </div>
                )}
                
                <div className="case-details-grid">
                  {Object.entries(situationDetails.case_specific_details).map(([key, value]) => {
                    if (key === 'abuse_types' || key === 'incident_description') return null;
                    return (
                      <div key={key} className="case-detail-item">
                        <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <span className="value">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Progress Section */}
            {situationDetails.form_progress && Object.keys(situationDetails.form_progress).length > 0 && (
              <div className="form-progress-section">
                <h3>Form Progress</h3>
                
                <div className="form-status">
                  <div className="status-item">
                    <label>Forms Started:</label>
                    <span className={`status ${situationDetails.form_progress.forms_started === 'yes' ? 'completed' : 'pending'}`}>
                      {situationDetails.form_progress.forms_started === 'yes' ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  
                  <div className="status-item">
                    <label>Filing Ready:</label>
                    <span className={`status ${situationDetails.form_progress.filing_ready === 'yes' ? 'completed' : 'pending'}`}>
                      {situationDetails.form_progress.filing_ready === 'yes' ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  
                  <div className="status-item">
                    <label>Service Planned:</label>
                    <span className={`status ${situationDetails.form_progress.service_planned === 'yes' ? 'completed' : 'pending'}`}>
                      {situationDetails.form_progress.service_planned === 'yes' ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
                
                {situationDetails.form_progress.forms_completed && situationDetails.form_progress.forms_completed.length > 0 && (
                  <div className="forms-completed">
                    <h4>Forms Completed</h4>
                    <ul>
                      {situationDetails.form_progress.forms_completed.map((form, index) => (
                        <li key={index} className="completed-form">✓ {form}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {situationDetails.form_progress.forms_not_started && situationDetails.form_progress.forms_not_started.length > 0 && (
                  <div className="forms-needed">
                    <h4>Forms Still Needed</h4>
                    <ul>
                      {situationDetails.form_progress.forms_not_started.map((form, index) => (
                        <li key={index} className="needed-form">⏳ {form}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Status Section */}
            {situationDetails.evidence_status && Object.keys(situationDetails.evidence_status).length > 0 && (
              <div className="evidence-section">
                <h3>Evidence Status</h3>
                
                <div className="evidence-grid">
                  {Object.entries(situationDetails.evidence_status).map(([key, value]) => (
                    <div key={key} className="evidence-item">
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <span className={`evidence-status ${value === 'yes' ? 'available' : 'not-available'}`}>
                        {value === 'yes' ? '✓ Available' : '✗ Not Available'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationship Details Section */}
            {situationDetails.relationship_details && Object.keys(situationDetails.relationship_details).length > 0 && (
              <div className="relationship-section">
                <h3>Respondent Information</h3>
                
                <div className="respondent-info">
                  <div className="respondent-name">
                    <label>Name:</label>
                    <span className="value">{situationDetails.relationship_details.abuser_name}</span>
                  </div>
                  
                  <div className="respondent-contact">
                    <div className="contact-item">
                      <label>Address:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_address}</span>
                    </div>
                    <div className="contact-item">
                      <label>Phone:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_phone}</span>
                    </div>
                    <div className="contact-item">
                      <label>Workplace:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_workplace}</span>
                    </div>
                  </div>
                  
                  <div className="respondent-details">
                    <div className="detail-item">
                      <label>Vehicle:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_vehicle}</span>
                    </div>
                    <div className="detail-item">
                      <label>Weapons:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_weapons}</span>
                    </div>
                    <div className="detail-item">
                      <label>Criminal History:</label>
                      <span className="value">{situationDetails.relationship_details.abuser_criminal_history}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Children Information Section */}
            {situationDetails.children_involved && situationDetails.children_involved.involved !== false && (
              <div className="children-section">
                <h3>Children Information</h3>
                
                <div className="children-details">
                  <div className="children-basic">
                    <div className="detail-item">
                      <label>Number of Children:</label>
                      <span className="value">{situationDetails.children_involved.number_of_children}</span>
                    </div>
                    <div className="detail-item">
                      <label>Ages:</label>
                      <span className="value">{situationDetails.children_involved.children_ages}</span>
                    </div>
                    <div className="detail-item">
                      <label>Names:</label>
                      <span className="value">{situationDetails.children_involved.children_names}</span>
                    </div>
                  </div>
                  
                  <div className="children-schools">
                    <label>Schools:</label>
                    <span className="value">{situationDetails.children_involved.children_schools}</span>
                  </div>
                  
                  <div className="children-custody">
                    <div className="custody-item">
                      <label>Current Custody:</label>
                      <span className="value">{situationDetails.children_involved.custody_current}</span>
                    </div>
                    <div className="custody-item">
                      <label>Current Visitation:</label>
                      <span className="value">{situationDetails.children_involved.visitation_current}</span>
                    </div>
                  </div>
                  
                  <div className="children-impact">
                    <div className="impact-item">
                      <label>Children Witnessed Abuse:</label>
                      <span className="value">{situationDetails.children_involved.children_witnessed_abuse}</span>
                    </div>
                    <div className="impact-item">
                      <label>Children Affected:</label>
                      <span className="value">{situationDetails.children_involved.children_affected}</span>
                    </div>
                    <div className="impact-item">
                      <label>Abduction Risk:</label>
                      <span className="value">{situationDetails.children_involved.abduction_risk}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Matters Section */}
            {situationDetails.financial_matters && situationDetails.financial_matters.involved !== false && (
              <div className="financial-section">
                <h3>Financial Matters</h3>
                
                <div className="financial-details">
                  <div className="support-info">
                    <label>Support Type:</label>
                    <span className="value">{situationDetails.financial_matters.support_type}</span>
                  </div>
                  
                  <div className="financial-docs">
                    <div className="doc-item">
                      <label>Income Information:</label>
                      <span className="value">{situationDetails.financial_matters.income_information}</span>
                    </div>
                    <div className="doc-item">
                      <label>Expense Information:</label>
                      <span className="value">{situationDetails.financial_matters.expense_information}</span>
                    </div>
                  </div>
                  
                  <div className="assets-debts">
                    <div className="asset-item">
                      <label>Assets Involved:</label>
                      <span className="value">{situationDetails.financial_matters.assets_involved}</span>
                    </div>
                    <div className="asset-item">
                      <label>Debts Involved:</label>
                      <span className="value">{situationDetails.financial_matters.debts_involved}</span>
                    </div>
                    <div className="asset-item">
                      <label>Bank Accounts:</label>
                      <span className="value">{situationDetails.financial_matters.bank_accounts}</span>
                    </div>
                    <div className="asset-item">
                      <label>Property Ownership:</label>
                      <span className="value">{situationDetails.financial_matters.property_ownership}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal History Section */}
            {situationDetails.legal_history && Object.keys(situationDetails.legal_history).length > 0 && (
              <div className="legal-history-section">
                <h3>Legal History</h3>
                
                <div className="legal-history-grid">
                  {Object.entries(situationDetails.legal_history).map(([key, value]) => (
                    <div key={key} className="legal-history-item">
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <span className="value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Needs Section */}
            {situationDetails.support_needs && Object.keys(situationDetails.support_needs).length > 0 && (
              <div className="support-needs-section">
                <h3>Support Needs</h3>
                
                <div className="support-needs-grid">
                  {Object.entries(situationDetails.support_needs).map(([key, value]) => (
                    <div key={key} className="support-need-item">
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <span className={`support-status ${value === 'yes' ? 'needed' : 'not-needed'}`}>
                        {value === 'yes' ? '✓ Needed' : '✗ Not Needed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Tracking Section */}
            <div className="progress-section">
              <h3>Progress Tracking</h3>
              
              {situationDetails.progress_completed && situationDetails.progress_completed.length > 0 && (
                <div className="progress-completed">
                  <h4>{t.caseDetails.progressCompleted}</h4>
                  <ul>
                    {situationDetails.progress_completed.map((item, index) => (
                      <li key={index} className="completed-item">✓ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {situationDetails.progress_pending && situationDetails.progress_pending.length > 0 && (
                <div className="progress-pending">
                  <h4>{t.caseDetails.progressPending}</h4>
                  <ul>
                    {situationDetails.progress_pending.map((item, index) => (
                      <li key={index} className="pending-item">⏳ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Complexity and Special Considerations */}
            <div className="complexity-section">
              {situationDetails.complexity_factors && situationDetails.complexity_factors.length > 0 && (
                <div className="complexity-factors">
                  <h4>{t.caseDetails.complexityFactors}</h4>
                  <ul>
                    {situationDetails.complexity_factors.map((factor, index) => (
                      <li key={index} className="complexity-item">{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {situationDetails.special_considerations && situationDetails.special_considerations.length > 0 && (
                <div className="special-considerations">
                  <h4>{t.caseDetails.specialConsiderations}</h4>
                  <ul>
                    {situationDetails.special_considerations.map((consideration, index) => (
                      <li key={index} className="special-item">{consideration}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Facilitator Guidance Section */}
            <div className="guidance-section">
              <h3>Facilitator Guidance</h3>
              
              {facilitatorGuidance.recommended_approach && (
                <div className="recommended-approach">
                  <h4>{t.caseDetails.recommendedApproach}</h4>
                  <p>{facilitatorGuidance.recommended_approach}</p>
                </div>
              )}
              
              {facilitatorGuidance.key_points_to_cover && facilitatorGuidance.key_points_to_cover.length > 0 && (
                <div className="key-points">
                  <h4>{t.caseDetails.keyPoints}</h4>
                  <ul>
                    {facilitatorGuidance.key_points_to_cover.map((point, index) => (
                      <li key={index} className="key-point-item">• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {facilitatorGuidance.forms_priority && facilitatorGuidance.forms_priority.length > 0 && (
                <div className="forms-priority">
                  <h4>{t.caseDetails.formsPriority}</h4>
                  <ul>
                    {facilitatorGuidance.forms_priority.map((form, index) => (
                      <li key={index} className="priority-form-item">#{index + 1} {form}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {facilitatorGuidance.time_allocation && Object.keys(facilitatorGuidance.time_allocation).length > 0 && (
                <div className="time-allocation">
                  <h4>{t.caseDetails.timeAllocation}</h4>
                  <div className="time-grid">
                    {Object.entries(facilitatorGuidance.time_allocation).map(([activity, minutes]) => (
                      <div key={activity} className="time-item">
                        <span className="activity">{activity.replace('_', ' ')}</span>
                        <span className="minutes">{minutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {facilitatorGuidance.potential_issues && facilitatorGuidance.potential_issues.length > 0 && (
                <div className="potential-issues">
                  <h4>{t.caseDetails.potentialIssues}</h4>
                  <ul>
                    {facilitatorGuidance.potential_issues.map((issue, index) => (
                      <li key={index} className="issue-item">⚠️ {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {facilitatorGuidance.follow_up_needed && facilitatorGuidance.follow_up_needed.length > 0 && (
                <div className="follow-up-needed">
                  <h4>{t.caseDetails.followUpNeeded}</h4>
                  <ul>
                    {facilitatorGuidance.follow_up_needed.map((item, index) => (
                      <li key={index} className="follow-up-item">📋 {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Original Summary Content */}
            <div className="summary-content">
              <h3>{t.caseDetails.summary}</h3>
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
                <h4>{t.caseDetails.timeRemaining}</h4>
                <p className="time-remaining">
                  {situationDetails.estimated_completion_time || 30} minutes
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="case-actions-panel">
          <button 
            className="btn-primary"
            onClick={() => handleCompleteCase(selectedCase.id)}
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
