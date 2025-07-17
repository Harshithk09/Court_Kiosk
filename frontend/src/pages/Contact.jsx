import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  Home,
  ArrowRight,
  Scale,
  Users,
  MessageSquare
} from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: '400 County Center, Redwood City, CA 94063',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '(650) 261-5080',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'selfhelp@sanmateocourt.org',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: 'Monday - Friday: 8:00 AM - 4:00 PM',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')} 
              className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </button>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact the Court
            </h1>
            <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
              Get in touch with our Family Court Self-Help Center for assistance with your case.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                Family Court Self-Help Center
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                      <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mr-6 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{info.title}</h3>
                        <p className="text-gray-600 text-lg">{info.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-2xl">Self-Help Services</h3>
              </div>
              <div className="space-y-4 text-blue-100">
                <p className="text-lg leading-relaxed">
                  Our Family Court Facilitator provides assistance with:
                </p>
                <ul className="space-y-2 text-lg">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Form completion and filing
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Court procedure guidance
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Referrals to legal resources
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Mediation services
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-blue-700 mb-8 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              Send Us a Message
            </h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Message Sent!</h3>
                <p className="text-green-700 text-lg leading-relaxed">
                  Thank you for contacting us. We'll get back to you within 2-3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-md" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-md" 
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">Subject</label>
                  <select 
                    name="subject" 
                    value={form.subject} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-md"
                  >
                    <option value="">Select a subject</option>
                    <option value="divorce">Divorce Questions</option>
                    <option value="custody">Child Custody</option>
                    <option value="support">Child/Spousal Support</option>
                    <option value="restraining">Restraining Order</option>
                    <option value="forms">Form Assistance</option>
                    <option value="general">General Information</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-3 text-lg">Message</label>
                  <textarea 
                    name="message" 
                    value={form.message} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg shadow-md resize-none" 
                    rows={6}
                    placeholder="Please describe your question or concern..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  <Send className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-10 mt-12 text-white shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ArrowRight className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-purple-100 text-xl mb-8 leading-relaxed">
              Try our interactive Q&A tool to get personalized guidance for your specific situation.
            </p>
            <button
              onClick={() => navigate('/qna/divorce')}
              className="group bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center mx-auto"
            >
              Start Q&A Tool
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 