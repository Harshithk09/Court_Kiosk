import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topics, getFormsForTopic, getNextStepsForTopic } from '../data/flows';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle,
  Phone,
  Home,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Info,
  ExternalLink
} from 'lucide-react';

const QnA = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = topics[topicId];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Topic not found</h1>
          <button
            onClick={() => navigate('/learn')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Learn Page
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = topic.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === topic.questions.length - 1;
  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigate('/learn');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Shield,
      Users,
      DollarSign,
      FileText,
      Phone,
      Clock,
      Info,
      Calendar,
      ExternalLink
    };
    return icons[iconName] || Shield;
  };

  const Icon = getIconComponent(topic.icon);

  if (showResults) {
    const forms = getFormsForTopic(topicId, answers);
    const nextSteps = getNextStepsForTopic(topicId, answers);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={resetQuiz}
                className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Start Over
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Back to Learn
              </button>
            </div>
            <div className="text-center">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
                <Icon className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your {topic.title} Results
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Based on your answers, here's what you need to know and the forms you'll need.
              </p>
            </div>
          </div>

          {/* Emergency Warning for Domestic Violence */}
          {/* {topicId === 'restraining' && (
            <div className="bg-red-600-white p-8 rounded-3xl mb-10 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-2xl font-semibold">⚠️ Emergency Resources</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Immediate Help:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <strong>Call 911</strong> if you're in immediate danger
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Go to your local police station for emergency protection
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      National Domestic Violence Hotline: 1-800-799-7233
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">San Mateo County Resources:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      San Mateo County Domestic Violence Hotline: 1-800-300-1080
                    </li>
                    <li className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <a href="https://www.sanmateocourt.org/self_help" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        Court Self-Help Center
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )} */}

          {/* Required Forms */}
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Required Forms
            </h2>
            <div className="space-y-4">
              {forms.map((form, index) => (
                <div key={index} className="border border-gray-200 p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {form.number}
                        </span>
                        {form.required && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{form.name}</h3>
                      <p className="text-gray-600">{form.description}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-4 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <ArrowRight className="w-8 h-8" />
              Next Steps
            </h2>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-white/20">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-blue-100 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={() => navigate('/forms')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3">
              <FileText className="w-5 h-5" />
              Browse All Forms
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3">
              <Phone className="w-5 h-5" />
              Get Help
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goBack}
              className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {currentQuestionIndex === 0 ? 'Back to Learn' : 'Previous Question'}
            </button>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {topic.questions.length}
            </div>
          </div>
          <div className="text-center">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
              <Icon className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {topic.title} Q&A
            </h1>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              Answer a few questions to get personalized guidance for your case.
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h2>
            {currentQuestion.subtitle && (
              <p className="text-lg mb-6">{currentQuestion.subtitle}</p>
            )}
            {currentQuestion.urgent && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800 font-semibold">This is an urgent matter. If you're in immediate danger, call 911.</span>
                </div>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-blue-600 text-white">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.label}</h3>
                    <p className="text-gray-600">{option.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentQuestionIndex + 1) / topic.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / topic.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnA; 