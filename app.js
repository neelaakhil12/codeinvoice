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
    const pdfInput = document.getElementById('pdf-attachment');
    const pdfUploadText = document.getElementById('pdf-upload-text');
    const pdfPagesContainer = document.getElementById('pdf-attachment-pages');

    // Configure PDF.js worker securely for edge deployments like Vercel
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    fetch(workerUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
        })
        .catch(err => {
            console.warn('Failed to load PDF worker locally, falling back to CDN', err);
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        });

    // Credentials
    const VALID_EMAIL = 'harishneela71@gmail.com';
    const VALID_PASS = 'cod@1208';

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

    // PDF Upload — show filename when selected
    pdfInput.addEventListener('change', () => {
        if (pdfInput.files.length > 0) {
            pdfUploadText.textContent = 'PDF Selected: ' + pdfInput.files[0].name;
            pdfUploadText.classList.add('has-file');
        } else {
            pdfUploadText.textContent = 'Attach a PDF (optional — will appear after the invoice)';
            pdfUploadText.classList.remove('has-file');
        }
    });

    // Generate Invoice
    generateBtn.addEventListener('click', () => {
        // Collect Data
        const data = {
            clientName: document.getElementById('client-name').value || '-',
            brandName: document.getElementById('brand-name').value || '-',
            clientMobile: document.getElementById('client-mobile').value || '-',
            clientEmail: document.getElementById('client-email').value || '-',
            invoiceDate: document.getElementById('invoice-date').value || '-',
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
        document.getElementById('p-client-mobile').textContent = data.clientMobile;
        document.getElementById('p-client-email').textContent = data.clientEmail;
        document.getElementById('p-invoice-date').textContent = data.invoiceDate;
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

        // Render attached PDF pages below invoice
        renderAttachedPDF();
    });

    // Download PDF — includes invoice + attached PDF pages
    downloadBtn.addEventListener('click', () => {
        const invoiceEl = document.getElementById('invoice-to-print');
        const attachEl = document.getElementById('pdf-attachment-pages');
        const hasAttachment = attachEl.style.display !== 'none' && attachEl.children.length > 0;
        const clientName = document.getElementById('client-name').value || 'CodTech';
        const opt = {
            margin: 0,
            filename: 'Invoice_' + clientName + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        if (hasAttachment) {
            // ✅ FIX: cloneNode() does NOT copy canvas pixel content.
            // Convert every canvas in the attachment area to an <img> with its dataURL first.
            const attachClone = document.createElement('div');
            attachClone.style.cssText = 'width:210mm;margin:0 auto;';

            Array.from(attachEl.children).forEach(child => {
                if (child.tagName === 'CANVAS') {
                    const img = document.createElement('img');
                    img.src = child.toDataURL('image/jpeg', 0.98);
                    img.style.cssText = 'display:block;width:100%;margin-bottom:8px;';
                    attachClone.appendChild(img);
                } else {
                    attachClone.appendChild(child.cloneNode(true));
                }
            });

            const wrapper = document.createElement('div');
            wrapper.appendChild(invoiceEl.cloneNode(true));

            const br = document.createElement('div');
            br.style.cssText = 'page-break-before:always;break-before:page;';
            wrapper.appendChild(br);
            wrapper.appendChild(attachClone);

            html2pdf().set(opt).from(wrapper).save();
        } else {
            html2pdf().set(opt).from(invoiceEl).save();
        }
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

    // Render uploaded PDF pages as canvases below the invoice
    async function renderAttachedPDF() {
        pdfPagesContainer.innerHTML = '';
        pdfPagesContainer.style.display = 'none';
        if (!pdfInput.files || pdfInput.files.length === 0) return;

        const file = pdfInput.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        // Attachment header label
        const header = document.createElement('div');
        header.className = 'pdf-attachment-header';
        header.textContent = 'Attachment: ' + file.name;
        pdfPagesContainer.appendChild(header);

        // Render each page at A4 width (794px)
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const baseViewport = page.getViewport({ scale: 1 });
            const scale = 794 / baseViewport.width;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            pdfPagesContainer.appendChild(canvas);
        }

        pdfPagesContainer.style.display = 'block';
    }

    function showSection(name) {
        authPage.style.display = 'none';
        formPage.style.display = 'none';
        previewPage.style.display = 'none';
        if (name === 'auth') authPage.style.display = 'flex';
        if (name === 'form') formPage.style.display = 'block';
        if (name === 'preview') previewPage.style.display = 'block';
    }
});
