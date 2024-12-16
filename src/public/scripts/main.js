// Ambil semua elemen navigasi
const navLinks = document.querySelectorAll('.nav a');

// Tambahkan event listener untuk setiap link
navLinks.forEach(link => {
    link.addEventListener('click', function () {
        // Hapus kelas 'active' dari semua link
        navLinks.forEach(nav => nav.classList.remove('active'));

        // Tambahkan kelas 'active' ke link yang diklik
        this.classList.add('active');
    });
});
function toggleMenu() {
    const navMenu = document.getElementById("navMenu");
    navMenu.classList.toggle("active"); 
}


const scanButton = document.getElementById('scanButton');
        const scanningLayer = document.getElementById('scanningLayer');
        const scanningText = document.getElementById('scanningText');
        const successMessage = document.getElementById('successMessage');

        scanButton.addEventListener('click', () => {
            scanningLayer.classList.remove('hidden');
            scanningText.textContent = '';
            successMessage.classList.add('hidden');
            let text = 'Scanning';
            let index = 0;
            
            const interval = setInterval(() => {
                if (index < text.length) {
                    scanningText.textContent += text[index];
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 200); // Animasi keluar huruf satu per satu
        });

        // Simulasi menerima data dari backend untuk trigger "Scanning berhasil"
        function receiveRFIDData() {
            scanningText.textContent = 'Scanning';
            successMessage.classList.remove('hidden');
        }

        // Simulasi memanggil fungsi receiveRFIDData setelah 3 detik
        setTimeout(receiveRFIDData, 3000);


        


        