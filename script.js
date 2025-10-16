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

        // Capture invoice as canvas with higher scale for quality
        const canvas = await html2canvas(invoice, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;

        // Calculate image dimensions to fit A4 with minimal margins
        const marginX = 10; // 10mm margin kiri-kanan
        const marginY = 10; // 10mm margin atas-bawah
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

        const finalWidth = imgWidthMm * scale;
        const finalHeight = imgHeightMm * scale;

        // Center horizontally, align top with margin
        const xOffset = (pdfWidth - finalWidth) / 2;
        const yOffset = marginY;

        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

        // Generate filename with customer name and date
        const customerName = document.getElementById('nama').value.replace(/\s+/g, '_');
        const today = new Date().toISOString().split('T')[0];
        const filename = `Invoice_${customerName}_${today}.pdf`;

        // Download
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
document.getElementById('update-btn').addEventListener('click', updateInvoice);

document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);

document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});

// Auto-update on input change
const formInputs = document.querySelectorAll('#invoice-form input');
formInputs.forEach(input => {
    input.addEventListener('input', updateInvoice);
});

// Initialize
initializeDates();
updateInvoice();
