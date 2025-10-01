import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Users,
  CheckCircle,
  RefreshCw,
  Shield,
  Heart,
  FileText,
  Globe,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Send,
  ClipboardList,
  ListChecks,
  Timer,
  Activity
} from 'lucide-react';
import {
  getQueue,
  callNext,
  completeCase,
  getCaseSummary,
  addTestData,
  sendComprehensiveEmail,
  getSystemStatus
} from '../utils/queueAPI';
import FormsManagement from '../components/FormsManagement';
import FormsSummary from '../components/FormsSummary';

const AdminDashboard = () => {
  const { language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'forms'
  const [queue, setQueue] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSummary, setCaseSummary] = useState(null);
  const [caseProgress, setCaseProgress] = useState([]);
  const [caseAdvice, setCaseAdvice] = useState([]);
  const [caseForms, setCaseForms] = useState([]);
  const [caseNextSteps, setCaseNextSteps] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const normalizeCaseData = (data) => {
    if (!data) return null;

    const createdAt = data.arrived_at || data.timestamp || data.created_at;
    const waitMinutesFromApi =
      typeof data.wait_time_minutes === 'number'
        ? data.wait_time_minutes
        : data.waitTimeMinutes;

    let waitMinutes = waitMinutesFromApi ?? 0;
    if (!waitMinutes && createdAt) {
      const createdDate = new Date(createdAt);
      const now = new Date();
      waitMinutes = createdDate <= now
        ? Math.max(Math.floor((now - createdDate) / (1000 * 60)), 0)
        : 0;
    }

    return {
      ...data,
      priority: data.priority || data.priority_level,
      priority_level: data.priority_level || data.priority,
      waitTimeMinutes: waitMinutes,
      waitTimeFormatted: data.wait_time_formatted || data.waitTimeFormatted || calculateWaitTime(createdAt),
      documents_needed: data.documents_needed || [],
      recommended_forms: data.recommended_forms || [],
      recommended_next_steps: data.recommended_next_steps || [],
      recent_steps: data.recent_steps || []
    };
  };

  const fetchQueue = async () => {
    try {
      setError(null);
      console.log('AdminDashboard: Fetching queue data...');
      const data = await getQueue();
      console.log('AdminDashboard: Received queue data:', data);

      // Ensure queue is always an array
      const queueArray = data.queue || [];
      console.log('AdminDashboard: Setting queue array:', queueArray);
      setQueue(queueArray);
      setCurrentNumber(data.current_number ? normalizeCaseData(data.current_number) : null);

      setSelectedCase((previous) => {
        if (!previous) return previous;
        const updated = queueArray.find(item => item.queue_number === previous.queue_number);
        if (!updated) {
          return previous;
        }
        return {
          ...previous,
          ...normalizeCaseData(updated)
        };
      });

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
  };

  const fetchSystemStatus = async () => {
    try {
      const status = await getSystemStatus();
      if (status.success) {
        setSystemStatus(status);
      } else {
        setSystemStatus(null);
      }
    } catch (statusError) {
      console.error('Error fetching system status:', statusError);
      setSystemStatus(null);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchSystemStatus();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    const statusInterval = setInterval(fetchSystemStatus, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

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
        setCaseSummary(null);
        setCaseProgress([]);
        setCaseAdvice([]);
        setCaseForms([]);
        setCaseNextSteps([]);
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
    const normalized = normalizeCaseData(caseItem);
    setSelectedCase(normalized);
    setCaseSummary(normalized?.conversation_summary || null);
    setCaseProgress(normalized?.recent_steps || []);
    setCaseAdvice(normalized?.recommended_next_steps || []);
    setCaseForms((normalized?.recommended_forms?.length ? normalized.recommended_forms : normalized?.documents_needed) || []);
    setCaseNextSteps(normalized?.recommended_next_steps || []);
    try {
      // Get detailed case summary from backend
      const summaryData = await getCaseSummary(caseItem.queue_number);
      if (summaryData.success) {
        setCaseSummary(summaryData.summary_text || summaryData.summary || normalized?.conversation_summary || null);
        setCaseProgress(summaryData.progress || []);
        const adviceItems = summaryData.advice || [];
        setCaseAdvice(adviceItems);

        const updatedCase = summaryData.case ? normalizeCaseData(summaryData.case) : null;
        if (updatedCase) {
          setSelectedCase(prev => ({ ...prev, ...updatedCase }));
        }

        const forms = summaryData.recommended_forms && summaryData.recommended_forms.length > 0
          ? summaryData.recommended_forms
          : (updatedCase?.documents_needed || normalized?.documents_needed || []);
        setCaseForms(forms);

        const nextSteps = summaryData.recommended_next_steps && summaryData.recommended_next_steps.length > 0
          ? summaryData.recommended_next_steps
          : adviceItems;
        setCaseNextSteps(nextSteps);
      } else {
        setCaseSummary(null);
        setCaseProgress([]);
        setCaseAdvice([]);
        setCaseNextSteps([]);
      }
    } catch (error) {
      console.error('Error fetching case summary:', error);
      setCaseSummary(null);
      setCaseProgress([]);
      setCaseAdvice([]);
      setCaseNextSteps([]);
    }
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
        forms: (caseItem.recommended_forms && caseItem.recommended_forms.length > 0)
          ? caseItem.recommended_forms
          : caseItem.documents_needed || (caseItem.queue_number === selectedCase?.queue_number ? caseForms : []),
        next_steps: (caseItem.recommended_next_steps && caseItem.recommended_next_steps.length > 0)
          ? caseItem.recommended_next_steps
          : caseItem.next_steps || (caseItem.queue_number === selectedCase?.queue_number ? caseNextSteps : []),
        summary: caseItem.queue_number === selectedCase?.queue_number
          ? (caseSummary || caseItem.conversation_summary || '')
          : (caseItem.conversation_summary || ''),
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
      case 'called': return 'bg-blue-500';
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

  const formatMinutes = (minutes) => {
    if (!minutes || minutes <= 0) {
      return '0m';
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
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
  const queueWithWaitTimes = queue.map(item => normalizeCaseData(item));

  // Count cases by status
  const waitingCount = queueWithWaitTimes.filter(item => item.status === 'waiting').length;
  const inProgressCount = queueWithWaitTimes.filter(item => item.status === 'in_progress').length;
  const completedCount = queueWithWaitTimes.filter(item => item.status === 'completed').length;

  const totalWaitMinutes = queueWithWaitTimes.reduce((acc, item) => acc + (item.waitTimeMinutes || 0), 0);
  const longestWait = queueWithWaitTimes.reduce((max, item) => Math.max(max, item.waitTimeMinutes || 0), 0);
  const averageWait = queueWithWaitTimes.length > 0
    ? Math.round(totalWaitMinutes / queueWithWaitTimes.length)
    : 0;
  const overdueCount = queueWithWaitTimes.filter(item => item.status === 'waiting' && (item.waitTimeMinutes || 0) >= 30).length;
  const criticalCount = queueWithWaitTimes.filter(item => item.status === 'waiting' && (item.waitTimeMinutes || 0) >= 60).length;
  const emailConfigured = systemStatus?.email?.configured;
  const emailProvider = systemStatus?.email?.provider;
  const vercelUrl = systemStatus?.api?.vercel_url;

  const uniqueAdvice = Array.from(new Set((caseAdvice || []).filter(Boolean)));
  const displayNextSteps = (caseNextSteps && caseNextSteps.length > 0) ? caseNextSteps : uniqueAdvice;
  const displayForms = caseForms || [];
  const progressTimeline = (caseProgress || []).slice(-6).reverse();
  const selectedWaitAlert = selectedCase ? getWaitTimeAlert(selectedCase.waitTimeMinutes || 0) : null;
  const caseNeedsAttention = (selectedCase?.waitTimeMinutes || 0) >= 30;
  const emailStatusLabel = emailConfigured
    ? `Online (${(emailProvider || 'smtp').toUpperCase()})`
    : 'Not Configured';
  const emailStatusClass = emailConfigured ? 'text-green-600' : 'text-red-600';
  const deploymentStatus = systemStatus?.api?.deployed
    ? (vercelUrl ? `Live @ ${vercelUrl}` : 'Live deployment detected')
    : 'Running locally';

  // Sort by priority and wait time
  const sortedQueue = [...queueWithWaitTimes].sort((a, b) => {
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'en' ? 'Facilitator Dashboard' : 'Panel del Facilitador'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'en'
                  ? 'Track every client and keep the line moving'
                  : 'Supervisa cada caso y evita tiempos de espera largos'}
              </p>
              <div className="flex flex-wrap gap-6 mt-3">
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
            <div className="flex flex-wrap gap-3">
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
            </div>
          </div>
        </div>
      </div>

      {/* Operational Overview */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Longest Wait' : 'Espera más larga'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{formatMinutes(longestWait)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'en'
                    ? `${criticalCount} urgent ${criticalCount === 1 ? 'case' : 'cases'}`
                    : `${criticalCount} caso${criticalCount === 1 ? '' : 's'} urgente${criticalCount === 1 ? '' : 's'}`}
                </p>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white border border-orange-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? '30+ min waiting' : '30+ min esperando'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{overdueCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'en'
                    ? 'Check on these clients now'
                    : 'Revisa estos clientes ahora'}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Active consultations' : 'Consultas activas'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'en'
                    ? `Avg wait ${formatMinutes(averageWait)}`
                    : `Espera prom. ${formatMinutes(averageWait)}`}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Email & API status' : 'Estado del correo y API'}
                </p>
                <p className={`text-2xl font-semibold ${emailStatusClass}`}>
                  {emailStatusLabel}
                </p>
                <p className="text-xs text-gray-500 mt-1">{deploymentStatus}</p>
              </div>
              <Mail className="w-8 h-8 text-gray-500" />
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
          {overdueCount > 0 && (
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    {language === 'en' ? 'Long Wait Alert:' : 'Alerta de Espera Larga:'}
                  </span>
                  <span className="ml-2">
                    {overdueCount}
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
                  <p className="text-gray-600">
                    {language === 'en' ? 'Wait time:' : 'Tiempo de espera:'} {currentNumber.waitTimeFormatted}
                  </p>
                </div>
              </div>
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
                      {item.recent_steps && item.recent_steps.length > 0 && (
                        <p className="text-xs text-blue-800 mt-1">
                          {item.recent_steps[item.recent_steps.length - 1].node_text}
                        </p>
                      )}
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
                                  {item.recent_steps && item.recent_steps.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {item.recent_steps[item.recent_steps.length - 1].node_text}
                                    </p>
                                  )}
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
                  <div className={`bg-white rounded-lg shadow-md p-6 space-y-6 ${selectedWaitAlert ? selectedWaitAlert : ''}`}>
                    {/* Basic Case Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl font-bold text-gray-900">{selectedCase.queue_number}</span>
                            <div className={`px-3 py-1 ${getPriorityColor(selectedCase.priority)} text-white rounded-full text-sm font-medium`}>
                              {selectedCase.priority}
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {selectedCase.case_type || getPriorityLabel(selectedCase.priority || selectedCase.priority_level)[language]}
                          </p>
                          <p className={`text-sm mt-1 ${getWaitTimeColor(selectedCase.waitTimeMinutes || 0)}`}>
                            {language === 'en' ? 'Wait time:' : 'Tiempo de espera:'} {selectedCase.waitTimeFormatted}
                          </p>
                        </div>
                        {caseNeedsAttention && (
                          <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {language === 'en' ? 'Needs attention' : 'Necesita atención'}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{language === 'en' ? 'Status' : 'Estado'}</p>
                          <p className="font-medium capitalize">{selectedCase.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{language === 'en' ? 'Language' : 'Idioma'}</p>
                          <p className="font-medium uppercase">{selectedCase.language}</p>
                        </div>
                        {selectedCase.current_node && (
                          <div className="lg:col-span-2">
                            <p className="text-gray-500">{language === 'en' ? 'Current step' : 'Paso actual'}</p>
                            <p className="font-medium text-gray-900">{selectedCase.current_node}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    {(selectedCase.user_name || selectedCase.user_email || selectedCase.phone_number) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Client details' : 'Datos del cliente'}</h4>
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

                    {/* Recommended Actions */}
                    {displayNextSteps.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Next actions for the client' : 'Próximas acciones para el cliente'}</h4>
                        <div className="space-y-2">
                          {displayNextSteps.map((step, index) => (
                            <div key={`${step}-${index}`} className="flex items-start bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <ListChecks className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                              <span className="text-sm text-gray-700">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Forms to prepare */}
                    {displayForms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Forms to prepare' : 'Formularios a preparar'}</h4>
                        <div className="flex flex-wrap gap-2">
                          {displayForms.map((doc, index) => (
                            <span key={`${doc}-${index}`} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <FileText className="w-3 h-3 mr-1" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilitator talking points */}
                    {uniqueAdvice.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Talking points for staff' : 'Puntos clave para el personal'}</h4>
                        <div className="space-y-2">
                          {uniqueAdvice.map((item, index) => (
                            <div key={`${item}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Timeline */}
                    {progressTimeline.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Recent progress' : 'Progreso reciente'}</h4>
                        <div className="space-y-3">
                          {progressTimeline.map((step, index) => (
                            <div key={`${step.node_id}-${index}`} className="flex items-start">
                              <ClipboardList className="w-4 h-4 text-indigo-500 mt-1 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{step.node_text}</p>
                                {step.user_response && (
                                  <p className="text-xs text-gray-500 mt-1">{step.user_response}</p>
                                )}
                                {step.timestamp && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(step.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilitator Notes */}
                    {selectedCase.facilitator_notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Facilitator notes' : 'Notas del facilitador'}</h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
                          {selectedCase.facilitator_notes}
                        </div>
                      </div>
                    )}

                    {/* Case Summary */}
                    {caseSummary && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Case summary' : 'Resumen del caso'}</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{caseSummary}</p>
                        </div>
                      </div>
                    )}

                    {/* Conversation Summary */}
                    {selectedCase.conversation_summary && !caseSummary && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">{language === 'en' ? 'Conversation summary' : 'Resumen de conversación'}</h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCase.conversation_summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {selectedCase.user_email && (
                        <button
                          onClick={() => handleSendEmail(selectedCase)}
                          disabled={sendingEmail}
                          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendingEmail
                            ? (language === 'en' ? 'Sending...' : 'Enviando...')
                            : (language === 'en' ? 'Send Email Summary' : 'Enviar resumen por correo')}
                        </button>
                      )}

                      <button
                        onClick={() => handleCompleteCase(selectedCase.queue_number)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Complete Case' : 'Completar caso'}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCase(null);
                          setCaseSummary(null);
                          setCaseAdvice([]);
                          setCaseForms([]);
                          setCaseProgress([]);
                          setCaseNextSteps([]);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {language === 'en' ? 'Clear Selection' : 'Limpiar selección'}
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
    </div>
  );
};

export default AdminDashboard;
