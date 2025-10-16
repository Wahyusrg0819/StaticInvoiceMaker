// Format currency to Rupiah
function formatRupiah(amount) {
    return 'Rp ' + parseInt(amount).toLocaleString('id-ID');
}

// Format date to Indonesian format
function formatDate(dateString) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

// Calculate days between two dates
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Update invoice display
function updateInvoice() {
    // Customer info
    document.getElementById('display-nama').textContent = document.getElementById('nama').value;
    document.getElementById('display-alamat').textContent = document.getElementById('alamat').value;
    document.getElementById('display-telepon').textContent = document.getElementById('telepon').value;

    // Rental details
    document.getElementById('display-merek').textContent = document.getElementById('merek').value;
    document.getElementById('display-plat').textContent = document.getElementById('plat').value;

    const tglSewa = document.getElementById('tgl-sewa').value;
    const tglKembali = document.getElementById('tgl-kembali').value;

    if (tglSewa) {
        document.getElementById('display-tgl-sewa').textContent = formatDate(tglSewa);
    }

    if (tglKembali) {
        document.getElementById('display-tgl-kembali').textContent = formatDate(tglKembali);
    }

    // Calculate rental duration
    let lamaSewa = 0;
    if (tglSewa && tglKembali) {
        lamaSewa = calculateDays(tglSewa, tglKembali);
        document.getElementById('display-lama-sewa').textContent = `${lamaSewa} Hari`;
    }

    // Price calculations
    const hargaPerHari = parseInt(document.getElementById('harga-per-hari').value) || 0;
    const biayaTambahan = parseInt(document.getElementById('biaya-tambahan').value) || 0;
    const pajakPersen = parseFloat(document.getElementById('pajak').value) || 0;

    document.getElementById('display-harga-per-hari').textContent = formatRupiah(hargaPerHari);

    const biayaSewa = hargaPerHari * lamaSewa;
    document.getElementById('display-biaya-sewa-label').textContent = `Biaya Sewa (${lamaSewa} Hari)`;
    document.getElementById('display-biaya-sewa').textContent = formatRupiah(biayaSewa);

    document.getElementById('display-biaya-tambahan').textContent = formatRupiah(biayaTambahan);

    const subtotal = biayaSewa + biayaTambahan;
    const pajak = subtotal * (pajakPersen / 100);
    document.getElementById('display-pajak-label').textContent = `Pajak (${pajakPersen}%)`;
    document.getElementById('display-pajak').textContent = formatRupiah(pajak);

    const total = subtotal + pajak;
    document.getElementById('display-total').textContent = formatRupiah(total);

    // Payment method
    document.getElementById('display-bank').textContent = document.getElementById('bank').value;
    document.getElementById('display-rekening').textContent = document.getElementById('rekening').value;
    document.getElementById('display-atas-nama').textContent = document.getElementById('atas-nama').value;
}

// Initialize dates
function initializeDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const formatDateInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    document.getElementById('tgl-sewa').value = formatDateInput(today);
    document.getElementById('tgl-kembali').value = formatDateInput(tomorrow);
}

// Download PDF function
async function downloadPDF() {
    const button = document.getElementById('download-pdf-btn');
    const originalText = button.textContent;
    button.textContent = 'Generating PDF...';
    button.disabled = true;

    try {
        const invoice = document.getElementById('invoice');

        // Temporarily show invoice if hidden (mobile)
        const originalDisplay = invoice.style.display;
        const originalWidth = invoice.style.width;
        const originalMaxWidth = invoice.style.maxWidth;
        const originalPadding = invoice.style.padding;

        invoice.style.display = 'block';
        invoice.style.position = 'relative';
        invoice.style.visibility = 'visible';
        invoice.style.width = '190mm'; // Slightly smaller to fit better
        invoice.style.maxWidth = '190mm';
        invoice.style.padding = '5mm 6mm 15mm 6mm'; // Normal top, extra bottom padding for "Atas Nama"
        invoice.style.fontSize = '12px'; // Normal font
        invoice.style.lineHeight = '1.4'; // Normal line height

        // Reduce spacing for all sections
        const sections = invoice.querySelectorAll('.customer-section, .details-section, .cost-section, .payment-section');
        sections.forEach(section => {
            section.style.marginBottom = '10px';
        });

        const divider = invoice.querySelector('.divider');
        if (divider) divider.style.margin = '10px 0';

        const header = invoice.querySelector('.invoice-header');
        if (header) {
            header.style.marginBottom = '8px';
            const h1 = header.querySelector('h1');
            if (h1) h1.style.marginBottom = '8px';
            const companyInfo = header.querySelector('.company-info');
            if (companyInfo) {
                const paragraphs = companyInfo.querySelectorAll('p');
                paragraphs.forEach(p => p.style.margin = '2px 0');
            }
        }

        const infoRows = invoice.querySelectorAll('.info-row');
        infoRows.forEach(row => {
            row.style.marginBottom = '3px';
        });

        // Make payment section more compact
        const paymentSection = invoice.querySelector('.payment-section');
        if (paymentSection) {
            paymentSection.style.marginBottom = '5px';
        }

        const tables = invoice.querySelectorAll('table');
        tables.forEach(table => {
            table.style.marginTop = '5px';
            const cells = table.querySelectorAll('th, td');
            cells.forEach(cell => {
                cell.style.padding = '6px';
                cell.style.fontSize = '12px'; // Increased from 10px to 11px
            });
        });

        // Temporarily hide watermark to avoid CORS issues
        invoice.classList.add('no-watermark');

        // Wait a bit for style to apply and force reflow
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force browser to recalculate layout
        invoice.offsetHeight;

        // Capture invoice as canvas with full height
        const canvas = await html2canvas(invoice, {
            scale: 1.2,
            logging: false,
            backgroundColor: '#ffffff',
            width: invoice.scrollWidth,
            height: invoice.scrollHeight,
            windowWidth: invoice.scrollWidth,
            windowHeight: invoice.scrollHeight,
            onclone: (clonedDoc) => {
                const clonedInvoice = clonedDoc.getElementById('invoice');
                if (clonedInvoice) {
                    clonedInvoice.style.height = 'auto';
                }
            }
        });

        // Restore watermark and original styles
        invoice.classList.remove('no-watermark');
        invoice.style.display = originalDisplay;
        invoice.style.width = originalWidth;
        invoice.style.maxWidth = originalMaxWidth;
        invoice.style.padding = originalPadding;

        // Check if canvas is valid
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error(`Canvas capture failed - width: ${canvas?.width}, height: ${canvas?.height}`);
        }

        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;

        // Calculate image dimensions to fit A4 with minimal margins
        const marginX = 5; // 5mm margin kiri-kanan (lebih kecil)
        const marginY = 8; // 8mm margin atas-bawah
        const availableWidth = pdfWidth - (marginX * 2);
        const availableHeight = pdfHeight - (marginY * 2);

        // Calculate scaling - prioritize width to fill the page
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Convert pixels to mm (1px = 0.264583mm at 96 DPI)
        const pxToMm = 0.264583;

        // Calculate dimensions in mm
        let imgWidthMm = imgWidth * pxToMm;
        let imgHeightMm = imgHeight * pxToMm;

        // Scale to fit available space
        const widthRatio = availableWidth / imgWidthMm;
        const heightRatio = availableHeight / imgHeightMm;
        const scale = Math.min(widthRatio, heightRatio);

        let finalWidth = imgWidthMm * scale;
        let finalHeight = imgHeightMm * scale;

        // Ensure dimensions are valid (not NaN, not negative, not zero)
        if (!finalWidth || finalWidth <= 0 || isNaN(finalWidth)) {
            finalWidth = availableWidth;
        }
        if (!finalHeight || finalHeight <= 0 || isNaN(finalHeight)) {
            finalHeight = availableHeight;
        }

        // Don't override - use the calculated scale that fits both width and height
        // finalWidth and finalHeight already calculated above with Math.min(widthRatio, heightRatio)

        // Align to left margin
        let xOffset = marginX;
        let yOffset = marginY;

        // Ensure offsets are valid
        if (isNaN(xOffset) || xOffset < 0) {
            xOffset = marginX;
        }
        if (isNaN(yOffset) || yOffset < 0) {
            yOffset = marginY;
        }

        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add invoice content first
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

        // Add watermark on top with transparency
        try {
            // Load watermark image
            const watermarkImg = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load watermark'));
                img.src = 'https://res.cloudinary.com/devdvp44p/image/upload/v1760606379/My%20Brand/image-removebg-preview_lwqo5r.png';

                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('Watermark load timeout')), 5000);
            });

            // Calculate watermark size (50% of page width, centered)
            const watermarkWidth = pdfWidth * 0.5;
            const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth;
            const watermarkX = (pdfWidth - watermarkWidth) / 2;
            const watermarkY = (pdfHeight - watermarkHeight) / 2;

            // Convert image to base64
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = watermarkImg.width;
            tempCanvas.height = watermarkImg.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(watermarkImg, 0, 0);
            const watermarkData = tempCanvas.toDataURL('image/png');

            // Add watermark with transparency on top of content
            pdf.setGState(new pdf.GState({ opacity: 0.15 }));
            pdf.addImage(watermarkData, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
            pdf.setGState(new pdf.GState({ opacity: 1 }));

            console.log('Watermark added successfully at position:', watermarkX, watermarkY, 'size:', watermarkWidth, watermarkHeight);
        } catch (e) {
            console.log('Watermark failed to load:', e.message);
        }

        // Generate filename with customer name and date
        const customerName = document.getElementById('nama').value.replace(/\s+/g, '_') || 'Customer';
        const today = new Date().toISOString().split('T')[0];
        const filename = `Invoice_${customerName}_${today}.pdf`;

        // Download PDF
        console.log('Saving PDF:', filename);
        pdf.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Event listeners
document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);

document.getElementById('print-btn').addEventListener('click', () => {
    // Change page title temporarily for print filename
    const originalTitle = document.title;
    const customerName = document.getElementById('nama').value.replace(/\s+/g, '_') || 'Customer';
    const today = new Date().toISOString().split('T')[0];
    const filename = `Invoice_${customerName}_${today}`;

    document.title = filename;

    // Print
    window.print();

    // Restore original title after print dialog closes
    setTimeout(() => {
        document.title = originalTitle;
    }, 1000);
});

// Auto-update on input change
const formInputs = document.querySelectorAll('#invoice-form input');
formInputs.forEach(input => {
    input.addEventListener('input', updateInvoice);
});

// Pre-load watermark image
let watermarkImageData = null;
const preloadWatermark = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        watermarkImageData = {
            data: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height
        };
        console.log('Watermark preloaded successfully');
    };
    img.onerror = () => console.log('Failed to preload watermark');
    img.src = 'https://res.cloudinary.com/devdvp44p/image/upload/v1760606379/My%20Brand/image-removebg-preview_lwqo5r.png';
};

// Initialize
preloadWatermark();
initializeDates();
updateInvoice();
