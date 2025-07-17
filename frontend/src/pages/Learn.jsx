import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  HelpCircle, 
  Users, 
  Shield, 
  DollarSign, 
  Home,
  ArrowRight,
  Scale,
  Clock,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const faqs = [
  {
    topic: 'Divorce',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    route: '/qna/divorce',
    emoji: '💔',
    questions: [
      {
        q: 'What is a divorce?',
        a: 'A divorce (dissolution of marriage) legally ends your marriage or domestic partnership. It involves dividing property, determining custody of children, and establishing support arrangements.'
      },
      {
        q: 'Do I need a lawyer to file for divorce?',
        a: 'No, you can file for divorce on your own. This site helps you understand the process and forms. However, complex cases involving significant assets or custody disputes may benefit from legal counsel.'
      },
      {
        q: 'What if we have children?',
        a: 'You will need to address custody, visitation, and child support as part of your divorce. The court prioritizes the best interests of the children when making these decisions.'
      },
      {
        q: 'How long does a divorce take?',
        a: 'A divorce typically takes 6 months to 1 year to complete, but this can vary depending on the complexity of your case and whether you and your spouse agree on all issues.'
      }
    ]
  },
  {
    topic: 'Child Custody/Visitation',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    route: '/qna/custody',
    emoji: '👨‍👩‍👧‍👦',
    questions: [
      {
        q: 'What is custody vs. visitation?',
        a: 'Custody is who has legal and physical responsibility for a child. Visitation is the schedule for time spent with each parent. Legal custody involves decision-making, while physical custody involves where the child lives.'
      },
      {
        q: 'Can I change a custody order?',
        a: 'Yes, you can ask the court to modify an existing order if circumstances change significantly. You must show that the change is in the child\'s best interests.'
      },
      {
        q: 'What factors does the court consider?',
        a: 'The court considers the child\'s age, health, emotional ties to each parent, each parent\'s ability to care for the child, and any history of abuse or neglect.'
      }
    ]
  },
  {
    topic: 'Domestic Violence/Restraining Order',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    route: '/qna/restraining',
    emoji: '🛡️',
    questions: [
      {
        q: 'What is a restraining order?',
        a: 'A restraining order is a court order to protect someone from abuse, threats, or harassment. It can order the abuser to stay away, not contact you, and may include other protections.'
      },
      {
        q: 'How fast can I get protection?',
        a: 'You can ask for an emergency (temporary) order the same day you file. The court will hold a hearing within 21 days to decide whether to make it permanent.'
      },
      {
        q: 'What if I\'m in immediate danger?',
        a: 'If you are in immediate danger, call 911. You can also go to the courthouse to file for an emergency protective order, which can be granted immediately.'
      }
    ]
  },
  {
    topic: 'Child/Spousal Support',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
    route: '/qna/support',
    emoji: '��',
    questions: [
      {
        q: 'How is child support calculated?',
        a: 'Child support is based on state guidelines, considering income, time spent with the child, and other factors. The court uses a formula to determine the appropriate amount.'
      },
      {
        q: 'Can I change a support order?',
        a: 'Yes, you can ask the court to modify support if your situation changes significantly, such as a change in income, job loss, or changes in the child\'s needs.'
      },
      {
        q: 'What is spousal support?',
        a: 'Spousal support (alimony) is financial support paid by one spouse to the other after divorce. It is based on factors like length of marriage, income disparity, and earning capacity.'
      }
    ]
  }
];

const Learn = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (topic) => {
    setExpandedSections(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
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
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learn & FAQs
            </h1>
            <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
              Get answers to common questions about family court procedures and legal processes.
            </p>
          </div>
        </div>

        {/* Interactive Q&A Section */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interactive Q&A Tool</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Answer a few questions to get personalized guidance for your specific situation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqs.map((section) => (
              <button
                key={section.topic}
                onClick={() => navigate(section.route)}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {section.emoji}
                </div>
                <h3 className="text-lg font-bold text-gray-800">{section.topic}</h3>
                <p className="text-gray-600 text-sm mb-4">Get personalized guidance</p>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold group-hover:from-blue-600 to-blue-700 transition-all duration-300">
                  Start Q&A
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map(section => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.topic];
            
            return (
              <div key={section.topic} className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.topic)}
                  className="w-full p-8 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center mr-6 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">{section.topic}</h2>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-8 pb-8">
                    <div className="space-y-6">
                      {section.questions.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                          <div className="flex items-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 shadow-md">
                              <span className="text-white font-bold text-sm">Q</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-3 text-lg">{item.q}</div>
                              <div className="flex items-start">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0 shadow-md">
                                  <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <div className="text-gray-700 text-lg leading-relaxed">{item.a}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Q&A Button for each section */}
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => navigate(section.route)}
                        className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center mx-auto"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" /> Start {section.topic} Q&A
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 mt-12 text-white shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-blue-100 text-xl mb-8 leading-relaxed">
              If you have specific questions about your situation, try our interactive Q&A tool to get personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/qna/divorce')}
                className="group bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                Start Q&A Tool
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                Contact Court
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn; 