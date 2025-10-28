import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Target,
  Download,
  Send,
  Brain,
  RefreshCw
} from 'lucide-react';
import CaseProgressTracker from './CaseProgressTracker';

const CaseDetailsModal = ({ 
  caseData, 
  isOpen, 
  onClose, 
  onCompleteCase, 
  onSendEmail,
  language = 'en' 
}) => {
  const [caseSummary, setCaseSummary] = useState(null);

  const fetchCaseSummary = useCallback(async () => {
    if (!caseData?.queue_number) return;
    
    try {
      const response = await fetch(`/api/case-details/${caseData.queue_number}`);
      if (response.ok) {
        const data = await response.json();
        setCaseSummary(data);
      } else {
        throw new Error('Failed to fetch case details');
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
    }
  }, [caseData?.queue_number]);

  useEffect(() => {
    if (isOpen && caseData) {
      fetchCaseSummary();
    }
  }, [isOpen, caseData, fetchCaseSummary]);

  const getPriorityColor = (priority) => {
    const colors = {
      'A': 'bg-red-100 text-red-800 border-red-200',
      'B': 'bg-orange-100 text-orange-800 border-orange-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      'waiting': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateWaitTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const created = new Date(timestamp);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else {
      return `${diffMins}m`;
    }
  };

  const getProcessTimeline = (caseType) => {
    const timelines = {
      'DVRO': {
        totalSteps: 8,
        estimatedDuration: '2-4 weeks',
        criticalSteps: ['File forms', 'Serve papers', 'Attend hearing'],
        description: 'Domestic Violence Restraining Order process'
      },
      'DIVORCE': {
        totalSteps: 12,
        estimatedDuration: '3-6 months',
        criticalSteps: ['File petition', 'Serve spouse', 'Financial disclosure', 'Final hearing'],
        description: 'Divorce proceedings'
      },
      'CIVIL': {
        totalSteps: 6,
        estimatedDuration: '1-3 months',
        criticalSteps: ['File complaint', 'Serve defendant', 'Discovery', 'Trial'],
        description: 'Civil case proceedings'
      }
    };
    
    return timelines[caseType] || {
      totalSteps: 5,
      estimatedDuration: '1-2 months',
      criticalSteps: ['File forms', 'Serve papers', 'Attend hearing'],
      description: 'General legal process'
    };
  };

  const getFormStatus = (forms) => {
    if (!forms || forms.length === 0) return { completed: 0, total: 0, status: 'No forms' };
    
    // This would be enhanced with actual form completion tracking
    const completed = Math.floor(forms.length * 0.3); // Simulated completion
    const total = forms.length;
    const status = completed === total ? 'Complete' : 
                  completed > 0 ? 'In Progress' : 'Not Started';
    
    return { completed, total, status };
  };

  if (!isOpen || !caseData) return null;

  const timeline = getProcessTimeline(caseData.case_type);
  const formStatus = getFormStatus(caseSummary?.forms_completed);
  const waitTime = calculateWaitTime(caseData.arrived_at || caseData.timestamp || caseData.created_at);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getPriorityColor(caseData.priority || caseData.priority_level)}`}>
              <span className="text-2xl font-bold">
                {caseData.queue_number}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {caseData.case_type || 'Legal Case'}
              </h2>
              <p className="text-gray-600">
                {timeline.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Case Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Case Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue #:</span>
                  <span className="font-medium">{caseData.queue_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseData.priority || caseData.priority_level)}`}>
                    {caseData.priority || caseData.priority_level || 'C'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                    {caseData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium uppercase">{caseData.language || 'EN'}</span>
                </div>
              </div>
            </div>

            {/* Wait Time & Progress */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Wait Time & Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wait Time:</span>
                  <span className="font-medium text-blue-600">{waitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forms Progress:</span>
                  <span className="font-medium">
                    {formStatus.completed}/{formStatus.total} ({formStatus.status})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Process Stage:</span>
                  <span className="font-medium">Initial Filing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Duration:</span>
                  <span className="font-medium">{timeline.estimatedDuration}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-2">
                {caseData.user_name && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{caseData.user_name}</span>
                  </div>
                )}
                {caseData.user_email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{caseData.user_email}</span>
                  </div>
                )}
                {caseData.phone_number && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{caseData.phone_number}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    Arrived: {new Date(caseData.arrived_at || caseData.timestamp || caseData.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Status */}
          {(caseSummary?.enhanced_summary?.forms_completed || caseSummary?.documents_needed) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Required Forms Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(caseSummary.enhanced_summary?.forms_completed || caseSummary.documents_needed || []).map((form, index) => {
                  const formCode = form.form_code || form;
                  const formTitle = form.title || form;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{formCode}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-xs text-gray-600">{formTitle}</p>
                      <div className="mt-2">
                        <span className="text-xs text-green-600 font-medium">Ready to file</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Process Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Process Timeline & Next Steps
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <div>
                    <p className="font-medium">File Required Forms</p>
                    <p className="text-sm text-gray-600">Complete and submit all necessary paperwork</p>
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Serve Papers</p>
                    <p className="text-sm text-gray-600">Serve the other party with legal documents</p>
                  </div>
                </div>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Attend Court Hearing</p>
                    <p className="text-sm text-gray-600">Present case before the judge</p>
                  </div>
                </div>
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Key Information */}
          {(caseSummary?.enhanced_summary?.key_answers || caseSummary?.conversation_summary) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Case Details & User Responses
              </h3>
              <div className="space-y-2">
                {caseSummary.enhanced_summary?.key_answers?.map((answer, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{answer}</span>
                  </div>
                ))}
                {caseSummary.conversation_summary && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Conversation Summary:</h4>
                    <p className="text-sm text-gray-700">{caseSummary.conversation_summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case Progress Tracker */}
          <CaseProgressTracker 
            caseData={caseData}
            caseSummary={caseSummary}
            language={language}
          />

          {/* Attorney Actions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attorney Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onCompleteCase(caseData.queue_number)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Case
              </button>
              
              <button
                onClick={() => onSendEmail(caseData)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Summary Email
              </button>
              
              <button
                onClick={fetchCaseSummary}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Details
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Print Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
