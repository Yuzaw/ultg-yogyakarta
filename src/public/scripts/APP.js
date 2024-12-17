document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const guestListBody = document.getElementById('guest-list-body');
    const guestTableBody = document.getElementById('guestTableBody');
    const downloadButton = document.getElementById('downloadBtn');
    const downloadVisitsButton = document.getElementById('button-download-kunjungan');

    // Handle login form submission
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (!username || !password) {
                alert('Username dan password harus diisi!');
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    alert('Login berhasil!');
                    window.location.href = '/homepage';
                } else {
                    document.getElementById('error-message').innerText = result.message;
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        });
    }

    // Fetch and display guest visits data
    if (guestListBody) {
        async function fetchVisitList() {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Anda harus login terlebih dahulu.');
                return;
            }

            try {
                const response = await fetch('/api/visits', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal mengambil data kunjungan');
                }

                const visitList = result.visits || [];

                if (visitList.length === 0) {
                    guestListBody.innerHTML = '<tr><td colspan="14">Tidak ada data kunjungan yang ditemukan.</td></tr>';
                    return;
                }

                guestListBody.innerHTML = visitList.map((visit, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${visit.tanggal}</td>
                        <td>${visit.nama}</td>
                        <td>${visit.instansi}</td>
                        <td>${visit.keperluan}</td>
                        <td>${visit.jam_in}</td>
                        <td>${visit.jam_out}</td>
                        <td>${visit.nik}</td>
                        <td>${visit.no_kart_daerah}</td>
                        <td>${visit.no_kartu}</td>
                        <td>${visit.plat_kendaraan}</td>
                        <td>${visit.kendaraan_tamu}</td>
                        <td>${visit.security_induction}</td>
                        <td>${visit.ttd}</td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error saat mengambil daftar kunjungan:', error);
                alert('Terjadi kesalahan saat memuat daftar kunjungan.');
            }
        }

        fetchVisitList();
    }

    // Fetch and display guest data
    if (guestTableBody) {
        async function fetchGuestList() {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Anda harus login terlebih dahulu.');
                return;
            }

            try {
                const response = await fetch('/api/guests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal mengambil data tamu');
                }

                const guestList = result.guests || [];

                if (!Array.isArray(guestList)) {
                    throw new Error('Format data tamu tidak valid');
                }

                if (guestList.length === 0) {
                    guestTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Tidak ada data tamu yang ditemukan.</td></tr>';
                    return;
                }

                guestTableBody.innerHTML = guestList.map((guest, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${guest.nik || 'N/A'}</td>
                        <td>${guest.nama || 'N/A'}</td>
                        <td>${guest.instansi || 'N/A'}</td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error memuat daftar tamu:', error);
                guestTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Gagal memuat daftar tamu</td></tr>';
            }
        }

        fetchGuestList();
    }

    // Handle CSV download button for guest data
    if (downloadButton) {
        downloadButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/download-guests');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'guest_list.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error saat mengunduh CSV:', error);
            }
        });
    }


    if (downloadVisitsButton) {
        downloadVisitsButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/download-visits');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'visit_list.csv';  // You can customize the filename if needed
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error saat mengunduh CSV:', error);
                alert('Terjadi kesalahan saat mengunduh file kunjungan.');
            }
        });
    }

});

// Referensi elemen
const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');
const nikInput = document.getElementById('nikInput');
const namaInput = document.getElementById('namaInput');
const instansiInput = document.getElementById('instansiInput');
const saveButton = document.getElementById('saveButton');
const guestIdInput = document.getElementById('guestId');
const previewImg = document.getElementById('previewImg');

// Fungsi untuk menampilkan preview gambar
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
});

// Fungsi untuk upload gambar dan ekstraksi data
uploadButton.addEventListener('click', async () => {
    const image = imageInput.files[0];
    if (!image) {
        alert('Pilih gambar terlebih dahulu!');
        return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
        const response = await fetch('/api/guests/scan', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            nikInput.value = result.extractedData.nik;
            namaInput.value = result.extractedData.nama;
            guestIdInput.value = result.newGuest.id;
            alert(`Data berhasil disimpan` );
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan saat mengunggah gambar.');
    }
});

// Fungsi untuk menyimpan data tamu
saveButton.addEventListener('click', async () => {
    const guestId = guestIdInput.value;
    const nik = nikInput.value;
    const nama = namaInput.value;
    const instansi = instansiInput.value;

    if (!nik || !nama) {
        alert('Harap lengkapi semua data!');
        return;
    }

    try {
        const response = await fetch(`/api/guests/${guestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nik, nama, instansi }),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan saat menyimpan data tamu.');
    }
});
