import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useKioskMode } from '../contexts/KioskModeContext';
import { useToast } from '../components/Toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { Users, CheckCircle, RefreshCw, FileText, Globe, Phone, Mail, Clock, AlertTriangle, Send, Eye, X, LogOut, User as UserIcon, Monitor, MonitorOff } from 'lucide-react';
import { getQueue, callNext, completeCase, addTestData, sendComprehensiveEmail } from '../utils/queueAPI';
import { getAdminQueue, callNextAuthenticated, completeCaseAuthenticated } from '../utils/authAPI';
import FormsManagement from '../components/FormsManagement';
import FormsSummary from '../components/FormsSummary';
import CaseDetailsModal from '../components/CaseDetailsModal';

const AdminDashboard = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user, logout, sessionToken } = useAuth();
  const { isKioskMode, toggleKioskMode } = useKioskMode();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'forms'
  const [queue, setQueue] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCaseSummaryModal, setShowCaseSummaryModal] = useState(false);
  const [caseSummaryData, setCaseSummaryData] = useState(null);
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState(null);
  const [isTabActive, setIsTabActive] = useState(true);
  
  // Refs for polling management
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);
  const lastFetchTimeRef = useRef(Date.now());

  // Helper function for debug logging (only in development)
  const debugLog = useCallback((...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdminDashboard]', ...args);
    }
  }, []);

  // Helper function to get priority consistently
  const getPriority = useCallback((item) => {
    return item?.priority || item?.priority_level || 'C';
  }, []);

  // Track tab visibility for intelligent polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      setError(null);
      debugLog('Fetching queue data...');
      
      // Use authenticated API if available, fallback to regular API
      let data;
      if (sessionToken) {
        data = await getAdminQueue(sessionToken);
      } else {
        data = await getQueue();
      }
      
      debugLog('Received queue data:', data);
      
      // Ensure queue is always an array
      const queueArray = data.queue || [];
      debugLog('Setting queue array:', queueArray);
      setQueue(queueArray);
      setCurrentNumber(data.current_number || null);
      
      // Log queue statistics (development only)
      if (process.env.NODE_ENV === 'development') {
        debugLog('Queue statistics:');
        debugLog('- Total cases:', queueArray.length);
        debugLog('- Cases by priority:', queueArray.reduce((acc, item) => {
          acc[getPriority(item)] = (acc[getPriority(item)] || 0) + 1;
          return acc;
        }, {}));
        debugLog('- Cases by status:', queueArray.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}));
      }
      
      // Reset poll count on successful fetch
      pollCountRef.current = 0;
      lastFetchTimeRef.current = Date.now();
      
    } catch (error) {
      debugLog('Error fetching queue:', error);
      setError('Failed to fetch queue data');
      // Set empty arrays to prevent undefined errors
      setQueue([]);
      setCurrentNumber(null);
      
      // Increment error count for backoff
      pollCountRef.current += 1;
    } finally {
      setLoading(false);
    }
  }, [sessionToken, debugLog, getPriority]);

  // Calculate polling interval with exponential backoff
  const getPollingInterval = useCallback(() => {
    const baseInterval = 5000; // 5 seconds
    const maxInterval = 60000; // 60 seconds
    const inactiveMultiplier = 4; // Poll 4x slower when tab inactive
    
    // Exponential backoff on errors
    const backoffInterval = Math.min(
      baseInterval * Math.pow(2, pollCountRef.current),
      maxInterval
    );
    
    // Reduce polling when tab is inactive
    return isTabActive ? backoffInterval : backoffInterval * inactiveMultiplier;
  }, [isTabActive]);

  // Setup polling with intelligent intervals
  useEffect(() => {
    // Initial fetch
    fetchQueue();
    
    // Setup polling
    const startPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      const interval = getPollingInterval();
      debugLog(`Setting poll interval to ${interval}ms (active: ${isTabActive})`);
      pollIntervalRef.current = setInterval(fetchQueue, interval);
    };
    
    startPolling();
    
    // Restart polling when interval changes
    const restartInterval = setInterval(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      startPolling();
    }, getPollingInterval());
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (restartInterval) {
        clearInterval(restartInterval);
      }
    };
  }, [fetchQueue, getPollingInterval, isTabActive, debugLog]);

  // WebSocket connection for real-time updates (falls back to polling if unavailable)
  const { isConnected: wsConnected } = useWebSocket('/api/ws/queue', {
    enabled: !!sessionToken, // Only enable if authenticated
    onMessage: (data) => {
      debugLog('WebSocket message received:', data);
      if (data.type === 'queue_update') {
        setQueue(data.queue || []);
        setCurrentNumber(data.current_number || null);
        pollCountRef.current = 0; // Reset error count on successful update
      }
    },
    onError: (error) => {
      debugLog('WebSocket error:', error);
      // Falls back to polling automatically
    },
  });

  // Debounced action handler to prevent spam
  const handleActionWithDebounce = useCallback(async (actionFn, successMessage, errorMessage) => {
    if (actionLoading) {
      debugLog('Action already in progress, ignoring click');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    try {
      await actionFn();
      toast.success(successMessage);
      await fetchQueue(); // Refresh queue immediately after action
    } catch (err) {
      debugLog('Action error:', err);
      const errorMsg = errorMessage || err.message || 'Action failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, toast, fetchQueue, debugLog]);

  const handleCallNext = async () => {
    await handleActionWithDebounce(async () => {
      let result;
      if (sessionToken) {
        result = await callNextAuthenticated(sessionToken);
      } else {
        result = await callNext();
      }
      
      // If we got comprehensive case information, update current number display
      if (result && result.queue_entry) {
        setCurrentNumber(result.queue_entry);
        // Show a notification with case type information
        const caseTypeInfo = result.queue_entry.case_type_info;
        const caseTypeName = caseTypeInfo?.name || result.queue_entry.case_type || 'Unknown Case Type';
        const priorityLabel = getPriorityLabel(getPriority(result.queue_entry))[language];
        
        toast.success(language === 'en' 
          ? `Called ${result.queue_entry.queue_number} - ${caseTypeName} (${priorityLabel})`
          : `Llamado ${result.queue_entry.queue_number} - ${caseTypeName} (${priorityLabel})`
        );
      }
      
      return result;
    }, 
    language === 'en' ? 'Next case called successfully' : 'Siguiente caso llamado exitosamente',
    language === 'en' ? 'Failed to call next number' : 'Error al llamar siguiente número'
    );
  };

  const handleCompleteCase = async (queueNumber) => {
    await handleActionWithDebounce(async () => {
      if (sessionToken) {
        await completeCaseAuthenticated(queueNumber, sessionToken);
      } else {
        await completeCase(queueNumber);
      }
      if (selectedCase?.queue_number === queueNumber) {
        setSelectedCase(null);
      }
      if (currentNumber?.queue_number === queueNumber) {
        setCurrentNumber(null);
      }
    },
    language === 'en' ? 'Case completed successfully' : 'Caso completado exitosamente',
    language === 'en' ? 'Failed to complete case' : 'Error al completar caso'
    );
  };

  const handleAddTestData = async () => {
    await handleActionWithDebounce(async () => {
      await addTestData();
    },
    language === 'en' ? 'Test data added successfully' : 'Datos de prueba agregados exitosamente',
    language === 'en' ? 'Failed to add test data' : 'Error al agregar datos de prueba'
    );
  };

  const handleCaseSelect = async (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleShowCaseSummary = (caseItem) => {
    setCaseSummaryData(caseItem);
    setShowCaseSummaryModal(true);
  };

  const handleViewCaseDetails = (caseData) => {
    setSelectedCaseForDetails(caseData);
    setShowCaseDetailsModal(true);
  };

  const handleCloseCaseDetails = () => {
    setShowCaseDetailsModal(false);
    setSelectedCaseForDetails(null);
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
        toast.success(language === 'en' 
          ? `Email sent successfully to ${caseItem.user_email}` 
          : `Correo enviado exitosamente a ${caseItem.user_email}`);
      } else {
        const errorMsg = result.error || (language === 'en' ? 'Failed to send email' : 'Error al enviar correo');
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      debugLog('Error sending email:', error);
      const errorMsg = language === 'en' ? 'Failed to send email' : 'Error al enviar correo';
      setError(errorMsg);
      toast.error(errorMsg);
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

  const getFacilitatorActionText = (item, lang) => {
    const languageCode = lang || 'en';
    const priority = item.priority || item.priority_level || 'C';
    const status = item.status || 'waiting';
    const longWait = (item.waitTimeMinutes || 0) >= 30;

    if (status === 'completed') {
      return languageCode === 'en'
        ? 'This case is completed. No further action needed unless the client returns.'
        : 'Este caso está completado. No se necesita más acción a menos que el cliente regrese.';
    }

    if (status === 'in_progress') {
      return languageCode === 'en'
        ? 'Continue working with this client. Make sure required forms are explained and completed, then mark the case as completed.'
        : 'Siga trabajando con este cliente. Asegúrese de explicar y completar los formularios requeridos y luego marque el caso como completado.';
    }

    if (priority === 'A') {
      return languageCode === 'en'
        ? 'High-priority safety case. Call this person as soon as possible. Start by confirming safety, reviewing their story, and identifying immediate protection options.'
        : 'Caso de seguridad de alta prioridad. Llame a esta persona lo antes posible. Empiece confirmando la seguridad, revisando su situación e identificando opciones de protección inmediata.';
    }

    if (priority === 'B') {
      return languageCode === 'en'
        ? 'Custody / support case. Focus on parenting schedule, income information, and any upcoming court dates. Gather documents like prior orders or pay stubs.'
        : 'Caso de custodia / manutención. Enfoque en el horario de crianza, información de ingresos y próximas fechas de corte. Reúna documentos como órdenes previas o talones de pago.';
    }

    if (priority === 'D') {
      return languageCode === 'en'
        ? 'Other family law issue. Start by asking the client to briefly explain what they need. Then identify which forms apply and what their next deadline is.'
        : 'Otro asunto de ley familiar. Empiece pidiendo al cliente que explique brevemente qué necesita. Luego identifique qué formularios aplican y cuál es su próximo plazo.';
    }

    if (longWait) {
      return languageCode === 'en'
        ? 'This client has been waiting a long time. Consider prioritizing them next or updating them about the delay.'
        : 'Este cliente ha estado esperando mucho tiempo. Considere darle prioridad o informarle sobre el retraso.';
    }

    return languageCode === 'en'
      ? 'Review this case, then call the client when you are ready. Start by confirming contact information and why they came today.'
      : 'Revise este caso y luego llame al cliente cuando esté listo. Empiece confirmando la información de contacto y por qué vino hoy.';
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
    // Use helper function for consistency
    const aPriorityValue = getPriority(a);
    const bPriorityValue = getPriority(b);
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
                onClick={() => toggleKioskMode()}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isKioskMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                title={isKioskMode ? 'Switch to Website Mode' : 'Switch to Kiosk Mode'}
              >
                {isKioskMode ? (
                  <>
                    <MonitorOff className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Website Mode' : 'Modo Sitio Web'}
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Kiosk Mode' : 'Modo Quiosco'}
                  </>
                )}
              </button>
              <button
                onClick={fetchQueue}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={language === 'en' ? 'Refresh queue' : 'Actualizar cola'}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
                {language === 'en' ? 'Refresh' : 'Actualizar'}
              </button>
              {wsConnected && (
                <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {language === 'en' ? 'Live' : 'En vivo'}
                </div>
              )}
              <button
                onClick={handleAddTestData}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={language === 'en' ? 'Add test data' : 'Agregar datos de prueba'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {actionLoading ? (language === 'en' ? 'Processing...' : 'Procesando...') : (language === 'en' ? 'Add Test Data' : 'Agregar Datos de Prueba')}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Queue Number and Basic Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center mb-4">
                  <div className={`w-20 h-20 ${getPriorityColor(getPriority(currentNumber))} rounded-lg flex items-center justify-center mr-4`}>
                    <span className="text-4xl font-bold text-white">
                      {currentNumber.queue_number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getPriorityLabel(getPriority(currentNumber))[language]}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'en' ? 'Priority' : 'Prioridad'} {getPriority(currentNumber)}
                    </p>
                  </div>
                </div>
                
                {/* Case Type Information - Prominently Displayed */}
                {currentNumber.case_type_info && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-blue-900 mb-2">
                      {language === 'en' ? 'Case Type Information' : 'Información del Tipo de Caso'}
                    </h4>
                    <p className="text-lg font-semibold text-blue-800 mb-1">
                      {currentNumber.case_type_info.name || currentNumber.case_type}
                    </p>
                    {currentNumber.case_type_info.description && (
                      <p className="text-sm text-blue-700">
                        {currentNumber.case_type_info.description}
                      </p>
                    )}
                    {currentNumber.case_type_info.estimated_duration && (
                      <p className="text-sm text-blue-600 mt-2">
                        {language === 'en' ? 'Estimated Duration:' : 'Duración Estimada:'} {currentNumber.case_type_info.estimated_duration} {language === 'en' ? 'minutes' : 'minutos'}
                      </p>
                    )}
                  </div>
                )}
                
                {/* User Information */}
                <div className="space-y-2">
                  {currentNumber.user_name && (
                    <p className="text-gray-700">
                      <strong>{language === 'en' ? 'Name:' : 'Nombre:'}</strong> {currentNumber.user_name}
                    </p>
                  )}
                  {currentNumber.user_email && (
                    <p className="text-gray-700">
                      <strong>{language === 'en' ? 'Email:' : 'Correo:'}</strong> {currentNumber.user_email}
                    </p>
                  )}
                  {currentNumber.phone_number && (
                    <p className="text-gray-700">
                      <strong>{language === 'en' ? 'Phone:' : 'Teléfono:'}</strong> {currentNumber.phone_number}
                    </p>
                  )}
                  {currentNumber.language && (
                    <p className="text-gray-700">
                      <strong>{language === 'en' ? 'Language:' : 'Idioma:'}</strong> {currentNumber.language.toUpperCase()}
                    </p>
                  )}
                  {(currentNumber.created_at || currentNumber.arrived_at || currentNumber.timestamp) && (
                    <p className="text-gray-700">
                      <strong>{language === 'en' ? 'Wait time:' : 'Tiempo de espera:'}</strong> {calculateWaitTime(currentNumber.created_at || currentNumber.arrived_at || currentNumber.timestamp)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Middle Column: Documents and Summary */}
              <div className="lg:col-span-1">
                {/* Documents Needed */}
                {currentNumber.documents_needed && currentNumber.documents_needed.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'en' ? 'Documents Needed' : 'Documentos Necesarios'}
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1">
                        {currentNumber.documents_needed.map((doc, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {typeof doc === 'string' ? doc : doc.form_code || doc.title || doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Conversation Summary */}
                {currentNumber.conversation_summary && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {currentNumber.conversation_summary}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Current Node/Step */}
                {currentNumber.current_node && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {language === 'en' ? 'Current Step' : 'Paso Actual'}
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{currentNumber.current_node}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column: Actions */}
              <div className="lg:col-span-1">
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleShowCaseSummary(currentNumber)}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'View Full Summary' : 'Ver Resumen Completo'}
                  </button>
                  {currentNumber.user_email && (
                    <button
                      onClick={() => handleSendEmail(currentNumber)}
                      disabled={sendingEmail}
                      className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendingEmail 
                        ? (language === 'en' ? 'Sending...' : 'Enviando...')
                        : (language === 'en' ? 'Send Email' : 'Enviar Correo')
                      }
                    </button>
                  )}
                  <button
                    onClick={() => handleCompleteCase(currentNumber.queue_number)}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={language === 'en' ? 'Complete current case' : 'Completar caso actual'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? (language === 'en' ? 'Processing...' : 'Procesando...') : (language === 'en' ? 'Complete Case' : 'Completar Caso')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Next Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={handleCallNext}
          disabled={waitingCount === 0 || actionLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xl font-semibold"
          aria-label={language === 'en' ? 'Call next case from queue' : 'Llamar siguiente caso de la cola'}
        >
          {actionLoading 
            ? (language === 'en' ? 'Processing...' : 'Procesando...')
            : (language === 'en' ? 'Call Next Number' : 'Llamar Siguiente Número')
          }
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
                        {getPriorityLabel(getPriority(item))[language]}
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
                    disabled={actionLoading}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={language === 'en' ? `Complete case ${item.queue_number}` : `Completar caso ${item.queue_number}`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {actionLoading ? (language === 'en' ? '...' : '...') : (language === 'en' ? 'Complete' : 'Completar')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Queue list & Case Details */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue list */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Queue' : 'Cola'}
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Number' : 'Número'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Case Type' : 'Tipo de Caso'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Priority' : 'Prioridad'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Wait Time' : 'Espera'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Status' : 'Estado'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'en' ? 'Actions' : 'Acciones'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {sortedQueue
                      .filter(item => item.status !== 'completed')
                      .map((item) => {
                        const isSelected = selectedCase?.queue_number === item.queue_number;
                        const priority = getPriority(item);
                        const waitTimeClass = getWaitTimeColor(item.waitTimeMinutes || 0);
                        const waitTimeAlert = getWaitTimeAlert(item.waitTimeMinutes || 0);
                        const statusColor = getStatusColor(item.status);

                        return (
                          <tr
                            key={item.queue_number}
                            className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => handleCaseSelect(item)}
                          >
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {item.queue_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.case_type || getPriorityLabel(getPriority(item))[language]}
                              {item.user_name && (
                                <div className="text-xs text-gray-500">
                                  {item.user_name}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                {priority} · {getPriorityLabel(getPriority(item))[language]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${waitTimeAlert || ''} ${waitTimeClass}`}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {item.waitTimeFormatted}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${statusColor}`}
                              >
                                {language === 'en'
                                  ? item.status.replace('_', ' ')
                                  : item.status === 'waiting'
                                  ? 'esperando'
                                  : item.status === 'in_progress'
                                  ? 'en progreso'
                                  : item.status === 'completed'
                                  ? 'completado'
                                  : item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewCaseDetails(item);
                                  }}
                                  className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                                  title={language === 'en' ? 'View Case Details' : 'Ver Detalles'}
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                {item.user_email && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendEmail(item);
                                    }}
                                    disabled={sendingEmail}
                                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    title={language === 'en' ? 'Email Summary' : 'Enviar Resumen'}
                                  >
                                    <Send className="w-3 h-3" />
                                  </button>
                                )}
                                {item.status !== 'completed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteCase(item.queue_number);
                                    }}
                                    disabled={actionLoading}
                                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label={language === 'en' ? `Complete case ${item.queue_number}` : `Completar caso ${item.queue_number}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {actionLoading ? (language === 'en' ? '...' : '...') : (language === 'en' ? 'Complete' : 'Completar')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {sortedQueue.filter(item => item.status !== 'completed').length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          {language === 'en'
                            ? 'No cases in the queue.'
                            : 'No hay casos en la cola.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Case Details Pane */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Case Details' : 'Detalles del Caso'}
            </h2>

            {selectedCase ? (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {language === 'en'
                      ? 'How you can help now'
                      : 'Cómo puede ayudar ahora'}
                  </h3>
                  <p className="text-sm text-blue-800">
                    {getFacilitatorActionText(selectedCase, language)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'en' ? 'Case Information' : 'Información del Caso'}
                    </h3>
                    <div className={`px-3 py-1 ${getPriorityColor(getPriority(selectedCase))} text-white rounded-full text-sm font-medium`}>
                      {getPriority(selectedCase)}
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
                        <p className="font-medium">
                          {selectedCase.case_type || getPriorityLabel(getPriority(selectedCase))[language]}
                        </p>
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

                {(selectedCase.user_name || selectedCase.user_email || selectedCase.phone_number) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'en' ? 'User Information' : 'Información del Usuario'}
                    </h4>
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

                {selectedCase.conversation_summary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'en' ? 'Conversation Summary' : 'Resumen de Conversación'}
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedCase.conversation_summary}
                      </p>
                    </div>
                  </div>
                )}

                {selectedCase.current_node && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'en' ? 'Current Step' : 'Paso Actual'}
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedCase.current_node}
                      </p>
                    </div>
                  </div>
                )}

                {selectedCase.documents_needed && selectedCase.documents_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === 'en' ? 'Documents Needed' : 'Documentos Necesarios'}
                    </h4>
                    <div className="space-y-2">
                      {selectedCase.documents_needed.map((doc, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-2">
                          <p className="text-sm text-gray-700">
                            {typeof doc === 'string' ? doc : doc.form_code || doc.title || doc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                        : (language === 'en' ? 'Send Email Summary' : 'Enviar Resumen por Correo')}
                    </button>
                  )}

                  <button
                    onClick={() => handleCompleteCase(selectedCase.queue_number)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={language === 'en' ? 'Complete selected case' : 'Completar caso seleccionado'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? (language === 'en' ? 'Processing...' : 'Procesando...') : (language === 'en' ? 'Complete Case' : 'Completar Caso')}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCase(null);
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
                  <p>
                    {language === 'en'
                      ? 'Select a case from the queue to see details'
                      : 'Selecciona un caso de la cola para ver detalles'}
                  </p>
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
                    <div className={`w-12 h-12 ${getPriorityColor(getPriority(caseSummaryData))} rounded-lg flex items-center justify-center mr-4`}>
                      <span className="text-xl font-bold text-white">
                        {caseSummaryData.queue_number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getPriorityLabel(getPriority(caseSummaryData))[language]}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'en' ? 'Priority' : 'Prioridad'} {getPriority(caseSummaryData)}
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
                      {caseSummaryData.case_type || getPriorityLabel(getPriority(caseSummaryData))[language]}
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

      {/* Case Details Modal */}
      <CaseDetailsModal
        caseData={selectedCaseForDetails}
        isOpen={showCaseDetailsModal}
        onClose={handleCloseCaseDetails}
        onCompleteCase={handleCompleteCase}
        onSendEmail={handleSendEmail}
        language={language}
      />
    </div>
  );
};

export default AdminDashboard;
