import React, { useMemo, useRef, useState } from 'react';
import { addToQueue } from '../utils/queueAPI';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const CASE_TYPE_CONFIG = {
  DVRO: {
    label: 'Domestic Violence Restraining Order',
    priority: 'A',
    packetFile: 'dvro_packet.pdf',
    packetLabel: 'Download DVRO Packet (PDF)',
    instructionsUrl: 'https://selfhelp.courts.ca.gov/jcc-form/DV-505-INFO',
    formsUrl: 'https://selfhelp.courts.ca.gov/domestic-violence/forms'
  },
  DIVORCE: {
    label: 'Divorce & Legal Separation',
    priority: 'C',
    packetFile: 'divorce_packet.pdf',
    packetLabel: 'Download Divorce Starter Packet (PDF)',
    instructionsUrl: 'https://selfhelp.courts.ca.gov/divorce/overview',
    formsUrl: 'https://selfhelp.courts.ca.gov/divorce/forms'
  },
  CHRO: {
    label: 'Civil Harassment Restraining Order',
    priority: 'A',
    packetFile: 'chro_packet.pdf',
    packetLabel: 'Download Civil Harassment Packet (PDF)',
    instructionsUrl: 'https://selfhelp.courts.ca.gov/civil-harassment-restraining-order',
    formsUrl: 'https://selfhelp.courts.ca.gov/civil-harassment/forms'
  }
};

const CASE_TYPE_FORM_PRESETS = {
  DVRO: [
    { form_code: 'DV-100', title: 'Request for Domestic Violence Restraining Order' },
    { form_code: 'CLETS-001', title: 'Confidential CLETS Information' },
    { form_code: 'DV-109', title: 'Notice of Court Hearing' },
    { form_code: 'DV-110', title: 'Temporary Restraining Order' },
    { form_code: 'DV-105', title: 'Request for Child Custody and Visitation Orders' },
    { form_code: 'DV-140', title: 'Child Custody and Visitation Order Attachment' },
    { form_code: 'DV-108', title: 'Request for Order to Prevent Child Abduction' },
    { form_code: 'DV-200', title: 'Proof of Personal Service' },
    { form_code: 'DV-250', title: 'Proof of Service by Mail (Blank)' }
  ],
  DIVORCE: [
    { form_code: 'FL-100', title: 'Petition — Marriage/Domestic Partnership' },
    { form_code: 'FL-110', title: 'Summons' },
    { form_code: 'FL-115', title: 'Proof of Service of Summons' },
    { form_code: 'FL-117', title: 'Notice and Acknowledgment of Receipt' },
    { form_code: 'FL-105', title: 'Declaration Under UCCJEA' },
    { form_code: 'FL-140', title: 'Declaration of Disclosure' },
    { form_code: 'FL-141', title: 'Declaration Regarding Service of Declaration of Disclosure' },
    { form_code: 'FL-142', title: 'Schedule of Assets and Debts' },
    { form_code: 'FL-144', title: 'Stipulation and Waiver of Final Declaration of Disclosure' },
    { form_code: 'FL-150', title: 'Income and Expense Declaration' }
  ],
  CHRO: [
    { form_code: 'CH-100', title: 'Request for Civil Harassment Restraining Orders' },
    { form_code: 'CLETS-001', title: 'Confidential CLETS Information' },
    { form_code: 'CH-109', title: 'Notice of Court Hearing' },
    { form_code: 'CH-110', title: 'Temporary Restraining Order' },
    { form_code: 'CH-120', title: 'Response to Request for Civil Harassment Restraining Orders' },
    { form_code: 'CH-120-INFO', title: 'How to Respond to a Civil Harassment Restraining Order' },
    { form_code: 'CH-130', title: 'Civil Harassment Restraining Order After Hearing' },
    { form_code: 'CH-200', title: 'Proof of Personal Service' },
    { form_code: 'CM-010', title: 'Civil Case Cover Sheet' }
  ]
};

const CASE_TYPE_NEXT_STEPS = {
  DVRO: [
    {
      action: 'Complete your DVRO forms packet',
      priority: 'high',
      timeline: 'Today',
      details: 'Fill in the required DV-100, DV-109, DV-110, CLETS-001, and any child-related forms before leaving the kiosk.'
    },
    {
      action: 'File your paperwork with the clerk or Self-Help Center',
      priority: 'high',
      timeline: 'As soon as your forms are filled out',
      details: 'Bring photo ID, your completed packet, and at least two copies of each form to the clerk for review and filing.'
    },
    {
      action: 'Serve the restrained person',
      priority: 'high',
      timeline: 'Before your court hearing',
      details: 'Have an adult over 18 (not you) or the sheriff deliver the papers and complete a Proof of Service form.'
    },
    {
      action: 'Attend your DVRO hearing',
      priority: 'critical',
      timeline: 'On the date listed in DV-109',
      details: 'Bring evidence, witnesses, and extra copies of your forms. Arrive 30 minutes early for security screening.'
    }
  ],
  DIVORCE: [
    {
      action: 'Prepare and file your divorce petition packet',
      priority: 'high',
      timeline: 'Within the next few days',
      details: 'Complete the FL-100, FL-110, FL-115/FL-117, and child forms if needed. File the originals with the clerk.'
    },
    {
      action: 'Serve your spouse',
      priority: 'high',
      timeline: 'Immediately after filing',
      details: 'Arrange for an adult over 18 (not you) to deliver the filed forms and complete a proof of service.'
    },
    {
      action: 'Exchange financial disclosures',
      priority: 'medium',
      timeline: 'Within 60 days of filing',
      details: 'Share FL-140, FL-142, FL-144, and FL-150 with your spouse and keep copies for your records.'
    },
    {
      action: 'Track next steps with the Self-Help Center',
      priority: 'medium',
      timeline: 'After serving your spouse',
      details: 'Work with court staff on settlement, mediation, or requesting a hearing to finalize your divorce.'
    }
  ],
  CHRO: [
    {
      action: 'Fill out the Civil Harassment packet',
      priority: 'high',
      timeline: 'Today',
      details: 'Complete CH-100, CH-109, CH-110, CLETS-001, and any optional forms included in the packet.'
    },
    {
      action: 'File your packet and ask about temporary orders',
      priority: 'high',
      timeline: 'After completing your forms',
      details: 'Take your completed forms and copies to the clerk to request a temporary restraining order review.'
    },
    {
      action: 'Serve the restrained person',
      priority: 'high',
      timeline: 'Before the hearing date on CH-109',
      details: 'Use a server over 18 or the sheriff to deliver the papers and complete the proof of service.'
    },
    {
      action: 'Attend the court hearing',
      priority: 'critical',
      timeline: 'On the date listed in your notice',
      details: 'Bring copies of your packet, proof of service, and any evidence to support your request.'
    }
  ]
};

const CompletionPage = ({ answers, history, flow, adminData, onBack, onHome }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [queueNumber, setQueueNumber] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionIdRef = useRef(null);
  if (!sessionIdRef.current) {
    sessionIdRef.current = `K${Math.floor(Math.random() * 90000) + 10000}`;
  }

  const timestampRef = useRef(null);
  if (!timestampRef.current) {
    timestampRef.current = new Date();
  }

  const caseTypeCode = useMemo(() => {
    if (adminData?.case_type) {
      return adminData.case_type.toString().toUpperCase();
    }

    const visitedNodes = Array.isArray(history) ? history : [];
    if (visitedNodes.some(nodeId => nodeId?.toUpperCase?.().includes('CHRO'))) {
      return 'CHRO';
    }

    if (flow?.nodes) {
      for (const nodeId of visitedNodes) {
        const nodeText = flow.nodes?.[nodeId]?.text || '';
        if (/civil harassment/i.test(nodeText)) {
          return 'CHRO';
        }
      }
    }

    const metadataCaseType = flow?.metadata?.case_type
      || flow?.metadata?.flow_family
      || flow?.metadata?.title
      || '';

    if (metadataCaseType) {
      const normalized = metadataCaseType.toString().toUpperCase();
      if (normalized.includes('DIVORCE')) {
        return 'DIVORCE';
      }
      if (normalized.includes('HARASSMENT')) {
        return 'CHRO';
      }
      if (normalized.includes('DVRO') || normalized.includes('DOMESTIC')) {
        return 'DVRO';
      }
    }

    if (flow?.id && flow.id.toLowerCase().includes('divorce')) {
      return 'DIVORCE';
    }

    return 'DVRO';
  }, [adminData, flow, history]);

  const caseTypeConfig = CASE_TYPE_CONFIG[caseTypeCode] || CASE_TYPE_CONFIG.DVRO;
  const caseTypeLabel = caseTypeConfig.label;
  const packetUrl = caseTypeConfig.packetFile
    ? buildApiUrl(`/api/documents/${caseTypeConfig.packetFile}`)
    : null;
  const formsLibraryUrl = caseTypeConfig.formsUrl || null;

  const downloadLinks = useMemo(() => {
    const links = [];
    if (packetUrl) {
      links.push({
        type: 'packet',
        label: caseTypeConfig.packetLabel,
        url: packetUrl
      });
    }
    if (caseTypeConfig.instructionsUrl) {
      links.push({
        type: 'instructions',
        label: `${caseTypeLabel} instructions`,
        url: caseTypeConfig.instructionsUrl
      });
    }
    if (formsLibraryUrl) {
      links.push({
        type: 'forms',
        label: `${caseTypeLabel} blank forms`,
        url: formsLibraryUrl
      });
    }
    return links;
  }, [packetUrl, caseTypeConfig.packetLabel, caseTypeConfig.instructionsUrl, formsLibraryUrl, caseTypeLabel]);

  const resourceButtons = useMemo(() => {
    const buttons = [];
    if (packetUrl) {
      buttons.push({
        key: 'packet',
        label: caseTypeConfig.packetLabel,
        description: 'Download a printable packet of required forms',
        href: packetUrl,
        external: true
      });
    }
    if (caseTypeConfig.instructionsUrl) {
      buttons.push({
        key: 'instructions',
        label: 'View step-by-step instructions',
        description: 'Official California Courts guidance for this case type',
        href: caseTypeConfig.instructionsUrl,
        external: true
      });
    }
    if (formsLibraryUrl) {
      buttons.push({
        key: 'forms',
        label: 'Open blank fillable forms',
        description: 'Fill forms online before printing or filing',
        href: formsLibraryUrl,
        external: true
      });
    }
    return buttons;
  }, [packetUrl, caseTypeConfig.packetLabel, caseTypeConfig.instructionsUrl, formsLibraryUrl]);

  const summary = useMemo(() => {
    const summaryTimestamp = timestampRef.current;
    const formDescriptions = {
      'DV-100': 'Request for Domestic Violence Restraining Order',
      'DV-105': 'Request for Child Custody and Visitation',
      'DV-108': 'Request for Order to Prevent Child Abduction',
      'DV-109': 'Notice of Court Hearing',
      'DV-110': 'Temporary Restraining Order',
      'DV-140': 'Child Custody and Visitation Order Attachment',
      'DV-145': 'Child Abduction Prevention Order',
      'DV-200': 'Proof of Personal Service',
      'DV-250': 'Proof of Service by Mail (Blank)',
      'DV-800': 'Firearms Restraining Order',
      'CLETS-001': 'Confidential CLETS Information',
      'FL-100': 'Petition — Marriage/Domestic Partnership',
      'FL-105': 'Declaration Under UCCJEA',
      'FL-110': 'Summons',
      'FL-115': 'Proof of Service of Summons',
      'FL-117': 'Notice and Acknowledgment of Receipt',
      'FL-140': 'Declaration of Disclosure',
      'FL-141': 'Declaration Regarding Service of Declaration of Disclosure',
      'FL-142': 'Schedule of Assets and Debts',
      'FL-144': 'Stipulation and Waiver of Final Declaration of Disclosure',
      'FL-150': 'Income and Expense Declaration',
      'CH-100': 'Request for Civil Harassment Restraining Orders',
      'CH-109': 'Notice of Court Hearing',
      'CH-110': 'Temporary Restraining Order',
      'CH-120': 'Response to Request for Civil Harassment Restraining Orders',
      'CH-120-INFO': 'How to Respond to a Civil Harassment Restraining Order',
      'CH-130': 'Civil Harassment Restraining Order After Hearing',
      'CH-200': 'Proof of Personal Service',
      'CM-010': 'Civil Case Cover Sheet'
    };

    const formsMap = new Map();
    const addForm = (code, title, description = 'Required for your case type') => {
      if (!code) return;
      const normalized = code.trim().toUpperCase();
      if (!formsMap.has(normalized)) {
        formsMap.set(normalized, {
          form_code: normalized,
          title: title || formDescriptions[normalized] || `${normalized} Form`,
          description
        });
      }
    };

    (Array.isArray(history) ? history : []).forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (!node?.text) return;
      const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
      if (formMatches) {
        formMatches.forEach(code => addForm(code, formDescriptions[code]));
      }
      const specificForms = node.text.match(/\b(DV-\d+|CLETS-001|SER-001|POS-040|CH-\d+|FL-\d+|FW-\d+|CM-\d+|EPO-\d+|JV-\d+|MC-\d+)\b/g);
      if (specificForms) {
        specificForms.forEach(code => addForm(code, formDescriptions[code]));
      }
    });

    CASE_TYPE_FORM_PRESETS[caseTypeCode]?.forEach(({ form_code, title, description }) => {
      addForm(form_code, title, description || 'Required for your case type');
    });

    const summaryData = {
      header: {
        case_type: caseTypeLabel,
        case_type_code: caseTypeCode,
        date: summaryTimestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: 'San Mateo County Superior Court Kiosk',
        session_id: sessionIdRef.current
      },
      forms: Array.from(formsMap.values()).sort((a, b) => a.form_code.localeCompare(b.form_code)),
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
        },
        packet: packetUrl ? {
          label: caseTypeConfig.packetLabel,
          url: packetUrl
        } : null,
        instructions: caseTypeConfig.instructionsUrl ? {
          label: `${caseTypeLabel} instructions`,
          url: caseTypeConfig.instructionsUrl
        } : null,
        forms_library: formsLibraryUrl ? {
          label: `${caseTypeLabel} blank forms`,
          url: formsLibraryUrl
        } : null,
        downloads: downloadLinks
      },
      case_type_code: caseTypeCode
    };

    summaryData.keyAnswers.push(`You are working on a ${caseTypeLabel} matter.`);

    if (caseTypeCode === 'DVRO') {
      if (answers.DVCheck1 === 'Yes') {
        summaryData.keyAnswers.push('You requested protection from abuse through a DVRO');
      }
      if (answers.children === 'yes') {
        summaryData.keyAnswers.push('You indicated you share a child with the restrained person');
      }
      if (answers.support && answers.support !== 'none') {
        const supportType = answers.support.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        summaryData.keyAnswers.push(`You plan to request ${supportType} support`);
      }
      if (answers.firearms === 'yes') {
        summaryData.keyAnswers.push('You reported firearms are involved in your case');
      }
      if (answers.abduction_check === 'yes') {
        summaryData.keyAnswers.push('You plan to request child abduction prevention orders');
      }
    } else if (caseTypeCode === 'DIVORCE') {
      summaryData.keyAnswers.push('You reviewed filing, service, and financial disclosure steps for divorce.');
    } else if (caseTypeCode === 'CHRO') {
      summaryData.keyAnswers.push('You are preparing a Civil Harassment Restraining Order packet.');
    }

    const presetSteps = CASE_TYPE_NEXT_STEPS[caseTypeCode] || CASE_TYPE_NEXT_STEPS.DVRO;
    summaryData.nextSteps = presetSteps.map(step => ({ ...step }));

    if (caseTypeCode === 'DVRO' && answers.children === 'yes') {
      summaryData.nextSteps.push({
        action: 'Prepare child custody and visitation details',
        priority: 'medium',
        timeline: 'Before your hearing',
        details: 'Gather school records, medical information, and any parenting agreements to support your request.'
      });
    }

    if (caseTypeCode === 'DVRO' && answers.support && answers.support !== 'none') {
      summaryData.nextSteps.push({
        action: 'Collect financial records for support requests',
        priority: 'medium',
        timeline: 'Before your hearing',
        details: 'Bring recent pay stubs, tax returns, bank statements, and proof of expenses.'
      });
    }

    return summaryData;
  }, [answers, caseTypeCode, caseTypeConfig.instructionsUrl, caseTypeConfig.packetLabel, caseTypeLabel, downloadLinks, flow, formsLibraryUrl, history, packetUrl]);

  const handleAddToQueue = async () => {
    setIsSubmitting(true);
    try {
      // Use the queueAPI utility for better integration
      const data = await addToQueue({
        case_type: caseTypeCode,
        priority: caseTypeConfig.priority || 'A',
        user_name: 'Anonymous', // Could be passed from props
        user_email: email || null,
        phone_number: phoneNumber || null,
        language: 'en', // Could be passed from props
        answers,
        history,
        summary
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
      console.log('📧 Sending email request...');

      // ===== FIXED: Send data in correct format =====
      const emailPayload = {
        email: email,
        case_data: {
          user_email: email,
          user_name: 'Court Kiosk User',
          case_type: caseTypeCode,
          case_type_label: caseTypeLabel,
          priority_level: caseTypeConfig.priority || 'A',
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
          download_links: downloadLinks,
          packet_url: packetUrl,
          forms_library_url: formsLibraryUrl,

          // Also send full summary
          summary_json: JSON.stringify(summary),
          conversation_summary: summary,
          resources: summary.resources,

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
            {resourceButtons.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-indigo-500 mr-2">📄</span>
                  Packets & Instructions
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {resourceButtons.map(button => (
                    <a
                      key={button.key}
                      href={button.href}
                      target={button.external ? '_blank' : undefined}
                      rel={button.external ? 'noopener noreferrer' : undefined}
                      className="flex flex-col justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition"
                    >
                      <span className="text-blue-900 font-semibold">{button.label}</span>
                      <span className="text-sm text-blue-700 mt-2">{button.description}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
