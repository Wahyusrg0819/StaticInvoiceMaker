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

// Event listeners
document.getElementById('update-btn').addEventListener('click', updateInvoice);

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
