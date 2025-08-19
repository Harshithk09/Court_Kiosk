import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './QueueInterface.css';

const QueueInterface = ({ onQueueJoined, onBack }) => {
  const { language, t } = useLanguage();
  const [caseTypes, setCaseTypes] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [queueNumber, setQueueNumber] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);

  // Use the same API base URL as the existing system
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    fetchCaseTypes();
    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCaseTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/case-types`);
      const data = await response.json();
      setCaseTypes(data);
    } catch (error) {
      console.error('Error fetching case types:', error);
      // Fallback to default case types if API fails
      setCaseTypes([
        {
          name: "Domestic Violence Restraining Order",
          code: "DVRO",
          priority_level: "A",
          description: "Emergency protection orders, domestic violence cases - highest priority",
          estimated_duration: 30,
          required_forms: ["DV-100", "DV-109", "DV-110", "CLETS-001"],
          flowchart_file: "dvro-flow.json"
        },
        {
          name: "Child Custody & Support",
          code: "B",
          priority_level: "B",
          description: "Child custody, visitation, child support modifications",
          estimated_duration: 25,
          required_forms: ["FL-150", "FL-300", "FL-305", "FL-341"],
          flowchart_file: "custody_flow.json"
        },
        {
          name: "Divorce & Legal Separation",
          code: "C",
          priority_level: "C",
          description: "Dissolution of marriage, legal separation, property division",
          estimated_duration: 20,
          required_forms: ["FL-100", "FL-150", "FL-160", "FL-142"],
          flowchart_file: "divorce_flow.json"
        },
        {
          name: "Other Family Law Services",
          code: "D",
          priority_level: "D",
          description: "Adoption, guardianship, name changes, general assistance",
          estimated_duration: 15,
          required_forms: [],
          flowchart_file: "general_flow.json"
        }
      ]);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue/status`);
      const data = await response.json();
      setQueueStatus(data);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const handleCaseSelect = (caseType) => {
    setSelectedCase(caseType);
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJoinQueue = async () => {
    if (!selectedCase) return;

    setLoading(true);
    try {
      // Try enhanced API first
      let response = await fetch(`${API_BASE_URL}/api/queue/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_type: selectedCase.code,
          user_name: userInfo.name,
          user_email: userInfo.email,
          phone_number: userInfo.phone,
          language: language
        }),
      });

      if (!response.ok) {
        // Fallback to legacy API
        response = await fetch(`${API_BASE_URL}/api/generate-queue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            case_type: selectedCase.code,
            priority: selectedCase.priority_level,
            language: language
          }),
        });
      }

      const data = await response.json();
      if (data.success || data.queue_number) {
        const queueData = {
          queue_number: data.queue_number,
          case_type: selectedCase,
          estimated_wait_time: data.estimated_wait_time || selectedCase.estimated_duration,
          priority_level: data.priority_level || selectedCase.priority_level
        };
        setQueueNumber(data.queue_number);
        onQueueJoined(queueData);
      } else {
        alert('Error joining queue: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Error joining queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return '#dc2626'; // Red for DV cases
      case 'B': return '#ea580c'; // Orange for civil/elder abuse
      case 'C': return '#ca8a04'; // Yellow for workplace violence
      case 'D': return '#16a34a'; // Green for general
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'A': return language === 'es' ? 'Prioridad Alta' : 'High Priority';
      case 'B': return language === 'es' ? 'Prioridad Media-Alta' : 'Medium-High Priority';
      case 'C': return language === 'es' ? 'Prioridad Media' : 'Medium Priority';
      case 'D': return language === 'es' ? 'Prioridad Baja' : 'Low Priority';
      default: return '';
    }
  };

  if (queueNumber) {
    return (
      <div className="queue-success">
        <div className="queue-number-display">
          <h2>{language === 'es' ? 'Su número de cola' : 'Your Queue Number'}</h2>
          <div className="queue-number" style={{ 
            backgroundColor: getPriorityColor(selectedCase?.priority_level || 'D') 
          }}>
            {queueNumber}
          </div>
          <p className="priority-label">
            {getPriorityLabel(selectedCase?.priority_level || 'D')}
          </p>
          <p className="estimated-wait">
            {language === 'es' ? 'Tiempo estimado de espera:' : 'Estimated wait time:'} 
            <strong> {selectedCase?.estimated_duration || 30} {language === 'es' ? 'minutos' : 'minutes'}</strong>
          </p>
        </div>
        
        <div className="queue-instructions">
          <h3>{language === 'es' ? 'Instrucciones' : 'Instructions'}</h3>
          <ul>
            <li>{language === 'es' ? 'Mantenga este número visible' : 'Keep this number visible'}</li>
            <li>{language === 'es' ? 'Espere a ser llamado' : 'Wait to be called'}</li>
            <li>{language === 'es' ? 'Puede usar el kiosko mientras espera' : 'You can use the kiosk while waiting'}</li>
          </ul>
        </div>

        <div className="queue-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onQueueJoined({ queue_number: queueNumber, case_type: selectedCase })}
          >
            {language === 'es' ? 'Continuar con el proceso' : 'Continue with Process'}
          </button>
          <button className="btn btn-secondary" onClick={() => setQueueNumber(null)}>
            {language === 'es' ? 'Nuevo número' : 'New Number'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-interface">
      <div className="queue-header">
        <h1>San Mateo Family Court Facilitator's Office</h1>
        <p>{language === 'es' ? 'Seleccione el tipo de caso para el que necesita ayuda del facilitador' : 'Select the type of case you need help with from the facilitator'}</p>
      </div>

      {queueStatus && (
        <div className="queue-status">
          <h3>{language === 'es' ? 'Estado de la Cola' : 'Queue Status'}</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">{language === 'es' ? 'Esperando:' : 'Waiting:'}</span>
              <span className="status-value">{queueStatus.total_waiting || 0}</span>
            </div>
            <div className="status-item">
              <span className="status-label">{language === 'es' ? 'En Proceso:' : 'In Progress:'}</span>
              <span className="status-value">{queueStatus.total_in_progress || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="case-selection">
        <h2>{language === 'es' ? 'Servicios del Facilitador' : 'Facilitator Services'}</h2>
        <div className="case-grid">
          {caseTypes.map((caseType) => (
            <div
              key={caseType.code}
              className={`case-card ${selectedCase?.code === caseType.code ? 'selected' : ''}`}
              onClick={() => handleCaseSelect(caseType)}
              style={{ borderColor: getPriorityColor(caseType.priority_level) }}
            >
              <div className="case-priority" style={{ backgroundColor: getPriorityColor(caseType.priority_level) }}>
                {caseType.priority_level}
              </div>
              <h3>{caseType.name}</h3>
              <p>{caseType.description}</p>
              <div className="case-details">
                <span className="duration">
                  {language === 'es' ? 'Duración estimada:' : 'Estimated duration:'} {caseType.estimated_duration} {language === 'es' ? 'min' : 'min'}
                </span>
                <span className="priority">
                  {getPriorityLabel(caseType.priority_level)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCase && (
        <div className="user-info-section">
          <h3>{language === 'es' ? 'Información del Usuario (Opcional)' : 'User Information (Optional)'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{language === 'es' ? 'Nombre' : 'Name'}</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={language === 'es' ? 'Su nombre' : 'Your name'}
              />
            </div>
            <div className="form-group">
              <label>{language === 'es' ? 'Email' : 'Email'}</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={language === 'es' ? 'Su email' : 'Your email'}
              />
            </div>
            <div className="form-group">
              <label>{language === 'es' ? 'Teléfono' : 'Phone'}</label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={language === 'es' ? 'Su teléfono' : 'Your phone'}
              />
            </div>
          </div>
        </div>
      )}

      <div className="queue-actions">
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack}>
            {language === 'es' ? 'Atrás' : 'Back'}
          </button>
        )}
        <button
          className="btn btn-primary"
          disabled={!selectedCase || loading}
          onClick={handleJoinQueue}
        >
          {loading 
            ? (language === 'es' ? 'Uniéndose a la cola...' : 'Joining queue...')
            : (language === 'es' ? 'Unirse a la Cola' : 'Join Queue')
          }
        </button>
      </div>
    </div>
  );
};

export default QueueInterface;
