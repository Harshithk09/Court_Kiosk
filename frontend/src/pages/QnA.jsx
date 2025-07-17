import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topics } from '../data/flows';

const QnA = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topic = topics[topicId];

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{topic.title} Q&A</h1>
        <p className="text-lg text-gray-700 mb-8">Interactive Q&A coming soon for this topic.</p>
        <button
          onClick={() => navigate('/learn')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Learn Page
        </button>
      </div>
    </div>
  );
};

export default QnA; 