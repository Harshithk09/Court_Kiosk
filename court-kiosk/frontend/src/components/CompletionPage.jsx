import React, { useState } from 'react';
import { addToQueue } from '../utils/queueAPI';

const CompletionPage = ({ answers, history, flow, onBack, onHome }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [queueNumber, setQueueNumber] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate comprehensive summary
  const generateSummary = () => {
    const summary = {
      forms: [],
      steps: [],
      timeline: [],
      importantNotes: []
    };

    // Extract forms from visited nodes
    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        // Extract form numbers
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => {
            if (!summary.forms.includes(form)) {
              summary.forms.push(form);
            }
          });
        }
      }
    });

    // Generate detailed steps
    if (summary.forms.length > 0) {
      summary.steps.push('Fill out all required forms completely');
      summary.steps.push('Make 3 copies of each form (original + 2 copies)');
    }

    // Add filing steps
    if (history.some(nodeId => flow?.nodes?.[nodeId]?.text?.includes('File'))) {
      summary.steps.push('File your forms with the court clerk');
      summary.steps.push('Pay any required filing fees (DVRO filing is free)');
      summary.timeline.push('File forms as soon as possible');
    }

    // Add service steps
    if (history.some(nodeId => flow?.nodes?.[nodeId]?.text?.includes('Serve'))) {
      summary.steps.push('Serve the other party with your papers');
      summary.steps.push('Use a process server, sheriff, or someone 18+ (not you)');
      summary.steps.push('File proof of service with the court');
      summary.timeline.push('Serve papers before your court date');
      summary.importantNotes.push('The other party must be served for the order to be valid');
    }

    // Add hearing steps
    if (history.some(nodeId => flow?.nodes?.[nodeId]?.text?.includes('hearing'))) {
      summary.steps.push('Attend your court hearing on the scheduled date');
      summary.steps.push('Bring all evidence (photos, texts, emails, witnesses)');
      summary.steps.push('Dress appropriately for court');
      summary.timeline.push('Attend hearing on the date listed in your papers');
      summary.importantNotes.push('If you miss the hearing, your case may be dismissed');
    }

    // Add TRO specific notes
    if (history.some(nodeId => flow?.nodes?.[nodeId]?.text?.includes('Temporary'))) {
      summary.importantNotes.push('Keep a copy of your TRO with you at all times');
      summary.importantNotes.push('Police can enforce a CLETS restraining order');
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
      // Use environment-based API URL
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:1904';
      
      // Send case summary email using the new endpoint
      const response = await fetch(`${apiUrl}/api/email/send-case-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          case_data: {
            queue_number: queueNumber,
            case_type: 'DVRO',
            summary: generateSummary()
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Case summary email sent successfully!');
      } else {
        alert('Failed to send email: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = generateSummary();

  return (
    <div className="completion-page">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Case Summary</h1>
          
          {/* Summary Content */}
          <div className="space-y-6">
            {/* Forms Section */}
            {summary.forms.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Forms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {summary.forms.map((form, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                      {form}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps Section */}
            {summary.steps.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Next Steps</h2>
                <ol className="list-decimal list-inside space-y-2">
                  {summary.steps.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Timeline Section */}
            {summary.timeline.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Timeline</h2>
                <ul className="space-y-2">
                  {summary.timeline.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Notes Section */}
            {summary.importantNotes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notes</h2>
                <ul className="space-y-2">
                  {summary.importantNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-gray-700">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Options Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What would you like to do next?</h3>
            
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
