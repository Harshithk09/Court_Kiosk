import React, { useState } from 'react';
import { addToQueue } from '../utils/queueAPI';

const CompletionPage = ({ answers, history, flow, onBack, onHome }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
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

  const generateQueueNumber = () => {
    // Generate a queue number without adding to queue yet
    const newQueueNumber = `A${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    setQueueNumber(newQueueNumber);
  };

  const handleAddToQueue = async () => {
    if (!queueNumber) {
      alert('Please generate a queue number first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Add user to the queue system using the queue API
      const result = await addToQueue({
        queue_number: queueNumber, // Use the generated number
        case_type: 'Domestic Violence',
        priority: 'A',
        answers: answers,
        history: history,
        flow_data: flow,
        summary: generateSummary()
      });
      
      setIsInQueue(true);
      console.log('Added to queue:', result);
      alert(`Successfully added to queue! Your number ${queueNumber} is now active.`);
      
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Error adding to queue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRequest = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const summary = generateSummary();
      
      // Send email with queue number if available
      const emailData = {
        email,
        summary,
        answers,
        history,
        queue_number: queueNumber
      };
      
      // Here you would typically send the email through your backend
      console.log('Email request:', emailData);
      
      alert('Summary sent to your email!');
      
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = generateSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Flow
            </button>
            <h1 className="text-xl font-bold text-gray-900">Family Court Clinic</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onHome}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Process Complete</h2>
          
          {/* Summary Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Summary</h3>
            
            {summary.forms.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Required Forms:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {summary.forms.map((form, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm">
                      {form}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.steps.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Next Steps:</h4>
                <div className="space-y-2">
                  {summary.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.timeline.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Important Timeline:</h4>
                <div className="space-y-2">
                  {summary.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-4 h-4 bg-yellow-500 rounded-full mt-1"></div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.importantNotes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Important Notes:</h4>
                <div className="space-y-2">
                  {summary.importantNotes.map((note, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-4 h-4 bg-red-500 rounded-full mt-1"></div>
                      <p className="text-gray-700">{note}</p>
                    </div>
                  ))}
                </div>
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
                    {!queueNumber ? (
                      <button
                        onClick={generateQueueNumber}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Generate Queue Number
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-800 font-medium">Your queue number: <span className="text-2xl">{queueNumber}</span></p>
                          <p className="text-blue-700 text-sm mt-1">Click "Add to Queue" to join the line.</p>
                        </div>
                        
                        {!isInQueue ? (
                          <button
                            onClick={handleAddToQueue}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Adding to Queue...' : 'Add to Queue'}
                          </button>
                        ) : (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-800 font-medium">✓ Added to Queue!</p>
                            <p className="text-green-700 text-sm mt-1">Please wait in the waiting area. You'll be called when it's your turn.</p>
                          </div>
                        )}
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
                    Both - Get in line AND receive email summary
                  </label>
                </div>
                <p className="text-gray-600 ml-7">
                  Join the queue and also receive a detailed summary by email.
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
                    
                    {!queueNumber ? (
                      <button
                        onClick={generateQueueNumber}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Generate Queue Number
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-800 font-medium">Your queue number: <span className="text-2xl">{queueNumber}</span></p>
                          <p className="text-blue-700 text-sm mt-1">Click "Add to Queue & Send Email" to complete both actions.</p>
                        </div>
                        
                        {!isInQueue ? (
                          <button
                            onClick={async () => {
                              await handleAddToQueue();
                              await handleEmailRequest();
                            }}
                            disabled={!email || isSubmitting}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Processing...' : 'Add to Queue & Send Email'}
                          </button>
                        ) : (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-800 font-medium">✓ Added to Queue & Email Sent!</p>
                            <p className="text-green-700 text-sm mt-1">Please wait in the waiting area. You'll be called when it's your turn.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Flow
              </button>
              <button
                onClick={onHome}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
