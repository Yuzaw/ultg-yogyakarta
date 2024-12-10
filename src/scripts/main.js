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
