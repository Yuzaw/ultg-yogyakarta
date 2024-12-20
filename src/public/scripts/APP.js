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
    const loadingSpinner = document.getElementById('loading'); // Mengambil elemen spinner

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert('Username dan password harus diisi!');
            return;
        }

        // Tampilkan spinner loading
        loadingSpinner.style.display = 'flex';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            
            if (response.ok) {
                loadingSpinner.style.display = 'none';

                localStorage.setItem('token', result.token);
                // alert('Login berhasil!');
                window.location.href = '/homepage';
            } else {
                document.getElementById('error-message').innerText = result.message;
            }
        } catch (error) {
            console.error('Error during login:', error);
        } finally {
            // Sembunyikan spinner setelah login selesai
            loadingSpinner.style.display = 'none';
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
                        <td>${visit.no_kartu_daerah}</td>
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




// -----------------------------------------
const camera = document.getElementById('camera');
const previewImg = document.getElementById('previewImg');
const canvas = document.getElementById('canvas');
const takePhotoButton = document.getElementById('takePhotoButton');
const retakePhotoButton = document.getElementById('retakePhotoButton');
const scanKTPButton = document.getElementById('scanKTPButton');
const nikInput = document.getElementById('nikInput');
const namaInput = document.getElementById('namaInput');
const instansiInput = document.getElementById('instansiInput');
const guestIdInput = document.getElementById('guestId');
const saveButton = document.getElementById('saveButton');
const startCameraButton = document.getElementById('startCameraButton');
const cameraSelector = document.getElementById('cameraSelector');
const loadingSpinner = document.getElementById('loading');

let photoBlob = null;
let currentStream = null;

// Fungsi untuk mengakses perangkat kamera
async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    cameraSelector.innerHTML = ''; // Reset daftar kamera
    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Kamera ${index + 1}`;
      cameraSelector.appendChild(option);
    });
  } catch (error) {
    console.error('Gagal mendapatkan daftar perangkat kamera:', error);
  }
}

// Fungsi untuk memulai kamera dengan deviceId tertentu
async function startCamera(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    camera.srcObject = currentStream;
    camera.style.display = 'block';
    previewImg.style.display = 'none';
    takePhotoButton.style.display = 'inline-block';
    retakePhotoButton.style.display = 'none';
    scanKTPButton.disabled = true;
  } catch (error) {
    console.error('Gagal mengakses kamera:', error);
    alert('Gagal mengakses kamera.');
  }
}

// Fungsi untuk mengambil foto
takePhotoButton.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  context.drawImage(camera, 0, 0, canvas.width, canvas.height);

  // Konversi ke Blob dalam format image/jpg
  canvas.toBlob((blob) => {
    photoBlob = blob;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = 'block'; // Tampilkan gambar preview
      camera.style.display = 'none'; // Sembunyikan kamera
    };
    reader.readAsDataURL(blob);
  }, 'image/jpg'); // Menentukan format JPG

  takePhotoButton.style.display = 'none';
  retakePhotoButton.style.display = 'inline-block';
  scanKTPButton.disabled = false; // Aktifkan tombol Scan KTP
});

// Fungsi untuk retake foto
retakePhotoButton.addEventListener('click', () => {
  photoBlob = null; // Reset foto
  previewImg.style.display = 'none'; // Sembunyikan gambar preview
  camera.style.display = 'block'; // Tampilkan kamera
  takePhotoButton.style.display = 'inline-block';
  retakePhotoButton.style.display = 'none';
  scanKTPButton.disabled = true; // Nonaktifkan tombol Scan KTP
});

// Fungsi untuk scan KTP
scanKTPButton.addEventListener('click', async () => {
  if (!photoBlob) {
    alert('Ambil foto terlebih dahulu!');
    return;
  }


  loadingSpinner.style.display = 'flex';
  const formData = new FormData();
  formData.append('image', photoBlob, 'photo.png'); // Menambahkan nama file dengan ekstensi yang sesuai

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

      loadingSpinner.style.display = 'none';
    //   alert('Scan berhasil!');
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Terjadi kesalahan saat memindai KTP.');
  }
});

// Fungsi untuk menyimpan data yang telah dikoreksi
saveButton.addEventListener('click', async () => {
  const guestId = guestIdInput.value;
  const nik = nikInput.value;
  const nama = namaInput.value;
  const instansi = instansiInput.value;

  if (!guestId || !nik || !nama) {
    alert('Harap lengkapi semua data!');
    return;
  }

  try {
    const response = await fetch(`/api/guests/${guestId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nik, nama, instansi }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Updated Guest:', result.updatedGuest);

      // Simpan guestId ke localStorage
      localStorage.setItem('guestId', guestId);

      // Navigasi ke halaman /generate
      window.location.href = '/generate';

    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Terjadi kesalahan saat menyimpan data tamu.');
  }
});


// Event listener untuk tombol mulai kamera
startCameraButton.addEventListener('click', () => {
  const selectedDeviceId = cameraSelector.value;
  startCamera(selectedDeviceId);
});

// Saat halaman dimuat, ambil daftar perangkat kamera
window.addEventListener('load', getCameraDevices);


