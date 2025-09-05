import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { LocationContext } from '../contexts/LocationContext';
import './EnhancedKioskInterface.css';

const EnhancedKioskInterface = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { location } = useContext(LocationContext);
  
  const [currentStep, setCurrentStep] = useState('welcome');
  const [queueNumber, setQueueNumber] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    caseType: 'dvro'
  });
  const [flowProgress, setFlowProgress] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [llmGuidance, setLlmGuidance] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [llmAnswer, setLlmAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      welcome: {
        title: "Welcome to the Family Court Clinic",
        subtitle: "We're here to help you navigate the court process",
        startButton: "Start Your Case",
        languageButton: "Español"
      },
      language: {
        title: "Select Your Language",
        subtitle: "Seleccione su idioma",
        english: "English",
        spanish: "Español"
      },
      caseType: {
        title: "What type of case do you need help with?",
        subtitle: "Select the option that best describes your situation",
        dvro: "Domestic Violence Restraining Order",
        civil: "Civil Harassment Restraining Order", 
        elder: "Elder Abuse Restraining Order",
        workplace: "Workplace Violence Restraining Order",
        other: "Other Legal Assistance"
      },
      userInfo: {
        title: "Please provide your information",
        subtitle: "This helps us serve you better",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        namePlaceholder: "Enter your full name",
        emailPlaceholder: "Enter your email address",
        phonePlaceholder: "Enter your phone number",
        continue: "Continue"
      },
      queue: {
        title: "Your Queue Number",
        subtitle: "Please wait for your number to be called",
        number: "Queue Number",
        estimatedWait: "Estimated Wait Time",
        minutes: "minutes",
        instructions: "Please have a seat and wait for your number to be called. You can use the kiosk while you wait."
      },
      flow: {
        title: "Court Process Guidance",
        subtitle: "Let's help you understand your next steps",
        nextStep: "Next Step",
        back: "Back",
        continue: "Continue",
        askQuestion: "Ask a Question",
        questionPlaceholder: "Type your question here...",
        send: "Send"
      },
      summary: {
        title: "Your Case Summary",
        subtitle: "Here's what we've covered and your next steps",
        forms: "Forms You'll Need",
        nextSteps: "Next Steps",
        concerns: "Important Notes",
        timeEstimate: "Estimated Time Remaining",
        priority: "Priority Level"
      }
    },
    es: {
      welcome: {
        title: "Bienvenido a la Clínica de la Corte Familiar",
        subtitle: "Estamos aquí para ayudarle a navegar el proceso judicial",
        startButton: "Comenzar Su Caso",
        languageButton: "English"
      },
      language: {
        title: "Seleccione su idioma",
        subtitle: "Select Your Language",
        english: "English",
        spanish: "Español"
      },
      caseType: {
        title: "¿Qué tipo de caso necesita ayuda?",
        subtitle: "Seleccione la opción que mejor describe su situación",
        dvro: "Orden de Restricción por Violencia Doméstica",
        civil: "Orden de Restricción por Acoso Civil",
        elder: "Orden de Restricción por Abuso de Ancianos",
        workplace: "Orden de Restricción por Violencia en el Trabajo",
        other: "Otra Asistencia Legal"
      },
      userInfo: {
        title: "Por favor proporcione su información",
        subtitle: "Esto nos ayuda a servirle mejor",
        name: "Nombre Completo",
        email: "Dirección de Correo Electrónico",
        phone: "Número de Teléfono",
        namePlaceholder: "Ingrese su nombre completo",
        emailPlaceholder: "Ingrese su dirección de correo electrónico",
        phonePlaceholder: "Ingrese su número de teléfono",
        continue: "Continuar"
      },
      queue: {
        title: "Su Número de Cola",
        subtitle: "Por favor espere a que se llame su número",
        number: "Número de Cola",
        estimatedWait: "Tiempo de Espera Estimado",
        minutes: "minutos",
        instructions: "Por favor tome asiento y espere a que se llame su número. Puede usar el quiosco mientras espera."
      },
      flow: {
        title: "Orientación del Proceso Judicial",
        subtitle: "Vamos a ayudarle a entender sus próximos pasos",
        nextStep: "Próximo Paso",
        back: "Atrás",
        continue: "Continuar",
        askQuestion: "Hacer una Pregunta",
        questionPlaceholder: "Escriba su pregunta aquí...",
        send: "Enviar"
      },
      summary: {
        title: "Resumen de Su Caso",
        subtitle: "Aquí está lo que hemos cubierto y sus próximos pasos",
        forms: "Formularios que Necesitará",
        nextSteps: "Próximos Pasos",
        concerns: "Notas Importantes",
        timeEstimate: "Tiempo Estimado Restante",
        priority: "Nivel de Prioridad"
      }
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Load flow data when component mounts
    loadFlowData();
  }, []);

  const loadFlowData = async () => {
    try {
      const response = await fetch('/data/dvro/dv_flow_combined.json');
      const data = await response.json();
      setFlowData(data);
      setCurrentNode(data.start);
    } catch (error) {
      console.error('Error loading flow data:', error);
    }
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const handleCaseTypeSelect = (caseType) => {
    setUserInfo(prev => ({ ...prev, caseType }));
    setCurrentStep('userInfo');
  };

  const handleUserInfoSubmit = async () => {
    setIsLoading(true);
    try {
      // Add to queue
      const response = await fetch('/api/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userInfo,
          language
        })
      });
      
      const result = await response.json();
      setQueueNumber(result.queue_number);
      setCurrentStep('queue');
      
      // Start flow guidance
      await startFlowGuidance();
    } catch (error) {
      console.error('Error adding to queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startFlowGuidance = async () => {
    if (!flowData || !currentNode) return;
    
    const node = flowData.nodes[currentNode];
    if (!node) return;
    
    // Get LLM guidance for current step
    await getLlmGuidance();
  };

  const getLlmGuidance = async () => {
    if (!flowData || !currentNode) return;
    
    try {
      const response = await fetch('/api/llm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_number: queueNumber,
          current_node: currentNode,
          progress: flowProgress,
          language
        })
      });
      
      const result = await response.json();
      setLlmGuidance(result);
    } catch (error) {
      console.error('Error getting LLM guidance:', error);
    }
  };

  const handleFlowNavigation = async (nextNode, userResponse = null) => {
    if (!flowData) return;
    
    // Record progress
    const progressEntry = {
      node_id: currentNode,
      node_text: flowData.nodes[currentNode]?.text || '',
      user_response: userResponse,
      timestamp: new Date().toISOString()
    };
    
    setFlowProgress(prev => [...prev, progressEntry]);
    
    // Update current node
    setCurrentNode(nextNode);
    
    // Check if we've reached an end node
    if (flowData.nodes[nextNode]?.type === 'end') {
      setCurrentStep('summary');
      await generateFinalSummary();
    } else {
      // Get guidance for next step
      await getLlmGuidance();
    }
  };

  const handleUserQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    try {
      const response = await fetch('/api/llm/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          queue_number: queueNumber,
          current_node: currentNode,
          progress: flowProgress,
          language
        })
      });
      
      const result = await response.json();
      setLlmAnswer(result.answer);
      setUserQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      setLlmAnswer(t.flow.error || 'Sorry, I cannot answer right now. Please ask a facilitator.');
    }
  };

  const generateFinalSummary = async () => {
    try {
      const response = await fetch('/api/queue/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_number: queueNumber,
          progress: flowProgress
        })
      });
      
      const result = await response.json();
      setLlmGuidance(result);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const renderWelcome = () => (
    <div className="kiosk-welcome">
      <div className="welcome-header">
        <h1>{t.welcome.title}</h1>
        <p>{t.welcome.subtitle}</p>
      </div>
      
      <div className="welcome-content">
        <div className="location-info">
          <h3>{location?.name || 'Family Court Clinic'}</h3>
          <p>{location?.address || 'San Mateo County Courthouse'}</p>
        </div>
        
        <div className="welcome-actions">
          <button 
            className="btn-primary"
            onClick={() => setCurrentStep('language')}
          >
            {t.welcome.startButton}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={handleLanguageChange}
          >
            {t.welcome.languageButton}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="kiosk-language">
      <h1>{t.language.title}</h1>
      <p>{t.language.subtitle}</p>
      
      <div className="language-options">
        <button 
          className={`language-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          {t.language.english}
        </button>
        
        <button 
          className={`language-btn ${language === 'es' ? 'active' : ''}`}
          onClick={() => setLanguage('es')}
        >
          {t.language.spanish}
        </button>
      </div>
      
      <button 
        className="btn-primary"
        onClick={() => setCurrentStep('caseType')}
      >
        {t.userInfo.continue}
      </button>
    </div>
  );

  const renderCaseTypeSelect = () => (
    <div className="kiosk-case-type">
      <h1>{t.caseType.title}</h1>
      <p>{t.caseType.subtitle}</p>
      
      <div className="case-type-options">
        <button 
          className="case-type-btn priority-a"
          onClick={() => handleCaseTypeSelect('dvro')}
        >
          <span className="priority-badge">A</span>
          <span className="case-type-text">{t.caseType.dvro}</span>
        </button>
        
        <button 
          className="case-type-btn priority-b"
          onClick={() => handleCaseTypeSelect('civil')}
        >
          <span className="priority-badge">B</span>
          <span className="case-type-text">{t.caseType.civil}</span>
        </button>
        
        <button 
          className="case-type-btn priority-b"
          onClick={() => handleCaseTypeSelect('elder')}
        >
          <span className="priority-badge">B</span>
          <span className="case-type-text">{t.caseType.elder}</span>
        </button>
        
        <button 
          className="case-type-btn priority-c"
          onClick={() => handleCaseTypeSelect('workplace')}
        >
          <span className="priority-badge">C</span>
          <span className="case-type-text">{t.caseType.workplace}</span>
        </button>
        
        <button 
          className="case-type-btn priority-d"
          onClick={() => handleCaseTypeSelect('other')}
        >
          <span className="priority-badge">D</span>
          <span className="case-type-text">{t.caseType.other}</span>
        </button>
      </div>
    </div>
  );

  const renderUserInfo = () => (
    <div className="kiosk-user-info">
      <h1>{t.userInfo.title}</h1>
      <p>{t.userInfo.subtitle}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); handleUserInfoSubmit(); }}>
        <div className="form-group">
          <label>{t.userInfo.name}</label>
          <input
            type="text"
            value={userInfo.name}
            onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t.userInfo.namePlaceholder}
            required
          />
        </div>
        
        <div className="form-group">
          <label>{t.userInfo.email}</label>
          <input
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder={t.userInfo.emailPlaceholder}
          />
        </div>
        
        <div className="form-group">
          <label>{t.userInfo.phone}</label>
          <input
            type="tel"
            value={userInfo.phone}
            onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder={t.userInfo.phonePlaceholder}
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : t.userInfo.continue}
        </button>
      </form>
    </div>
  );

  const renderQueue = () => (
    <div className="kiosk-queue">
      <div className="queue-header">
        <h1>{t.queue.title}</h1>
        <p>{t.queue.subtitle}</p>
      </div>
      
      <div className="queue-number-display">
        <div className="queue-number">
          <span className="number-label">{t.queue.number}</span>
          <span className="number-value">{queueNumber}</span>
        </div>
        
        <div className="wait-time">
          <span className="wait-label">{t.queue.estimatedWait}</span>
          <span className="wait-value">15 {t.queue.minutes}</span>
        </div>
      </div>
      
      <div className="queue-instructions">
        <p>{t.queue.instructions}</p>
      </div>
      
      <div className="queue-actions">
        <button 
          className="btn-primary"
          onClick={() => setCurrentStep('flow')}
        >
          {t.flow.title}
        </button>
      </div>
    </div>
  );

  const renderFlow = () => {
    if (!flowData || !currentNode) return <div>Loading...</div>;
    
    const node = flowData.nodes[currentNode];
    if (!node) return <div>Error: Node not found</div>;
    
    const edges = flowData.edges.filter(edge => edge.from === currentNode);
    
    return (
      <div className="kiosk-flow">
        <div className="flow-header">
          <h1>{t.flow.title}</h1>
          <p>{t.flow.subtitle}</p>
        </div>
        
        <div className="flow-content">
          <div className="current-step">
            <h2>{node.text}</h2>
            <div className="step-type">{node.type}</div>
          </div>
          
          {llmGuidance && (
            <div className="llm-guidance">
              <h3>AI Guidance</h3>
              <div className="guidance-content">
                <p><strong>Summary:</strong> {llmGuidance.analysis?.summary}</p>
                <p><strong>Next Steps:</strong> {llmGuidance.analysis?.guidance}</p>
                <p><strong>Forms Needed:</strong> {llmGuidance.analysis?.forms_needed?.join(', ') || 'None'}</p>
                <p><strong>Time Remaining:</strong> {llmGuidance.estimated_time_remaining} minutes</p>
              </div>
            </div>
          )}
          
          <div className="flow-navigation">
            {edges.map((edge, index) => (
              <button
                key={index}
                className="btn-secondary"
                onClick={() => handleFlowNavigation(edge.to, edge.when)}
              >
                {edge.when || t.flow.continue}
              </button>
            ))}
          </div>
          
          <div className="question-section">
            <h3>{t.flow.askQuestion}</h3>
            <div className="question-input">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={t.flow.questionPlaceholder}
                onKeyPress={(e) => e.key === 'Enter' && handleUserQuestion()}
              />
              <button onClick={handleUserQuestion}>{t.flow.send}</button>
            </div>
            
            {llmAnswer && (
              <div className="llm-answer">
                <p><strong>Answer:</strong> {llmAnswer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="kiosk-summary">
      <div className="summary-header">
        <h1>{t.summary.title}</h1>
        <p>{t.summary.subtitle}</p>
      </div>
      
      <div className="summary-content">
        {llmGuidance && (
          <>
            <div className="summary-section">
              <h3>{t.summary.forms}</h3>
              <ul>
                {llmGuidance.analysis?.forms_needed?.map((form, index) => (
                  <li key={index}>{form}</li>
                )) || <li>No specific forms identified</li>}
              </ul>
            </div>
            
            <div className="summary-section">
              <h3>{t.summary.nextSteps}</h3>
              <ul>
                {llmGuidance.analysis?.next_steps?.map((step, index) => (
                  <li key={index}>{step}</li>
                )) || <li>Continue with court process</li>}
              </ul>
            </div>
            
            <div className="summary-section">
              <h3>{t.summary.concerns}</h3>
              <ul>
                {llmGuidance.analysis?.concerns?.map((concern, index) => (
                  <li key={index}>{concern}</li>
                )) || <li>No immediate concerns</li>}
              </ul>
            </div>
            
            <div className="summary-metrics">
              <div className="metric">
                <span className="metric-label">{t.summary.timeEstimate}</span>
                <span className="metric-value">{llmGuidance.estimated_time_remaining} minutes</span>
              </div>
              
              <div className="metric">
                <span className="metric-label">{t.summary.priority}</span>
                <span className="metric-value">{llmGuidance.analysis?.priority_level || 'Medium'}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="summary-actions">
        <button className="btn-primary" onClick={() => setCurrentStep('welcome')}>
          {language === 'en' ? 'Start New Case' : 'Comenzar Nuevo Caso'}
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'language':
        return renderLanguageSelect();
      case 'caseType':
        return renderCaseTypeSelect();
      case 'userInfo':
        return renderUserInfo();
      case 'queue':
        return renderQueue();
      case 'flow':
        return renderFlow();
      case 'summary':
        return renderSummary();
      default:
        return renderWelcome();
    }
  };

  return (
    <div className="enhanced-kiosk-interface">
      <div className="kiosk-container">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default EnhancedKioskInterface;
