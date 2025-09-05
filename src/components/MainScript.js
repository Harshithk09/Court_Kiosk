document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const modal = document.getElementById('info-modal');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const closeModalBtn = document.querySelector('.close-btn');
    const summaryForm = document.getElementById('summary-form');
    const caseLookupForm = document.getElementById('case-lookup-form');

    // --- State ---
    let currentLanguage = 'en';
    let flowHistory = []; // To store text from the guided flow for the summary

    // --- Event Listeners ---

    // Use event delegation for all button clicks inside the main content area
    mainContent.addEventListener('click', async (e) => {
        if (e.target.tagName !== 'BUTTON') return;

        const button = e.target;
        const action = button.dataset.action;

        if (action === 'get_info') {
            handleGetInfo(button.dataset.topic);
        } else if (action === 'start_flow' || action === 'flow_step') {
            handleFlowStep(button.dataset.nodeId);
        }
    });

    // Modal close events
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Email summary form submission
    summaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('user-email').value;
        const caseNumber = document.getElementById('case-number').value;
        
        // Use the text from the modal body or the flow history
        const summaryContent = flowHistory.length > 0 ? flowHistory.join('\n\n') : modalBody.innerText;

        try {
            const response = await fetch('/save_and_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    caseNumber, 
                    summary: summaryContent, // Send pre-formatted summary
                    language: currentLanguage 
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                showToast('Success! Your summary has been sent to your email.');
            } else {
                throw new Error(result.message || 'Failed to send summary.');
            }
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error submitting summary:', error);
            showToast('There was an error sending your summary. Please try again.', 'error');
        }
    });

    // Case lookup form submission
    caseLookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const caseNumberInput = document.getElementById('case-number-input');
        const caseNumber = caseNumberInput.value.trim();
        if (!caseNumber) return;

        try {
            const response = await fetch('/lookup_case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseNumber }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                handleFlowStep(data.node_id);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('An error occurred while looking up your case.', 'error');
        }
    });

    // --- Handlers ---

    /**
     * Handles simple informational requests.
     * @param {string} topic The topic to ask the LLM about.
     */
    async function handleGetInfo(topic) {
        modalBody.innerHTML = '<p>Loading...</p>';
        modalFooter.style.display = 'none';
        modal.style.display = 'block';

        try {
            const response = await fetch('/get_info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, language: currentLanguage }),
            });
            const data = await response.json();
            modalBody.innerHTML = `<p>${data.reply.replace(/\\n/g, '<br>')}</p>`;
            modalFooter.style.display = 'block';
            flowHistory = []; // Clear flow history for info requests
        } catch (error) {
            modalBody.innerHTML = '<p>Sorry, something went wrong. Please try again.</p>';
            console.error('Error fetching info:', error);
        }
    }

    /**
     * Handles a step in a guided flow.
     * @param {string} nodeId The ID of the next node in the flowchart.
     */
    async function handleFlowStep(nodeId) {
        if (!nodeId) return;

        try {
            const response = await fetch('/flow_step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ node_id: nodeId, language: currentLanguage }),
            });
            const nodeData = await response.json();
            renderFlowStep(nodeData);
        } catch (error) {
            mainContent.innerHTML = '<h2>An error occurred. Please refresh and try again.</h2>';
            console.error('Error fetching flow step:', error);
        }
    }

    /**
     * Renders the UI for a given step in the guided flow.
     * @param {object} nodeData The data for the current flowchart node.
     */
    function renderFlowStep(nodeData) {
        flowHistory.push(nodeData.text);
        
        if (nodeData.type === 'end') {
            modalBody.innerHTML = `<p>${nodeData.text.replace(/\\n/g, '<br>')}</p>`;
            modalFooter.style.display = 'block';
            modal.style.display = 'block';
            return;
        }

        let optionsHTML = '';
        if (nodeData.options && nodeData.options.length > 0) {
            optionsHTML = nodeData.options.map(opt => 
                `<button class="flow-option-btn" data-action="flow_step" data-node-id="${opt.next_node}">${opt.text}</button>`
            ).join('');
        }

        mainContent.innerHTML = `
            <div class="flow-step">
                <h2>${nodeData.text}</h2>
                <div class="flow-options">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Displays a toast notification at the bottom of the screen.
     * @param {string} message The message to display.
     * @param {'success'|'error'} type The type of toast.
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger transition
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide and remove after a delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    }
});