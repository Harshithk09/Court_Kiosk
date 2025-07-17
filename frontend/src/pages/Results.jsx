import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocationContext } from '../contexts/LocationContext';
import { getFormsForTopic, getNextStepsForTopic } from '../data/flows';
import { 
  FileText, 
  Mail, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Users,
  ChevronLeft,
  Home,
  ExternalLink,
  Phone,
  MapPin,
  Printer,
  ArrowRight,
  Scale,
  Star
} from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLocation, isKioskMode } = useContext(LocationContext);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  const { topic, answers, topicTitle } = location.state || {};

  useEffect(() => {
    if (!topic || !answers) {
      navigate('/');
    }
  }, [topic, answers, navigate]);

  // Get forms and steps from unified data model
  const forms = getFormsForTopic(topic, answers);
  const nextSteps = getNextStepsForTopic(topic, answers);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          topic,
          answers,
          forms,
          nextSteps,
          location: currentLocation
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEmailSent(true);
        setShowEmailForm(false);
      } else {
        throw new Error(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          answers,
          forms,
          nextSteps,
          location: currentLocation
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `court-forms-${topic}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!topic || !answers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6">No Results Available</h2>
          <p className="text-gray-600 mb-8 text-xl leading-relaxed">Unable to generate recommendations based on your answers.</p>
          <button
            onClick={() => navigate('/')} 
            className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center mx-auto"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
              <button
                onClick={() => navigate('/')} 
                className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              <button
                onClick={() => navigate('/')} 
                className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Home
              </button>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Personalized Results
              </h1>
              <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
                Based on your answers, here are the forms and steps you need to take.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Forms Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Required Forms
              </h2>
              <div className="space-y-6">
                {forms.map((form, index) => (
                  <div key={form.number} className="border-2 border-gray-200 rounded-2xl p-6 flex items-start gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-2 text-xl">
                        {form.number} - {form.name}
                      </h3>
                      <p className="text-gray-600 text-lg mb-3 leading-relaxed">
                        {form.description}
                      </p>
                      {form.required && (
                        <span className="inline-block bg-gradient-to-r from-red-100 to-pink-100 text-red-800 text-sm px-3 py-1 rounded-full font-bold border border-red-200">
                          Required
                        </span>
                      )}
                      <button className="text-blue-600 hover:text-blue-800 text-base font-semibold flex items-center mt-3 group-hover:translate-x-1 transition-transform">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Download Form
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 space-y-4">
                <button
                  onClick={handleDownloadPDF}
                  className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Download All Forms (PDF)
                </button>
                <button
                  onClick={handlePrint}
                  className="group w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Printer className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Print Results
                </button>
                {!emailSent && (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="group w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Mail className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Email Forms to Me
                  </button>
                )}
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-10">
              {/* Next Steps */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  Next Steps
                </h2>
                <div className="space-y-6">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start group">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mr-6 mt-1 shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed pt-2">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Court Information */}
              {currentLocation && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
                  <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    Court Information
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="font-bold text-gray-800 text-xl mb-2">{currentLocation.name}</h3>
                      <p className="text-gray-600 text-lg">{currentLocation.address}</p>
                    </div>
                    <div className="flex items-center text-gray-600 text-lg bg-white rounded-2xl p-4 shadow-md">
                      <Phone className="w-6 h-6 mr-3 text-blue-600" />
                      {currentLocation.phone}
                    </div>
                    <div className="flex items-center text-gray-600 text-lg bg-white rounded-2xl p-4 shadow-md">
                      <Clock className="w-6 h-6 mr-3 text-blue-600" />
                      {currentLocation.hours}
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                      <div className="flex items-center mb-3">
                        <Scale className="w-6 h-6 mr-3" />
                        <h4 className="font-bold text-xl">Family Court Facilitator</h4>
                      </div>
                      <p className="text-blue-100 text-lg leading-relaxed">
                        {currentLocation.facilitatorRoom}<br />
                        Available for form completion assistance
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              {showEmailForm && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
                  <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    Email Your Forms
                  </h3>
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-md"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        {isLoading ? 'Sending...' : 'Send Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Email Sent Confirmation */}
              {emailSent && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-800 text-xl mb-2">Email Sent!</h3>
                      <p className="text-green-700 text-lg">
                        Your form packet has been sent to <span className="font-semibold">{email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-10 mt-12">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 mb-4 text-2xl">Important Disclaimer</h3>
                <p className="text-amber-700 text-lg leading-relaxed">
                  This information is provided for general guidance only and does not constitute legal advice. 
                  Court procedures may vary. For specific legal questions, consult with an attorney or visit 
                  the Family Court Facilitator's office. Filing fees and requirements may change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
