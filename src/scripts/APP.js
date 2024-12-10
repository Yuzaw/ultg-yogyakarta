
        const BASE_URL = 'https://backend-159547646414.asia-southeast2.run.app'; // URL API Anda
        const LOGIN_ENDPOINT = `${BASE_URL}/api/login`;

        // Form elements
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Mencegah refresh halaman

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Validasi input kosong
            if (!username || !password) {
                alert('Username dan password harus diisi!');
                return;
            }

            // Membuat data login
            const loginData = {
                username: username,
                password: password
            };

            try {
                const response = await fetch(LOGIN_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                const result = await response.json();

                if (response.ok) {
                    // Jika login berhasil, alihkan ke halaman lain
                    alert('Login berhasil!');
                    window.location.href = './pages/landingPage.html'; // Ganti URL ini dengan halaman tujuan Anda
                } else {
                    // Menampilkan pesan error jika login gagal
                    alert(`Login gagal: ${result.message}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        });
    
        
        
        const GUEST_LIST_ENDPOINT = `${BASE_URL}/api/visit`; // Endpoint untuk daftar kunjungan

        // Elemen DOM untuk memuat data ke dalam tabel
        const guestListBody = document.getElementById('guest-list-body');
        
        // Fungsi untuk mengambil data kunjungan dari API
        async function fetchGuestList() {
            try {
                const response = await fetch(GUEST_LIST_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Token autentikasi jika diperlukan
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data kunjungan: ${response.statusText}`);
                }
        
                const guestList = await response.json();
                populateGuestTable(guestList);
            } catch (error) {
                console.error('Error saat mengambil daftar kunjungan:', error);
                alert('Terjadi kesalahan saat memuat daftar kunjungan.');
            }
        }
        
        // Fungsi untuk mengisi tabel dengan data dari API
        function populateGuestTable(guestList) {
            guestListBody.innerHTML = ''; // Hapus data sebelumnya
            guestList.forEach((guest, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${guest.tanggal}</td>
                    <td>${guest.nama}</td>
                    <td>${guest.instansi}</td>
                    <td>${guest.keperluan}</td>
                    <td>${guest.jamIn}</td>
                    <td>${guest.jamOut}</td>
                    <td>${guest.identitas}</td>
                    <td>${guest.noKartuDaerahBebas}</td>
                    <td>${guest.noKartu}</td>
                    <td>${guest.noPol}</td>
                    <td>${guest.jenisKendaraan}</td>
                    <td>${guest.securityInduction}</td>
                    <td>${guest.ttd}</td>
                `;
                guestListBody.appendChild(row);
            });
        }
        
        // Memuat daftar kunjungan setelah halaman selesai dimuat
        document.addEventListener('DOMContentLoaded', fetchGuestList);



        

        document.addEventListener('DOMContentLoaded', function() {
            // Fetch guest data from backend when the page is loaded
            fetch('https://backend-159547646414.asia-southeast2.run.app/api/guests') // Replace with your correct endpoint
                .then(response => response.json())
                .then(data => {
                    // Check if the response contains guests
                    if (data && data.guests) {
                        const guestTableBody = document.getElementById('guestTableBody');
                        data.guests.forEach((guest, index) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${index + 1}</td>
                                <td>${guest.nik}</td>
                                <td>${guest.nama}</td>
                                <td>${guest.instansi}</td>
                            `;
                            guestTableBody.appendChild(row);
                        });
                    } else {
                        console.error('Guests data is not available.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching guest data:', error);
                });
        
            // Set up the download button functionality
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.addEventListener('click', function() {
                downloadCSV();
            });
        });
        
        function downloadCSV() {
            const rows = [];
            const headers = ['NO', 'NIK', 'NAMA', 'INSTANSI'];
            rows.push(headers);
        
            const guestTableBody = document.getElementById('guestTableBody');
            const guestRows = Array.from(guestTableBody.rows);
            
            guestRows.forEach(row => {
                const rowData = [];
                row.cells.forEach(cell => {
                    rowData.push(cell.innerText);
                });
                rows.push(rowData);
            });
        
            const csvContent = rows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
        
            // Update the download button link
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.setAttribute('href', url);
            downloadBtn.setAttribute('download', 'daftar_tamu.csv');
        }
        