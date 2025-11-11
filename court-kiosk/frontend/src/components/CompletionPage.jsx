import React, { useState } from 'react';
import { addToQueue } from '../utils/queueAPI';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const CompletionPage = ({ answers, history, flow, adminData, onBack, onHome }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [queueNumber, setQueueNumber] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate enhanced user-friendly summary
  const generateSummary = () => {
    const summary = {
      header: {
        case_type: 'DVRO',
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: 'San Mateo County Superior Court Kiosk',
        session_id: `K${Math.floor(Math.random() * 90000) + 10000}`
      },
      forms: [],
      keyAnswers: [],
      nextSteps: [],
      resources: {
        court_info: {
          name: 'San Mateo County Superior Court',
          address: '400 County Center, Redwood City, CA 94063',
          phone: '(650) 261-5100',
          hours: 'Monday-Friday, 8:00 AM - 4:00 PM'
        },
        self_help_center: {
          phone: '(650) 261-5100 ext. 2',
          hours: 'Monday-Friday, 8:30 AM - 12:00 PM',
          location: 'Room 101, First Floor'
        },
        legal_aid: {
          phone: '(650) 558-0915',
          name: 'Legal Aid Society of San Mateo County'
        },
        emergency: {
          phone: '911',
          text: 'For immediate danger, call 911'
        }
      }
    };

    // Extract forms from visited nodes with descriptions
    const formDescriptions = {
      'DV-100': 'Request for Domestic Violence Restraining Order',
      'DV-105': 'Request for Child Custody and Visitation',
      'DV-109': 'Notice of Court Hearing',
      'DV-110': 'Temporary Restraining Order',
      'DV-200': 'Proof of Service',
      'DV-140': 'Child Custody and Visitation Order',
      'DV-108': 'Request for Child Abduction Prevention',
      'DV-145': 'Child Abduction Prevention Order',
      'DV-800': 'Firearms Restraining Order',
      'FL-150': 'Income and Expense Declaration',
      'CLETS-001': 'CLETS Information Form'
    };

    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => {
            if (!summary.forms.find(f => f.form_code === form)) {
              summary.forms.push({
                form_code: form,
                title: formDescriptions[form] || `${form} Form`,
                description: 'Required for your case type'
              });
            }
          });
        }
      }
    });

    // Generate key answers based on user responses
    if (answers.DVCheck1 === 'Yes') {
      summary.keyAnswers.push('You requested a domestic violence restraining order');
    }
    if (answers.children === 'yes') {
      summary.keyAnswers.push('You indicated you share a child with the respondent');
    }
    if (answers.support && answers.support !== 'none') {
      const supportType = answers.support.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      summary.keyAnswers.push(`You requested ${supportType} support`);
    }
    if (answers.firearms === 'yes') {
      summary.keyAnswers.push('You indicated firearms are involved in your case');
    }
    if (answers.abduction_check === 'yes') {
      summary.keyAnswers.push('You requested child abduction prevention measures');
    }

    // Generate enhanced next steps
    summary.nextSteps = [
      {
        action: "Take these forms to the Clerk's Office (Room 101)",
        priority: "high",
        timeline: "Today or as soon as possible",
        details: "Bring your photo ID and this summary"
      },
      {
        action: "The clerk will schedule a hearing within 3 days",
        priority: "high",
        timeline: "Within 3 business days",
        details: "You'll receive notice of your court date"
      },
      {
        action: "Serve the other party with your papers",
        priority: "high",
        timeline: "Before your court hearing",
        details: "Use a process server, sheriff, or someone 18+ (not you)"
      },
      {
        action: "File proof of service with the court",
        priority: "high",
        timeline: "After serving papers",
        details: "Required for your case to proceed"
      },
      {
        action: "Attend your court hearing",
        priority: "critical",
        timeline: "On the date listed in your papers",
        details: "Bring all evidence (photos, texts, emails, witnesses)"
      }
    ];

    // Add specific steps based on answers
    if (answers.children === 'yes') {
      summary.nextSteps.push({
        action: "Prepare child custody and visitation information",
        priority: "medium",
        timeline: "Before your hearing",
        details: "Gather school records, medical records, and any relevant documentation"
      });
    }

    if (answers.support && answers.support !== 'none') {
      summary.nextSteps.push({
        action: "Gather income and expense documentation",
        priority: "medium",
        timeline: "Before your hearing",
        details: "Pay stubs, tax returns, bank statements, bills"
      });
    }

    return summary;
  };

  const handleAddToQueue = async () => {
    setIsSubmitting(true);
    try {
      // Use the queueAPI utility for better integration
      const data = await addToQueue({
        case_type: 'DVRO',
        user_name: 'Anonymous', // Could be passed from props
        user_email: email || null,
        phone_number: phoneNumber || null,
        language: 'en', // Could be passed from props
        answers: answers,
        history: history,
        summary: generateSummary()
      });
      
      if (data.success) {
        setQueueNumber(data.queue_number);
        setIsInQueue(true);
        console.log('Added to queue:', data);
      } else {
        console.error('Failed to add to queue:', data);
        alert('Failed to add to queue. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Error adding to queue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRequest = async () => {
    setIsSubmitting(true);
    try {
      const summary = generateSummary();
      
      console.log('📧 Sending email request...');
      
      // ===== FIXED: Send data in correct format =====
      const emailPayload = {
          email: email,
          case_data: {
          user_email: email,
          user_name: 'Court Kiosk User',
            case_type: 'DVRO',
          priority_level: 'A',
          language: 'en',
          queue_number: queueNumber || 'N/A',
          phone_number: phoneNumber || null,
          location: 'San Mateo County Superior Court Kiosk',
          session_id: summary.header.session_id,
          
          // CRITICAL: Send at root level, not nested
          forms_completed: summary.forms || [],
          documents_needed: summary.forms || [],
          next_steps: summary.nextSteps || [],
          nextSteps: summary.nextSteps || [],
          
          // Also send full summary
          summary_json: JSON.stringify(summary),
          conversation_summary: summary,
          
          // Admin data for staff assistance
          admin_data: adminData || null
        }
      };
      
      console.log('📧 Sending:', emailPayload);
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SEND_CASE_SUMMARY_EMAIL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Case summary email sent successfully! Check your inbox.');
      } else {
        alert('❌ Failed to send email: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error sending email: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = generateSummary();

  return (
    <div className="completion-page">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Case Summary</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Case Type:</span> {summary.header.case_type}
                        </div>
              <div>
                <span className="font-medium">Date:</span> {summary.header.date}
                        </div>
              <div>
                <span className="font-medium">Session ID:</span> {summary.header.session_id}
              </div>
              <div>
                <span className="font-medium">Location:</span> {summary.header.location}
              </div>
            </div>
          </div>
          
          {/* Summary Content */}
          <div className="space-y-6">
            {/* Key Answers Section */}
            {summary.keyAnswers.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">📝</span>
                  Your Information
                </h2>
                <ul className="space-y-2">
                  {summary.keyAnswers.map((answer, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{answer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Forms Section */}
            {summary.forms.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">📋</span>
                  Forms Completed
                </h2>
                <div className="space-y-2">
                  {summary.forms.map((form, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="font-medium text-blue-900">{form.form_code}</div>
                      <div className="text-sm text-blue-700">{form.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Section */}
            {summary.nextSteps.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-500 mr-2">✔</span>
                  Next Steps
                </h2>
                <div className="space-y-4">
                  {summary.nextSteps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{step.action}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          step.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          step.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {step.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Timeline:</span> {step.timeline}
                      </div>
                      <div className="text-sm text-gray-700">{step.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
              <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-purple-500 mr-2">📞</span>
                Resources & Help
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Court Information</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>{summary.resources.court_info.name}</div>
                    <div>{summary.resources.court_info.address}</div>
                    <div>Phone: {summary.resources.court_info.phone}</div>
                    <div>Hours: {summary.resources.court_info.hours}</div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Self-Help Center</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>Phone: {summary.resources.self_help_center.phone}</div>
                    <div>Hours: {summary.resources.self_help_center.hours}</div>
                    <div>Location: {summary.resources.self_help_center.location}</div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Legal Aid</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>{summary.resources.legal_aid.name}</div>
                    <div>Phone: {summary.resources.legal_aid.phone}</div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">Emergency</h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>Phone: {summary.resources.emergency.phone}</div>
                    <div>{summary.resources.emergency.text}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Disclaimer:</span> This summary is for informational purposes only and does not constitute legal advice. Please consult with an attorney for legal guidance.
              </p>
              </div>
          </div>

          {/* Options Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What would you like to do next?</h3>
                {/* Packet downloads and official how-to links (conditional by case type) */}
                {summary?.header?.case_type?.toLowerCase?.().includes('violence') && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href="/api/documents/dvro-packet-91624.pdf"
                      className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Download DVRO Packet (PDF)
                    </a>
                    <a
                      href="https://selfhelp.courts.ca.gov/DV-restraining-order/fill-forms?utm_source=chatgpt.com"
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                      target="_blank" rel="noopener noreferrer"
                    >
                      How to Fill DVRO Forms (Official Guide)
                    </a>
                  </div>
                )}
                {summary?.header?.case_type?.toLowerCase?.().includes('divorce') && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                      href="/api/documents/dissopacket.pdf"
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Download Divorce Packet (PDF)
                    </a>
                    <a
                      href="https://selfhelp.courts.ca.gov/divorce?utm_source=chatgpt.com"
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                      target="_blank" rel="noopener noreferrer"
                    >
                      FL-107-INFO: Legal Steps for Divorce (Official Guide)
                    </a>
                  </div>
                )}
            
            <div className="space-y-4">
              {/* Queue Option */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="radio"
                    id="queue"
                    name="option"
                    value="queue"
                    checked={selectedOption === 'queue'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="queue" className="text-lg font-medium text-gray-900">
                    Get in line to speak with an advisor
                  </label>
                </div>
                <p className="text-gray-600 ml-7">
                  Join the queue to speak with a court advisor about your case. You'll receive a number and be called when it's your turn.
                </p>
                {selectedOption === 'queue' && (
                  <div className="mt-4 ml-7 space-y-3">
                    {!isInQueue ? (
                      <div className="space-y-3">
                        {/* Phone Number Input */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (for SMS notifications)
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            We'll text you your queue number so you don't forget it
                          </p>
                        </div>
                        
                        <button
                          onClick={handleAddToQueue}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Adding to Queue...' : 'Add to Queue'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-800 font-medium">Your queue number: <span className="text-2xl">{queueNumber}</span></p>
                          <p className="text-blue-700 text-sm mt-1">You have been added to the queue.</p>
                          {phoneNumber && (
                            <p className="text-blue-700 text-sm mt-1">✓ Queue number sent to your phone</p>
                          )}
                        </div>
                        
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 font-medium">✓ Added to Queue!</p>
                          <p className="text-green-700 text-sm mt-1">Please wait in the waiting area. You'll be called when it's your turn.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Email Option */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="radio"
                    id="email"
                    name="option"
                    value="email"
                    checked={selectedOption === 'email'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="email" className="text-lg font-medium text-gray-900">
                    Get a detailed summary by email
                  </label>
                </div>
                <p className="text-gray-600 ml-7">
                  Receive a comprehensive summary of your case and next steps via email.
                </p>
                {selectedOption === 'email' && (
                  <div className="mt-4 ml-7">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleEmailRequest}
                      disabled={!email || isSubmitting}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Summary'}
                    </button>
                  </div>
                )}
              </div>

              {/* Both Option */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="radio"
                    id="both"
                    name="option"
                    value="both"
                    checked={selectedOption === 'both'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="both" className="text-lg font-medium text-gray-900">
                    Both - Join queue and get email summary
                  </label>
                </div>
                <p className="text-gray-600 ml-7">
                  Get the best of both worlds - join the queue and receive a detailed email summary.
                </p>
                {selectedOption === 'both' && (
                  <div className="mt-4 ml-7 space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number (optional, for SMS notifications)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={async () => {
                        await handleAddToQueue();
                        if (email) {
                          await handleEmailRequest();
                        }
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Add to Queue & Send Email'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={onHome}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
