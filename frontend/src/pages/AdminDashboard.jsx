import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, CheckCircle, RefreshCw, Shield, Heart, FileText, Globe } from 'lucide-react';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5001';

const AdminDashboard = () => {
  const { language, toggleLanguage } = useLanguage();
  const [queue, setQueue] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue`);
      if (response.ok) {
        const data = await response.json();
        setQueue(data.queue);
        setCurrentNumber(data.current_number);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const callNext = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error calling next number:', error);
    }
  };

  const completeCase = async (queueNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/complete-case`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queue_number: queueNumber })
      });
      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error completing case:', error);
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

  const groupedQueue = queue.reduce((acc, item) => {
    if (!acc[item.priority]) {
      acc[item.priority] = [];
    }
    acc[item.priority].push(item);
    return acc;
  }, {});

  const priorityOrder = ['A', 'B', 'C', 'D'];

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

      {/* Current Number Display */}
      {currentNumber && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Currently Serving' : 'Atendiendo Actualmente'}
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${getPriorityColor(currentNumber.priority)} rounded-lg flex items-center justify-center mr-4`}>
                  <span className="text-3xl font-bold text-white">
                    {currentNumber.queue_number}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getPriorityLabel(currentNumber.priority)[language]}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'en' ? 'Priority' : 'Prioridad'} {currentNumber.priority}
                  </p>
                </div>
              </div>
              <button
                onClick={() => completeCase(currentNumber.queue_number)}
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
          onClick={callNext}
          disabled={queue.length === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xl font-semibold"
        >
          {language === 'en' ? 'Call Next Number' : 'Llamar Siguiente Número'}
        </button>
      </div>

      {/* Queue by Priority */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'en' ? 'Queue by Priority' : 'Cola por Prioridad'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {priorityOrder.map((priority) => {
            const priorityItems = groupedQueue[priority] || [];
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
                      {priorityItems.length} {language === 'en' ? 'waiting' : 'esperando'}
                    </p>
                  </div>
                </div>

                {priorityItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {language === 'en' ? 'No cases waiting' : 'No hay casos esperando'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {priorityItems.map((item, index) => (
                      <div
                        key={item.queue_number}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900 mr-3">
                            {item.queue_number}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getPriorityLabel(item.priority)[language]}
                            </p>
                            <p className="text-sm text-gray-600">
                              {language === 'en' ? 'Arrived' : 'Llegó'} {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => completeCase(item.queue_number)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {language === 'en' ? 'Complete' : 'Completar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Queue Statistics' : 'Estadísticas de Cola'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {priorityOrder.map((priority) => {
              const count = groupedQueue[priority]?.length || 0;
              return (
                <div key={priority} className="text-center">
                  <div className={`w-12 h-12 ${getPriorityColor(priority)} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getPriorityLabel(priority)[language]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
