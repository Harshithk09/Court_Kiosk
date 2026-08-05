import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { getLocalFormUrl, getOfficialFormUrl } from '../utils/formUtils';
import { FileText, ExternalLink, Eye } from 'lucide-react';
import { STAGE_ICONS } from '../data/stageIcons';

const CompletionPage = lazy(() => import('./CompletionPage'));
const AdminQuestionsPage = lazy(() => import('./AdminQuestionsPage'));

const FORM_CODE_RE = /\b(?:[A-Z]{2,3}-\d{3,4}|CLETS-001|SER-001|POS-040)\b/g;

const CHAIN_MAX_LENGTH = 8;
const CHAIN_MIN_LENGTH = 3;

// Renders node text with any form codes (DV-100, SER-001, ...) pulled out as
// inline badges. Uses matchAll (not FORM_CODE_RE.exec in a loop) because
// FORM_CODE_RE is a shared module-level /g regex also used by sidebarForms —
// matchAll clones it internally, so this can't corrupt that other consumer's
// lastIndex.
const renderTextWithFormBadges = (text) => {
  if (!text) return text;
  const matches = Array.from(text.matchAll(FORM_CODE_RE));
  if (matches.length === 0) return text;

  const parts = [];
  let cursor = 0;
  matches.forEach((match, i) => {
    const start = match.index;
    const end = start + match[0].length;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <span
        key={`badge-${i}-${match[0]}`}
        className="inline-block px-1.5 py-0.5 mx-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[0.85em] font-semibold align-baseline"
      >
        {match[0]}
      </span>
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
};

const SimpleFlowRunner = ({ flow, onFinish, onBack, onHome, onRoute, roadmapStages }) => {
  const [currentNodeId, setCurrentNodeId] = useState(flow?.start || 'DVROStart');
  const [history, setHistory] = useState([flow?.start || 'DVROStart']);
  const [screenBoundaries, setScreenBoundaries] = useState([1]);
  const [showSummary, setShowSummary] = useState(false);
  const [showAdminQuestions, setShowAdminQuestions] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const progressScrollRef = useRef(null);

  const currentNode = flow?.nodes?.[currentNodeId];

  // from-node-id -> outgoing edges lookup, built once per flow/edges change.
  const edgesByFrom = useMemo(() => {
    const map = new Map();
    (flow?.edges || []).forEach(edge => {
      if (!map.has(edge.from)) map.set(edge.from, []);
      map.get(edge.from).push(edge);
    });
    return map;
  }, [flow?.edges]);

  const outgoingEdges = useMemo(
    () => edgesByFrom.get(currentNodeId) || [],
    [edgesByFrom, currentNodeId]
  );

  // Detect a run of forced single-path "Continue" nodes starting at currentNodeId,
  // so it can be shown as one checklist screen instead of one click per node.
  const chainScreen = useMemo(() => {
    const isChainStopper = (node) => (
      !node || node.type === 'decision' || node.type === 'end' ||
      node.type === 'terminal' || !!node.routeTarget
    );

    if (isChainStopper(flow?.nodes?.[currentNodeId])) return null;

    const chainNodeIds = [currentNodeId];
    let cursor = currentNodeId;
    while (chainNodeIds.length < CHAIN_MAX_LENGTH) {
      const edges = edgesByFrom.get(cursor) || [];
      if (edges.length !== 1) break;
      const nextId = edges[0].to;
      if (isChainStopper(flow?.nodes?.[nextId])) break;
      // Only absorb the candidate if IT also has exactly one path forward —
      // some nodes are real forks (multiple outgoing edges) without being
      // tagged type: 'decision' in the data, so type alone isn't reliable.
      const nextEdges = edgesByFrom.get(nextId) || [];
      if (nextEdges.length !== 1) break;
      chainNodeIds.push(nextId);
      cursor = nextId;
    }

    if (chainNodeIds.length < CHAIN_MIN_LENGTH) return null;

    const lastEdges = edgesByFrom.get(chainNodeIds[chainNodeIds.length - 1]) || [];
    if (lastEdges.length !== 1) return null;

    return { chainNodeIds, landingNodeId: lastEdges[0].to };
  }, [flow?.nodes, edgesByFrom, currentNodeId]);

  // Check if current node has a routeTarget and handle navigation
  useEffect(() => {
    if (currentNode?.routeTarget && onRoute) {
      // Small delay to show the message, then navigate
      const timer = setTimeout(() => {
        onRoute(currentNode.routeTarget, currentNodeId);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentNodeId, currentNode, onRoute]);

  // Debug logging removed for production

  const handleNext = (nextNodeId) => {
    const newHistory = [...history, nextNodeId];
    setHistory(newHistory);
    setScreenBoundaries(prev => [...prev, newHistory.length]);
    setCurrentNodeId(nextNodeId);
  };

  // Commits a whole collapsed checklist screen at once: every chain node after
  // the already-current one, plus the node the chain lands on, in a single
  // history/boundary update — so "Back" undoes the whole screen, not one node.
  const handleChainContinue = (chainTailIds, landingNodeId) => {
    const newHistory = [...history, ...chainTailIds, landingNodeId];
    setHistory(newHistory);
    setScreenBoundaries(prev => [...prev, newHistory.length]);
    setCurrentNodeId(landingNodeId);
  };

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (progressScrollRef.current) {
      // Find the current step element
      const currentStepElement = progressScrollRef.current.querySelector('.progress-step.current');
      if (currentStepElement) {
        // Scroll only within the sidebar container
        const container = progressScrollRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentStepElement.getBoundingClientRect();
        
        // Calculate if element is outside the visible area
        const isAbove = elementRect.top < containerRect.top;
        const isBelow = elementRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          // Scroll the container, not the whole page
          const scrollTop = currentStepElement.offsetTop - container.offsetTop - (container.clientHeight / 2) + (currentStepElement.clientHeight / 2);
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
    
    // Cleanup function to prevent memory leaks
    return undefined;
  }, [currentNodeId, history]);

  const handleBack = () => {
    if (screenBoundaries.length > 1) {
      const newBoundaries = screenBoundaries.slice(0, -1);
      const targetLength = newBoundaries[newBoundaries.length - 1];
      const newHistory = history.slice(0, targetLength);
      setScreenBoundaries(newBoundaries);
      setHistory(newHistory);
      setCurrentNodeId(newHistory[newHistory.length - 1]);
    } else {
      onBack?.();
    }
  };

  // Removed unused handleAnswer function

  const handleChoice = (edgeIndex) => {
    const edge = outgoingEdges[edgeIndex];
    if (edge) {
      handleNext(edge.to);
    }
  };

  const handleHistoryClick = (nodeId) => {
    const nodeIndex = history.indexOf(nodeId);
    if (nodeIndex !== -1) {
      const newHistory = history.slice(0, nodeIndex + 1);
      setHistory(newHistory);
      setCurrentNodeId(nodeId);
      // A manual jump can land mid-chain (a node that was never its own screen),
      // so re-anchor screenBoundaries to the click target instead of leaving
      // stale boundaries past the new (shorter) history around for handleBack.
      setScreenBoundaries(prev => {
        const kept = prev.filter(b => b <= newHistory.length);
        if (kept[kept.length - 1] !== newHistory.length) kept.push(newHistory.length);
        return kept;
      });
    }
  };

  const allSteps = history;

  const handleComplete = () => {
    setShowAdminQuestions(true);
  };

  const handleAdminQuestionsBack = () => {
    setShowAdminQuestions(false);
  };

  const handleAdminQuestionsComplete = (data) => {
    setAdminData(data);
    setShowAdminQuestions(false);
    setShowSummary(true);
  };

  const handleSummaryBack = () => {
    setShowSummary(false);
    setShowAdminQuestions(true);
  };

  // Extract form codes from history once per history/flow change
  const sidebarForms = useMemo(() => {
    const forms = new Set();
    history.forEach(nodeId => {
      const text = flow?.nodes?.[nodeId]?.text;
      if (!text) return;
      const matches = text.match(FORM_CODE_RE);
      if (matches) matches.forEach(form => forms.add(form));
    });
    return Array.from(forms).sort();
  }, [history, flow?.nodes]);

  const pageFallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (showAdminQuestions) {
    return (
      <Suspense fallback={pageFallback}>
        <AdminQuestionsPage
          history={history}
          flow={flow}
          onBack={handleAdminQuestionsBack}
          onComplete={handleAdminQuestionsComplete}
          onHome={onHome}
        />
      </Suspense>
    );
  }

  if (showSummary) {
    return (
      <Suspense fallback={pageFallback}>
        <CompletionPage
          answers={{}}
          history={history}
          flow={flow}
          adminData={adminData}
          onBack={handleSummaryBack}
          onHome={onHome}
        />
      </Suspense>
    );
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Node not found: {currentNodeId}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isEndNode = currentNode.type === 'end' || currentNode.type === 'terminal';
  // Removed unused isDecisionNode variable
  const hasMultipleChoices = outgoingEdges.length > 1;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
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
              <div className="text-sm text-gray-600">
                Step {screenBoundaries.length}
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Progress Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {roadmapStages ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Path</h3>
                  <div className="space-y-1">
                    {roadmapStages.map((stage) => {
                      const isCurrent = stage.nodeIds?.includes(currentNodeId);
                      const Icon = STAGE_ICONS[stage.icon] || FileText;
                      return (
                        <div
                          key={stage.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg ${
                            isCurrent ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${isCurrent ? 'font-semibold text-blue-900' : 'text-gray-600'}`}>
                            {stage.label?.en || stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>

                  <div ref={progressScrollRef} className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg overflow-hidden">
                    {allSteps.map((nodeId, index) => {
                      const node = flow?.nodes?.[nodeId];
                      const isCurrent = nodeId === currentNodeId;
                      const isClickable = index < history.length - 1; // Can't click current node
                      const isLast = index === allSteps.length - 1;

                      return (
                        <div
                          key={nodeId}
                          className={`p-6 cursor-pointer transition-all duration-200 progress-step ${
                            isCurrent
                              ? 'bg-blue-100 text-blue-900 current shadow-md border-l-4 border-blue-500'
                              : isClickable
                                ? 'bg-white hover:bg-blue-50 hover:shadow-sm border-l-4 border-transparent hover:border-blue-300'
                                : 'bg-gray-50 border-l-4 border-gray-300'
                          } ${!isLast ? 'border-b border-gray-200' : ''}`}
                          onClick={isClickable ? () => handleHistoryClick(nodeId) : undefined}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-lg'
                                : isClickable
                                  ? 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-400'
                                  : 'bg-gray-300 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-base leading-relaxed ${
                                isCurrent ? 'font-semibold' : isClickable ? 'font-medium' : 'font-normal'
                              }`}>
                                {node?.text?.substring(0, 60)}...
                              </p>
                              {isClickable && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Tap to go back
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span>{history.length} steps</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Node Content */}
              {!chainScreen && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {renderTextWithFormBadges(currentNode.text)}
                  </h2>
                </div>
              )}

              {/* Navigation Options */}
              {!isEndNode && (
                <div className="space-y-6">
                  {chainScreen ? (
                    // Forced-continue chain: show every node's text as one checklist
                    // instead of one full-screen click per node.
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Complete these steps
                      </h2>
                      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                        {chainScreen.chainNodeIds.map((nodeId, index) => {
                          const node = flow?.nodes?.[nodeId];
                          const isLast = index === chainScreen.chainNodeIds.length - 1;
                          return (
                            <div
                              key={nodeId}
                              className={`p-6 bg-white flex items-start space-x-4 ${!isLast ? 'border-b border-gray-200' : ''}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-base leading-relaxed text-gray-800">
                                {renderTextWithFormBadges(node?.text)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handleChainContinue(
                          chainScreen.chainNodeIds.slice(1),
                          chainScreen.landingNodeId
                        )}
                        className="w-full p-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <span>Continue</span>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  ) : hasMultipleChoices ? (
                    // Multiple choices - show all outgoing edges as buttons with clear dividers
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {outgoingEdges.map((edge, index) => {
                        const targetNode = flow?.nodes?.[edge.to];
                        const buttonText = edge.when || targetNode?.text || `Option ${index + 1}`;
                        const description = edge.when ? targetNode?.text : null;
                        const isLast = index === outgoingEdges.length - 1;
                        
                        // Check if this is an informational message that shouldn't be a button
                        // Only treat as informational if it's a direct edge without a "when" condition (meaning it's not a user choice)
                        const isInformationalNode = !edge.when && (
                          edge.to === 'DVStart' || 
                          edge.to === 'DVTiming' || 
                          edge.to === 'DVForms' ||
                          targetNode?.text?.includes('Important Information: If you file for a Domestic Violence Restraining Order before noon') ||
                          targetNode?.text?.includes('To start a Domestic Violence Restraining Order (DVRO), fill out required forms')
                        );
                        
                        if (isInformationalNode) {
                          // Render as plain text/info box instead of button
                          const isTimingMessage = edge.to === 'DVTiming' || targetNode?.text?.includes('Important Information: If you file for a Domestic Violence Restraining Order before noon');
                          const isFormsMessage = edge.to === 'DVForms' || targetNode?.text?.includes('To start a Domestic Violence Restraining Order (DVRO), fill out required forms');
                          return (
                            <div
                              key={index}
                              className={`w-full p-8 rounded-xl shadow-sm ${
                                isTimingMessage 
                                  ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                  : isFormsMessage
                                    ? 'bg-gray-50 border-l-4 border-gray-400'
                                    : 'bg-blue-50 border-l-4 border-blue-400'
                              } ${
                                !isLast ? 'border-b-2 border-gray-200' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isTimingMessage 
                                    ? 'bg-yellow-200' 
                                    : isFormsMessage
                                      ? 'bg-gray-200'
                                      : 'bg-blue-200'
                                }`}>
                                  <div className={`w-6 h-6 rounded-full ${
                                    isTimingMessage 
                                      ? 'bg-yellow-600' 
                                      : isFormsMessage
                                        ? 'bg-gray-600'
                                        : 'bg-blue-600'
                                  }`}></div>
                                </div>
                                <div className="flex-1">
                                  <div className={`font-semibold text-xl mb-2 ${
                                    isTimingMessage ? 'text-yellow-900' : isFormsMessage ? 'text-gray-900' : 'text-blue-900'
                                  }`}>
                                    {buttonText}
                                  </div>
                                  {description && (
                                    <div className={`text-base leading-relaxed ${
                                      isTimingMessage ? 'text-yellow-700' : isFormsMessage ? 'text-gray-700' : 'text-blue-700'
                                    }`}>
                                      {description}
                                    </div>
                                  )}
                                  {/* Only show Continue button for the last informational node (DVForms) */}
                                  {isFormsMessage && (
                                    <div className="mt-6">
                                      <button
                                        onClick={() => handleChoice(index)}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                                      >
                                        <div className="flex items-center justify-center space-x-3">
                                          <span>Continue</span>
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleChoice(index)}
                            className={`w-full text-left p-8 border-none bg-white hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-inset shadow-sm hover:shadow-md ${
                              !isLast ? 'border-b-2 border-gray-200' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-xl mb-2">
                                  {buttonText}
                                </div>
                                {description && (
                                  <div className="text-base text-gray-600 leading-relaxed">
                                    {description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : outgoingEdges.length === 1 ? (
                    // Single next step
                    <button
                      onClick={() => handleNext(outgoingEdges[0].to)}
                      className="w-full p-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <span>Continue</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ) : outgoingEdges.length === 0 ? (
                    // No outgoing edges - end of flow
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">You've reached the end of this flow.</p>
                      <button
                        onClick={handleComplete}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        View Next Steps
                      </button>
                    </div>
                  ) : null}

                  {/* Prominent Back button placed directly under choices per feedback - larger size */}
                  <div className="pt-6">
                    <button
                      onClick={handleBack}
                      className="w-full px-8 py-6 border-2 border-gray-400 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-bold text-xl shadow-md"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {/* End node */}
              {isEndNode && (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Process Complete
                    </h3>
                    <p className="text-green-700">
                      {currentNode.text}
                    </p>
                  </div>
                  
                  <div className="space-x-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleComplete}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Next Steps
                    </button>
                  </div>
                </div>
                             )}
             </div>
           </div>

          {/* Forms Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Required Forms</h3>
              </div>
              
              <div className="space-y-3">
                {sidebarForms.map((formCode, index) => {
                  const localFormUrl = getLocalFormUrl(formCode);
                  const officialFormUrl = getOfficialFormUrl(formCode);
                  return (
                    <div key={formCode} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{formCode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={localFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download form (local)"
                          onClick={async (e) => {
                            // Try local first, fallback to official if needed
                            try {
                              const checkResponse = await fetch(localFormUrl, { method: 'HEAD' });
                              if (!checkResponse.ok) {
                                e.preventDefault();
                                window.open(officialFormUrl, '_blank');
                              }
                            } catch (error) {
                              e.preventDefault();
                              window.open(officialFormUrl, '_blank');
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title="View example"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {sidebarForms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No forms detected yet</p>
                    <p className="text-xs text-gray-400">Forms will appear as you progress</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Forms Found:</span>
                    <span>{sidebarForms.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
         </div>
       </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleFlowRunner;
