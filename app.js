/**
 * CodTech Invoice Generator - Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Sections
    const authPage = document.getElementById('auth-page');
    const formPage = document.getElementById('form-page');
    const previewPage = document.getElementById('preview-page');
    const loginForm = document.getElementById('login-form');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Credentials
    const VALID_EMAIL = 'harishneela71@gmail.com';
    const VALID_PASS = '4666';

    if (localStorage.getItem('codtech_auth') === 'true') {
        showSection('form');
    }

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const em = document.getElementById('email').value;
        const pw = document.getElementById('password').value;
        if (em === VALID_EMAIL && pw === VALID_PASS) {
            localStorage.setItem('codtech_auth', 'true');
            showSection('form');
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    // Generate Invoice
    generateBtn.addEventListener('click', () => {
        // Collect Data
        const data = {
            clientName: document.getElementById('client-name').value || '-',
            brandName: document.getElementById('brand-name').value || '-',
            projectReq: document.getElementById('project-requirement').value || '-',
            totalPayment: parseFloat(document.getElementById('next-total-payment-input').value) || 0,
            paid: parseFloat(document.getElementById('paid-payment').value) || 0,
            gstStatus: document.getElementById('gst-info').value || '-',
            notes: document.getElementById('notes').value || '',
            items: [
                { label: 'Website Design Cost', val: parseFloat(document.getElementById('cost-website').value) || 0 },
                { label: 'Android App Development Cost', val: parseFloat(document.getElementById('cost-android').value) || 0 },
                { label: 'iOS App Development Cost', val: parseFloat(document.getElementById('cost-ios').value) || 0 },
                { label: 'iOS App Store Fees', val: parseFloat(document.getElementById('cost-ios-store').value) || 0 },
                { label: 'Android Play Store Fees', val: parseFloat(document.getElementById('cost-android-store').value) || 0 },
                { label: 'Cloud & Hosting Fees', val: parseFloat(document.getElementById('cost-cloud').value) || 0 },
                { label: 'Domain Fees', val: parseFloat(document.getElementById('cost-domain').value) || 0 }
            ]
        };

        const due = data.totalPayment - data.paid;

        const tableBody = document.getElementById('p-table-body');
        tableBody.innerHTML = '';

        data.items.forEach(item => {
            const displayVal = item.val > 0 ? item.val.toLocaleString() : 'Null';
            const row = `<tr><td>${item.label}</td><td>${displayVal}</td></tr>`;
            tableBody.innerHTML += row;
        });

        // Bind to Preview
        document.getElementById('p-client-name').textContent = data.clientName;
        document.getElementById('p-brand-name').textContent = data.brandName;
        document.getElementById('p-project-req').textContent = data.projectReq;
        document.getElementById('p-next-payment').textContent = data.totalPayment.toLocaleString();
        document.getElementById('p-paid-payment').textContent = data.paid.toLocaleString();
        document.getElementById('p-total-due').textContent = due.toLocaleString();
        document.getElementById('p-gst-status').textContent = data.gstStatus;
        document.getElementById('p-notes-display').textContent = data.notes;

        // Assets
        document.getElementById('preview-logo').innerHTML = `<img src="${ASSETS.logo}" alt="Logo">`;
        document.getElementById('preview-sig').innerHTML = `<img src="${ASSETS.signature}" class="signature-img" alt="Sig">`;
        document.getElementById('preview-stamp').innerHTML = `<img src="${ASSETS.stamp}" alt="Stamp">`;

        showSection('preview');
    });

    // Download PDF
    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-to-print');
        const opt = {
            margin: 0,
            filename: `Invoice_${document.getElementById('client-name').value || 'CodTech'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    // Live Calculation in Form
    const manualFields = document.querySelectorAll('#next-total-payment-input, #paid-payment');
    manualFields.forEach(input => {
        input.addEventListener('input', () => {
            const total = parseFloat(document.getElementById('next-total-payment-input').value) || 0;
            const paid = parseFloat(document.getElementById('paid-payment').value) || 0;
            document.getElementById('total-due-input').value = total - paid;
        });
    });

    function showSection(name) {
        authPage.style.display = 'none';
        formPage.style.display = 'none';
        previewPage.style.display = 'none';
        if (name === 'auth') authPage.style.display = 'flex';
        if (name === 'form') formPage.style.display = 'block';
        if (name === 'preview') previewPage.style.display = 'block';
    }
});
