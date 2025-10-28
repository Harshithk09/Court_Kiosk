import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar,
  Timer,
  Target
} from 'lucide-react';

const CaseProgressTracker = ({ 
  caseData, 
  caseSummary, 
  language = 'en' 
}) => {
  const getProcessSteps = (caseType) => {
    const steps = {
      'DVRO': [
        {
          id: 'forms',
          title: 'Complete Forms',
          description: 'Fill out DV-100, DV-109, DV-110, and other required forms',
          estimatedTime: '30-60 minutes',
          status: 'completed'
        },
        {
          id: 'file',
          title: 'File with Court',
          description: 'Submit forms to clerk\'s office for processing',
          estimatedTime: '15-30 minutes',
          status: 'in_progress'
        },
        {
          id: 'serve',
          title: 'Serve Papers',
          description: 'Have papers served to the other party',
          estimatedTime: '1-3 days',
          status: 'pending'
        },
        {
          id: 'hearing',
          title: 'Court Hearing',
          description: 'Attend scheduled hearing before judge',
          estimatedTime: '1-2 hours',
          status: 'pending'
        },
        {
          id: 'order',
          title: 'Receive Order',
          description: 'Get final restraining order if granted',
          estimatedTime: 'Same day',
          status: 'pending'
        }
      ],
      'DIVORCE': [
        {
          id: 'petition',
          title: 'File Petition',
          description: 'Submit divorce petition to court',
          estimatedTime: '30-45 minutes',
          status: 'completed'
        },
        {
          id: 'serve_spouse',
          title: 'Serve Spouse',
          description: 'Serve divorce papers to spouse',
          estimatedTime: '1-7 days',
          status: 'in_progress'
        },
        {
          id: 'response',
          title: 'Wait for Response',
          description: 'Spouse has 30 days to respond',
          estimatedTime: '30 days',
          status: 'pending'
        },
        {
          id: 'discovery',
          title: 'Financial Discovery',
          description: 'Exchange financial information',
          estimatedTime: '2-4 weeks',
          status: 'pending'
        },
        {
          id: 'negotiation',
          title: 'Negotiate Settlement',
          description: 'Work out property and custody agreements',
          estimatedTime: '1-3 months',
          status: 'pending'
        },
        {
          id: 'final_hearing',
          title: 'Final Hearing',
          description: 'Attend final divorce hearing',
          estimatedTime: '1-2 hours',
          status: 'pending'
        }
      ]
    };
    
    return steps[caseType] || steps['DVRO'];
  };

  const getFormCompletionStatus = (forms) => {
    if (!forms || forms.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    // Simulate form completion based on case status
    const total = forms.length;
    let completed = 0;
    
    if (caseData.status === 'completed') {
      completed = total;
    } else if (caseData.status === 'in_progress') {
      completed = Math.floor(total * 0.6);
    } else {
      completed = Math.floor(total * 0.3);
    }
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  const getCurrentStep = (steps, caseStatus) => {
    if (caseStatus === 'completed') return steps.length - 1;
    if (caseStatus === 'in_progress') return 1;
    return 0;
  };

  const getStepStatus = (stepIndex, currentStep) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'in_progress';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const steps = getProcessSteps(caseData.case_type);
  const currentStep = getCurrentStep(steps, caseData.status);
  const formStatus = getFormCompletionStatus(caseSummary?.forms_completed);

  return (
    <div className="space-y-6">
      {/* Process Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Process Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{steps.length}</div>
            <div className="text-sm text-gray-600">Total Steps</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currentStep + 1}</div>
            <div className="text-sm text-gray-600">Current Step</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formStatus.percentage}%</div>
            <div className="text-sm text-gray-600">Forms Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {currentStep + 1} of {steps.length} completed
        </p>
      </div>

      {/* Step-by-Step Process */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Step-by-Step Process
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index, currentStep);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className={`flex items-start p-4 rounded-lg border ${getStatusColor(stepStatus)}`}>
                  <div className="flex-shrink-0 mr-4">
                    {getStatusIcon(stepStatus)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {step.title}
                      </h4>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Timer className="w-4 h-4 mr-1" />
                        {step.estimatedTime}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        stepStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        stepStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stepStatus === 'completed' ? 'Completed' :
                         stepStatus === 'in_progress' ? 'In Progress' :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Forms Status */}
      {caseSummary?.forms_completed && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Forms Completion Status
          </h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Forms Progress</span>
              <span>{formStatus.completed} of {formStatus.total} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${formStatus.percentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {caseSummary.forms_completed.map((form, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-sm">{form.form_code}</span>
                  <p className="text-xs text-gray-600">{form.title}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Estimate */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Timeline Estimate
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Current Stage</h4>
            <p className="text-sm text-gray-600">
              {steps[currentStep]?.title || 'Process Started'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estimated Completion</h4>
            <p className="text-sm text-gray-600">
              {caseData.case_type === 'DVRO' ? '2-4 weeks' :
               caseData.case_type === 'DIVORCE' ? '3-6 months' :
               '1-2 months'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseProgressTracker;
