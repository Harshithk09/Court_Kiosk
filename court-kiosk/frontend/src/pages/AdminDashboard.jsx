import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, CheckCircle, RefreshCw, Shield, Heart, FileText, Globe, Phone, Mail, Clock, AlertTriangle, Send, Eye, X, LogOut, User as UserIcon } from 'lucide-react';
import { getQueue, callNext, completeCase, addTestData, sendComprehensiveEmail } from '../utils/queueAPI';
import { getAdminQueue, callNextAuthenticated, completeCaseAuthenticated } from '../utils/authAPI';
import FormsManagement from '../components/FormsManagement';
import FormsSummary from '../components/FormsSummary';

const AdminDashboard = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user, logout, sessionToken } = useAuth();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'forms'
  const [queue, setQueue] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSummary, setCaseSummary] = useState(null);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showCaseSummaryModal, setShowCaseSummaryModal] = useState(false);
  const [caseSummaryData, setCaseSummaryData] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setError(null);
      console.log('AdminDashboard: Fetching queue data...');
      
      // Use authenticated API if available, fallback to regular API
      let data;
      if (sessionToken) {
        data = await getAdminQueue(sessionToken);
      } else {
        data = await getQueue();
      }
      
      console.log('AdminDashboard: Received queue data:', data);
      
      // Ensure queue is always an array
      const queueArray = data.queue || [];
      console.log('AdminDashboard: Setting queue array:', queueArray);
      setQueue(queueArray);
      setCurrentNumber(data.current_number || null);
      
      // Log queue statistics
      console.log('AdminDashboard: Queue statistics:');
      console.log('- Total cases:', queueArray.length);
      console.log('- Cases by priority:', queueArray.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {}));
      console.log('- Cases by status:', queueArray.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}));
      
    } catch (error) {
      console.error('Error fetching queue:', error);
      setError('Failed to fetch queue data');
      // Set empty arrays to prevent undefined errors
      setQueue([]);
      setCurrentNumber(null);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    try {
      if (sessionToken) {
        await callNextAuthenticated(sessionToken);
      } else {
        await callNext();
      }
      fetchQueue();
    } catch (error) {
      console.error('Error calling next number:', error);
      setError('Failed to call next number');
    }
  };

  const handleCompleteCase = async (queueNumber) => {
    try {
      if (sessionToken) {
        await completeCaseAuthenticated(queueNumber, sessionToken);
      } else {
        await completeCase(queueNumber);
      }
      fetchQueue();
      if (selectedCase?.queue_number === queueNumber) {
        setSelectedCase(null);
        setCaseSummary(null);
      }
    } catch (error) {
      console.error('Error completing case:', error);
      setError('Failed to complete case');
    }
  };

  const handleAddTestData = async () => {
    try {
      await addTestData();
      fetchQueue();
      setError(null);
    } catch (error) {
      console.error('Error adding test data:', error);
      setError('Failed to add test data');
    }
  };

  const handleCaseSelect = async (caseItem) => {
    setSelectedCase(caseItem);
    // Flask backend does not expose a separate summary endpoint; use conversation_summary if present
    setCaseSummary(caseItem.conversation_summary || null);
  };

  const handleShowCaseSummary = (caseItem) => {
    setCaseSummaryData(caseItem);
    setShowCaseSummaryModal(true);
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
        case_type: caseItem.case_type || 'Domestic Violence Restraining Order',
        priority: caseItem.priority || caseItem.priority_level || 'A',
        language: caseItem.language || 'en',
        queue_number: caseItem.queue_number,
        forms: caseItem.documents_needed || [],
        next_steps: caseItem.next_steps || [],
        summary: caseItem.conversation_summary || '',
        phone_number: caseItem.phone_number,
        include_queue: true // Always include queue info in admin emails
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
      case 'A': return 'bg-red-500';
      case 'B': return 'bg-orange-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-blue-500';
      default: return 'bg-gray-500';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateWaitTime = (createdAt) => {
    if (!createdAt) return '0m';
    
    const created = new Date(createdAt);
    const now = new Date();
    
    // Ensure we don't get negative times
    if (created > now) {
      return '0m';
    }
    
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getWaitTimeColor = (waitTimeMinutes) => {
    if (waitTimeMinutes >= 60) return 'text-red-600 font-bold';
    if (waitTimeMinutes >= 30) return 'text-orange-600 font-semibold';
    if (waitTimeMinutes >= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWaitTimeAlert = (waitTimeMinutes) => {
    if (waitTimeMinutes >= 60) return 'bg-red-100 border-red-300 text-red-800';
    if (waitTimeMinutes >= 30) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (waitTimeMinutes >= 15) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return null;
  };

  // Ensure queue is an array before using reduce
  // const groupedQueue = (queue || []).reduce((acc, item) => {
  //   // Handle both 'priority' and 'priority_level' field names
  //   const priority = item.priority || item.priority_level || 'C';
  //   if (!acc[priority]) {
  //     acc[priority] = [];
  //   }
  //   acc[priority].push(item);
  //   return acc;
  // }, {});

  const priorityOrder = ['A', 'B', 'C', 'D'];

  // Calculate wait times for all cases
  const queueWithWaitTimes = queue.map(item => {
    const createdAt = item.arrived_at || item.timestamp || item.created_at;
    let waitTimeMinutes = 0;
    
    if (createdAt) {
      const created = new Date(createdAt);
      const now = new Date();
      // Ensure we don't get negative times
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

  // Count cases by status
  const waitingCount = queueWithWaitTimes.filter(item => item.status === 'waiting').length;
  const inProgressCount = queueWithWaitTimes.filter(item => item.status === 'in_progress').length;
  const completedCount = queueWithWaitTimes.filter(item => item.status === 'completed').length;

  // Sort by priority and wait time
  const sortedQueue = queueWithWaitTimes.sort((a, b) => {
    const priorityOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    // Handle both 'priority' and 'priority_level' field names
    const aPriorityValue = a.priority || a.priority_level || 'C';
    const bPriorityValue = b.priority || b.priority_level || 'C';
    const aPriority = priorityOrder[aPriorityValue] || 5;
    const bPriority = priorityOrder[bPriorityValue] || 5;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return b.waitTimeMinutes - a.waitTimeMinutes; // Longest wait first within same priority
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">
            {language === 'en' ? 'Loading queue...' : 'Cargando cola...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'en' ? 'Facilitator Dashboard' : 'Panel del Facilitador'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'en' 
                  ? 'Manage queue and assist clients'
                  : 'Gestiona la cola y asiste a los clientes'
                }
              </p>
              <div className="flex space-x-6 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'en' ? 'Waiting:' : 'Esperando:'} {waitingCount}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'en' ? 'In Progress:' : 'En Progreso:'} {inProgressCount}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'en' ? 'Completed:' : 'Completado:'} {completedCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchQueue}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Refresh' : 'Actualizar'}
              </button>
              <button
                onClick={handleAddTestData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Add Test Data' : 'Agregar Datos de Prueba'}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Español' : 'English'}
              </button>
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Logout' : 'Cerrar Sesión'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('queue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'queue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Queue Management' : 'Gestión de Cola'}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Forms Management' : 'Gestión de Formularios'}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Queue Management Tab Content */}
      {activeTab === 'queue' && (
        <>
          {/* Wait Time Alerts */}
          {queueWithWaitTimes.filter(item => item.waitTimeMinutes >= 30).length > 0 && (
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    {language === 'en' ? 'Long Wait Alert:' : 'Alerta de Espera Larga:'}
                  </span>
                  <span className="ml-2">
                    {queueWithWaitTimes.filter(item => item.waitTimeMinutes >= 30).length} 
                    {language === 'en' ? ' clients waiting 30+ minutes' : ' clientes esperando 30+ minutos'}
                  </span>
                </div>
              </div>
            </div>
          )}

      {/* Current Number Display */}
      {currentNumber && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Currently Serving' : 'Atendiendo Actualmente'}
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${getPriorityColor(currentNumber.priority || currentNumber.priority_level)} rounded-lg flex items-center justify-center mr-4`}>
                  <span className="text-3xl font-bold text-white">
                    {currentNumber.queue_number}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getPriorityLabel(currentNumber.priority || currentNumber.priority_level)[language]}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'en' ? 'Priority' : 'Prioridad'} {currentNumber.priority || currentNumber.priority_level}
                  </p>
                  {currentNumber.user_name && (
                    <p className="text-gray-600">
                      {language === 'en' ? 'Name:' : 'Nombre:'} {currentNumber.user_name}
                    </p>
                  )}
                  {currentNumber.created_at && (
                    <p className="text-gray-600">
                      {language === 'en' ? 'Wait time:' : 'Tiempo de espera:'} {calculateWaitTime(currentNumber.created_at)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleShowCaseSummary(currentNumber)}
                  className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
                </button>
                <button
                  onClick={() => handleCompleteCase(currentNumber.queue_number)}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Complete Case' : 'Completar Caso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Next Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={handleCallNext}
          disabled={waitingCount === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xl font-semibold"
        >
          {language === 'en' ? 'Call Next Number' : 'Llamar Siguiente Número'}
        </button>
      </div>

      {/* Currently In Progress Cases */}
      {inProgressCount > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Currently In Progress' : 'Actualmente En Progreso'}
            </h2>
            <div className="space-y-3">
              {queueWithWaitTimes.filter(item => item.status === 'in_progress').map((item) => (
                <div key={item.queue_number} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-3">
                      {item.queue_number}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getPriorityLabel(item.priority || item.priority_level)[language]}
                      </p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-blue-600 font-medium">
                          {item.waitTimeFormatted}
                        </span>
                      </div>
                      {item.user_name && (
                        <p className="text-sm text-gray-600">
                          {item.user_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteCase(item.queue_number)}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Complete' : 'Completar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue by Priority - Left Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Queue by Priority' : 'Cola por Prioridad'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {priorityOrder.map((priority) => {
                const priorityItems = sortedQueue.filter(item => (item.priority || item.priority_level) === priority);
                const PriorityIcon = getPriorityIcon(priority);
                
                return (
                  <div key={priority} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 ${getPriorityColor(priority)} rounded-lg flex items-center justify-center mr-3`}>
                        <PriorityIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getPriorityLabel(priority)[language]}
                        </h3>
                        <p className="text-gray-600">
                          {priorityItems.filter(item => item.status === 'waiting').length} {language === 'en' ? 'waiting' : 'esperando'}
                        </p>
                      </div>
                    </div>

                    {priorityItems.filter(item => item.status === 'waiting').length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        {language === 'en' ? 'No cases waiting' : 'No hay casos esperando'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {priorityItems.filter(item => item.status === 'waiting').map((item, index) => {
                          const waitTimeAlert = getWaitTimeAlert(item.waitTimeMinutes);
                          return (
                            <div
                              key={item.queue_number}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedCase?.queue_number === item.queue_number 
                                  ? 'bg-blue-50 border-2 border-blue-200' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                              } ${waitTimeAlert ? waitTimeAlert : ''}`}
                              onClick={() => handleCaseSelect(item)}
                            >
                              <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-900 mr-3">
                                  {item.queue_number}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {getPriorityLabel(item.priority || item.priority_level)[language]}
                                  </p>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className={getWaitTimeColor(item.waitTimeMinutes)}>
                                      {item.waitTimeFormatted}
                                    </span>
                                  </div>
                                  {item.user_name && (
                                    <p className="text-sm text-gray-600">
                                      {item.user_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <div className={`w-3 h-3 ${getStatusColor(item.status)} rounded-full`}></div>
                                {item.user_email && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendEmail(item);
                                    }}
                                    disabled={sendingEmail}
                                    className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    title={language === 'en' ? 'Send Email Summary' : 'Enviar Resumen por Correo'}
                                  >
                                    <Send className="w-3 h-3" />
                                  </button>
                                )}
                                {item.status === 'waiting' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteCase(item.queue_number);
                                    }}
                                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {language === 'en' ? 'Complete' : 'Completar'}
                                  </button>
                                )}
                                {item.status === 'in_progress' && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                    {language === 'en' ? 'In Progress' : 'En Progreso'}
                                  </span>
                                )}
                                {item.status === 'completed' && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                    {language === 'en' ? 'Completed' : 'Completado'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Details - Right Column */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Case Details' : 'Detalles del Caso'}
            </h2>
            
            {selectedCase ? (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Basic Case Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
                    <div className={`px-3 py-1 ${getPriorityColor(selectedCase.priority)} text-white rounded-full text-sm font-medium`}>
                      {selectedCase.priority}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900 mr-3">
                        {selectedCase.queue_number}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">{language === 'en' ? 'Case Type' : 'Tipo de Caso'}</p>
                        <p className="font-medium">{selectedCase.case_type || getPriorityLabel(selectedCase.priority || selectedCase.priority_level)[language]}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'en' ? 'Status' : 'Estado'}</p>
                        <p className="font-medium capitalize">{selectedCase.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'en' ? 'Language' : 'Idioma'}</p>
                        <p className="font-medium uppercase">{selectedCase.language}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}</p>
                        <p className={`font-medium ${getWaitTimeColor(selectedCase.waitTimeMinutes || 0)}`}>
                          {selectedCase.waitTimeFormatted || calculateWaitTime(selectedCase.arrived_at || selectedCase.timestamp || selectedCase.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                {(selectedCase.user_name || selectedCase.user_email || selectedCase.phone_number) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'User Information' : 'Información del Usuario'}</h4>
                    <div className="space-y-2">
                      {selectedCase.user_name && (
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCase.user_name}</span>
                        </div>
                      )}
                      {selectedCase.user_email && (
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCase.user_email}</span>
                        </div>
                      )}
                      {selectedCase.phone_number && (
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedCase.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Case Summary */}
                {caseSummary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Case Summary' : 'Resumen del Caso'}</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{caseSummary}</p>
                    </div>
                  </div>
                )}

                {/* Conversation Summary */}
                {selectedCase.conversation_summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Conversation Summary' : 'Resumen de Conversación'}</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCase.conversation_summary}</p>
                    </div>
                  </div>
                )}

                {/* Current Node */}
                {selectedCase.current_node && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Current Step' : 'Paso Actual'}</h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedCase.current_node}</p>
                    </div>
                  </div>
                )}

                {/* Documents Needed */}
                {selectedCase.documents_needed && selectedCase.documents_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Documents Needed' : 'Documentos Necesarios'}</h4>
                    <div className="space-y-2">
                      {selectedCase.documents_needed.map((doc, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-2">
                          <p className="text-sm text-gray-700">{doc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowCaseSummary(selectedCase)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'View Case Summary' : 'Ver Resumen del Caso'}
                  </button>

                  {selectedCase.user_email && (
                    <button
                      onClick={() => handleSendEmail(selectedCase)}
                      disabled={sendingEmail}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendingEmail 
                        ? (language === 'en' ? 'Sending...' : 'Enviando...')
                        : (language === 'en' ? 'Send Email Summary' : 'Enviar Resumen por Correo')
                      }
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleCompleteCase(selectedCase.queue_number)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Complete Case' : 'Completar Caso'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCase(null);
                      setCaseSummary(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {language === 'en' ? 'Clear Selection' : 'Limpiar Selección'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{language === 'en' ? 'Select a case to view details' : 'Selecciona un caso para ver detalles'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Forms Management Tab Content */}
      {activeTab === 'forms' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <FormsSummary />
          <FormsManagement />
        </div>
      )}

      {/* Case Summary Modal */}
      {showCaseSummaryModal && caseSummaryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
              </h2>
              <button
                onClick={() => setShowCaseSummaryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Case Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${getPriorityColor(caseSummaryData.priority || caseSummaryData.priority_level)} rounded-lg flex items-center justify-center mr-4`}>
                      <span className="text-xl font-bold text-white">
                        {caseSummaryData.queue_number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getPriorityLabel(caseSummaryData.priority || caseSummaryData.priority_level)[language]}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'en' ? 'Priority' : 'Prioridad'} {caseSummaryData.priority || caseSummaryData.priority_level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Status' : 'Estado'}
                    </p>
                    <p className="font-medium capitalize">
                      {caseSummaryData.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              {(caseSummaryData.user_name || caseSummaryData.user_email || caseSummaryData.phone_number) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'User Information' : 'Información del Usuario'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {caseSummaryData.user_name && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {language === 'en' ? 'Name' : 'Nombre'}
                          </p>
                          <p className="font-medium">{caseSummaryData.user_name}</p>
                        </div>
                      </div>
                    )}
                    {caseSummaryData.user_email && (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {language === 'en' ? 'Email' : 'Correo'}
                          </p>
                          <p className="font-medium">{caseSummaryData.user_email}</p>
                        </div>
                      </div>
                    )}
                    {caseSummaryData.phone_number && (
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {language === 'en' ? 'Phone' : 'Teléfono'}
                          </p>
                          <p className="font-medium">{caseSummaryData.phone_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Case Details' : 'Detalles del Caso'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Case Type' : 'Tipo de Caso'}
                    </p>
                    <p className="font-medium">
                      {caseSummaryData.case_type || getPriorityLabel(caseSummaryData.priority || caseSummaryData.priority_level)[language]}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Language' : 'Idioma'}
                    </p>
                    <p className="font-medium uppercase">
                      {caseSummaryData.language || 'en'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}
                    </p>
                    <p className="font-medium">
                      {calculateWaitTime(caseSummaryData.arrived_at || caseSummaryData.timestamp || caseSummaryData.created_at)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Arrived At' : 'Llegó a las'}
                    </p>
                    <p className="font-medium">
                      {caseSummaryData.arrived_at || caseSummaryData.timestamp || caseSummaryData.created_at 
                        ? new Date(caseSummaryData.arrived_at || caseSummaryData.timestamp || caseSummaryData.created_at).toLocaleString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversation Summary */}
              {caseSummaryData.conversation_summary && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Conversation Summary' : 'Resumen de Conversación'}
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {caseSummaryData.conversation_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Step */}
              {caseSummaryData.current_node && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Current Step' : 'Paso Actual'}
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{caseSummaryData.current_node}</p>
                  </div>
                </div>
              )}

              {/* Documents Needed */}
              {caseSummaryData.documents_needed && caseSummaryData.documents_needed.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Documents Needed' : 'Documentos Necesarios'}
                  </h4>
                  <div className="space-y-2">
                    {caseSummaryData.documents_needed.map((doc, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <p className="text-gray-700">{doc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {caseSummaryData.next_steps && caseSummaryData.next_steps.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Next Steps' : 'Próximos Pasos'}
                  </h4>
                  <div className="space-y-2">
                    {caseSummaryData.next_steps.map((step, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers/History */}
              {caseSummaryData.answers && Object.keys(caseSummaryData.answers).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Case Answers' : 'Respuestas del Caso'}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(caseSummaryData.answers).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* History */}
              {caseSummaryData.history && caseSummaryData.history.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {language === 'en' ? 'Case History' : 'Historial del Caso'}
                  </h4>
                  <div className="space-y-2">
                    {caseSummaryData.history.map((item, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCaseSummaryModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'en' ? 'Close' : 'Cerrar'}
              </button>
              {caseSummaryData.user_email && (
                <button
                  onClick={() => {
                    handleSendEmail(caseSummaryData);
                    setShowCaseSummaryModal(false);
                  }}
                  disabled={sendingEmail}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Send Email' : 'Enviar Correo'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
