import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Mail, 
  FileText, 
  Shield, 
  Heart, 
  Globe,
  ArrowRight,
  RefreshCw,
  Send,
  Eye,
  UserCheck
} from 'lucide-react';
import { getQueue, callNext, completeCase, sendComprehensiveEmail } from '../utils/queueAPI';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import './ModernCard.css';
import './ModernButton.css';

const AttorneyDashboard = () => {
  const { language, toggleLanguage } = useLanguage();
  const [queue, setQueue] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setError(null);
      const data = await getQueue();
      const queueArray = data.queue || [];
      setQueue(queueArray);
      setCurrentNumber(data.current_number || null);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setError('Failed to fetch queue data');
      setQueue([]);
      setCurrentNumber(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      await callNext();
      fetchQueue();
    } catch (error) {
      console.error('Error calling next number:', error);
      setError('Failed to call next number');
    }
  };

  const handleCompleteCase = async (queueNumber) => {
    try {
      await completeCase(queueNumber);
      fetchQueue();
      if (selectedCase?.queue_number === queueNumber) {
        setSelectedCase(null);
      }
    } catch (error) {
      console.error('Error completing case:', error);
      setError('Failed to complete case');
    }
  };

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleSendEmail = async (caseItem) => {
    if (!caseItem.user_email) {
      setError('No email address available for this case');
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendComprehensiveEmail({
        email: caseItem.user_email,
        user_name: caseItem.user_name,
        case_type: caseItem.case_type || 'Family Law Case',
        priority: caseItem.priority || 'C',
        language: caseItem.language || 'en',
        queue_number: caseItem.queue_number,
        forms: caseItem.documents_needed || [],
        next_steps: caseItem.next_steps || [],
        summary: caseItem.conversation_summary || '',
        phone_number: caseItem.phone_number,
        include_queue: true
      });
      
      if (result.success) {
        setError(null);
        alert(language === 'en' 
          ? `Email sent successfully to ${caseItem.user_email}` 
          : `Correo enviado exitosamente a ${caseItem.user_email}`);
      } else {
        setError(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return 'from-red-500 to-red-600';
      case 'B': return 'from-amber-500 to-amber-600';
      case 'C': return 'from-blue-500 to-blue-600';
      case 'D': return 'from-emerald-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'A': return Shield;
      case 'B': return Heart;
      case 'C': return FileText;
      case 'D': return Users;
      default: return Users;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'A': return { en: 'Domestic Violence', es: 'Violencia Doméstica' };
      case 'B': return { en: 'Custody & Support', es: 'Custodia y Manutención' };
      case 'C': return { en: 'Divorce', es: 'Divorcio' };
      case 'D': return { en: 'Other', es: 'Otro' };
      default: return { en: 'Unknown', es: 'Desconocido' };
    }
  };

  const calculateWaitTime = (createdAt) => {
    if (!createdAt) return '0m';
    
    const created = new Date(createdAt);
    const now = new Date();
    
    if (created > now) return '0m';
    
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getWaitTimeColor = (waitTimeMinutes) => {
    if (waitTimeMinutes >= 60) return 'text-red-600';
    if (waitTimeMinutes >= 30) return 'text-orange-600';
    if (waitTimeMinutes >= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate wait times and sort queue
  const queueWithWaitTimes = queue.map(item => {
    const createdAt = item.arrived_at || item.timestamp || item.created_at;
    let waitTimeMinutes = 0;
    
    if (createdAt) {
      const created = new Date(createdAt);
      const now = new Date();
      if (created <= now) {
        waitTimeMinutes = Math.floor((now - created) / (1000 * 60));
      }
    }
    
    return {
      ...item,
      waitTimeMinutes,
      waitTimeFormatted: calculateWaitTime(createdAt)
    };
  });

  const sortedQueue = queueWithWaitTimes.sort((a, b) => {
    const priorityOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    const aPriority = priorityOrder[a.priority] || 5;
    const bPriority = priorityOrder[b.priority] || 5;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return b.waitTimeMinutes - a.waitTimeMinutes;
  });

  const waitingCount = queueWithWaitTimes.filter(item => item.status === 'waiting').length;
  const inProgressCount = queueWithWaitTimes.filter(item => item.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard variant="elevated" className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">
            {language === 'en' ? 'Loading queue...' : 'Cargando cola...'}
          </p>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'en' ? 'Attorney Dashboard' : 'Panel del Abogado'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'en' 
                  ? 'Quick case summaries and efficient client assistance'
                  : 'Resúmenes rápidos de casos y asistencia eficiente al cliente'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'Español' : 'English'}</span>
              </button>
              <ModernButton
                variant="primary"
                size="medium"
                onClick={fetchQueue}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                {language === 'en' ? 'Refresh' : 'Actualizar'}
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Queue Overview */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Queue Stats */}
              <ModernCard variant="elevated">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Queue Status' : 'Estado de la Cola'}
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {language === 'en' ? 'Waiting' : 'Esperando'}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{waitingCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {language === 'en' ? 'In Progress' : 'En Progreso'}
                    </span>
                    <span className="text-2xl font-bold text-green-600">{inProgressCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {language === 'en' ? 'Current Number' : 'Número Actual'}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {currentNumber || '--'}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <ModernButton
                    variant="primary"
                    size="large"
                    className="w-full"
                    onClick={handleCallNext}
                    icon={<UserCheck className="w-5 h-5" />}
                  >
                    {language === 'en' ? 'Call Next' : 'Llamar Siguiente'}
                  </ModernButton>
                </div>
              </ModernCard>

              {/* Queue List */}
              <ModernCard variant="elevated">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'en' ? 'Waiting Queue' : 'Cola de Espera'}
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedQueue.filter(item => item.status === 'waiting').map((item, index) => {
                    const PriorityIcon = getPriorityIcon(item.priority);
                    return (
                      <div
                        key={item.queue_number}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCase?.queue_number === item.queue_number
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCaseSelect(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getPriorityColor(item.priority)} flex items-center justify-center`}>
                              <PriorityIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">#{item.queue_number}</div>
                              <div className="text-sm text-gray-600">
                                {getPriorityLabel(item.priority)[language]}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getWaitTimeColor(item.waitTimeMinutes)}`}>
                              {item.waitTimeFormatted}
                            </div>
                            <div className="text-xs text-gray-500">
                              {language === 'en' ? 'waiting' : 'esperando'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {item.user_name || 'Anonymous'}
                        </div>
                      </div>
                    );
                  })}
                  {sortedQueue.filter(item => item.status === 'waiting').length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      {language === 'en' ? 'No cases waiting' : 'No hay casos esperando'}
                    </div>
                  )}
                </div>
              </ModernCard>
            </div>
          </div>

          {/* Case Details */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="space-y-6">
                {/* Case Header */}
                <ModernCard variant="elevated">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getPriorityColor(selectedCase.priority)} flex items-center justify-center`}>
                        {React.createElement(getPriorityIcon(selectedCase.priority), { className: "w-6 h-6 text-white" })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Case #{selectedCase.queue_number}
                        </h2>
                        <p className="text-gray-600">
                          {getPriorityLabel(selectedCase.priority)[language]}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <ModernButton
                        variant="secondary"
                        size="medium"
                        onClick={() => handleSendEmail(selectedCase)}
                        disabled={sendingEmail || !selectedCase.user_email}
                        loading={sendingEmail}
                        icon={<Send className="w-4 h-4" />}
                      >
                        {language === 'en' ? 'Send Email' : 'Enviar Email'}
                      </ModernButton>
                      <ModernButton
                        variant="success"
                        size="medium"
                        onClick={() => handleCompleteCase(selectedCase.queue_number)}
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        {language === 'en' ? 'Complete' : 'Completar'}
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>

                {/* Client Information */}
                <ModernCard variant="outlined">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {language === 'en' ? 'Client Information' : 'Información del Cliente'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedCase.user_name || 'Not provided'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'en' ? 'Name' : 'Nombre'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedCase.user_email || 'Not provided'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'en' ? 'Email' : 'Correo'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedCase.phone_number || 'Not provided'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'en' ? 'Phone' : 'Teléfono'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedCase.waitTimeFormatted}
                        </div>
                        <div className="text-sm text-gray-600">
                          {language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* Case Summary - THE MAIN FOCUS */}
                <ModernCard variant="gradient" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    {language === 'en' ? 'Case Summary & Attorney Guidance' : 'Resumen del Caso y Guía del Abogado'}
                  </h3>
                  {selectedCase.conversation_summary ? (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === 'en' ? 'Client Situation:' : 'Situación del Cliente:'}
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedCase.conversation_summary}
                        </p>
                      </div>
                      
                      {/* Attorney Action Items */}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-green-600" />
                          {language === 'en' ? 'Recommended Actions:' : 'Acciones Recomendadas:'}
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {language === 'en' 
                              ? 'Review the client\'s specific needs and current situation'
                              : 'Revisar las necesidades específicas del cliente y situación actual'
                            }
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {language === 'en' 
                              ? 'Provide targeted legal guidance based on their case type'
                              : 'Proporcionar orientación legal específica basada en su tipo de caso'
                            }
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {language === 'en' 
                              ? 'Identify required forms and next steps'
                              : 'Identificar formularios requeridos y próximos pasos'
                            }
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {language === 'en' 
                              ? 'Schedule follow-up if needed'
                              : 'Programar seguimiento si es necesario'
                            }
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {language === 'en' 
                          ? 'No case summary available. Please gather information from the client.'
                          : 'No hay resumen del caso disponible. Por favor recopile información del cliente.'
                        }
                      </p>
                    </div>
                  )}
                </ModernCard>

                {/* Forms and Next Steps */}
                {(selectedCase.documents_needed?.length > 0 || selectedCase.next_steps?.length > 0) && (
                  <ModernCard variant="outlined">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {language === 'en' ? 'Forms & Next Steps' : 'Formularios y Próximos Pasos'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCase.documents_needed?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? 'Required Forms:' : 'Formularios Requeridos:'}
                          </h4>
                          <ul className="space-y-1">
                            {selectedCase.documents_needed.map((form, index) => (
                              <li key={index} className="text-gray-700 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                {form}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCase.next_steps?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? 'Next Steps:' : 'Próximos Pasos:'}
                          </h4>
                          <ul className="space-y-1">
                            {selectedCase.next_steps.map((step, index) => (
                              <li key={index} className="text-gray-700 flex items-center">
                                <ArrowRight className="w-4 h-4 mr-2 text-green-600" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </ModernCard>
                )}
              </div>
            ) : (
              <ModernCard variant="elevated" className="text-center py-16">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === 'en' ? 'Select a Case' : 'Seleccione un Caso'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Click on a case from the queue to view details and provide assistance'
                    : 'Haga clic en un caso de la cola para ver detalles y proporcionar asistencia'
                  }
                </p>
              </ModernCard>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttorneyDashboard;
