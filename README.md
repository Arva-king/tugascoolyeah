Berdasarkan analisis mendalam terhadap kode (index.html, style.css, dan script.js) yang Anda unggah, berikut adalah README.md yang telah direvisi agar 100% akurat dengan fitur dan logika yang ada di dalam kode tersebut.

Saya telah memperbarui detail fitur (seperti opsi sortiran, logika recurring, dan fitur backup) agar sesuai dengan implementasi teknisnya.

✨ To-Do List Interaktif (To-Do Elite)
To-Do List Interaktif adalah aplikasi manajemen tugas berbasis web modern yang menggabungkan konsep Productivity Dashboard dengan elemen Gamifikasi. Aplikasi ini dirancang untuk membantu pengguna mengelola tugas sehari-hari, melacak kebiasaan, dan mempertahankan fokus menggunakan teknik Pomodoro.

Aplikasi ini berjalan sepenuhnya di sisi klien (Client-Side) menggunakan LocalStorage, sehingga data Anda tersimpan aman di browser tanpa memerlukan server atau koneksi internet.

🔗 Repositori: github.com/Arva-king/tugascoolyeah

🚀 Fitur Unggulan
1. 📂 Manajemen Tugas Komprehensif
Sistem input tugas yang detail dan fleksibel:

Detail Tugas: Judul, Deskripsi Catatan, dan Tenggat Waktu (Date/Time).

Prioritas: Indikator visual untuk prioritas Low, Medium, dan High.

Organisasi:

Folder/Proyek: Kelompokkan tugas (misal: Kantor, Kuliah). Mendukung pembuatan, edit nama, dan hapus folder.

Label (Tags): Sistem tagging warna-warni (bisa tambah custom tag).

Tugas Berulang (Recurring): Opsi otomatis untuk mengulang tugas secara Harian atau Mingguan. Saat tugas selesai, sistem otomatis membuat duplikat untuk periode berikutnya.

2. 🎮 Gamifikasi & Motivasi
Membuat produktivitas terasa seperti bermain game RPG:

XP & Leveling: Dapatkan XP (Experience Points) setiap menyelesaikan tugas (+10 XP) atau sesi fokus (+50 XP). Naik level setiap 100 XP.

Daily Streak: Penghitung berturut-turut hari pengguna aktif (Login harian).

Sanksi XP: XP akan berkurang jika Anda membatalkan status "Selesai" pada tugas (-10 XP).

3. 📊 Dashboard & Analisis Visual
Kalender Perencanaan: Navigasi tugas berdasarkan tanggal. Tanggal yang memiliki tugas akan ditandai di kalender.

Laporan Produktivitas (Heatmap): Modal analisis khusus yang menampilkan riwayat kinerja bulanan:

🟢 Sempurna (100%): Semua tugas hari itu selesai.

🟡 Proses: Sebagian tugas selesai.

🔴 Terlewat: Ada tugas yang belum selesai pada tanggal yang lewat.

Progress Bar: Bar visual yang menunjukkan persentase penyelesaian tugas aktif saat ini.

4. 🍅 Fokus Mode (Pomodoro)
Zen Overlay: Tampilan layar penuh (fullscreen) untuk memblokir gangguan.

Timer Kustom: Default 25 menit dengan kontrol Start, Pause, dan Reset.

Reward: Dapatkan bonus XP besar setelah menyelesaikan sesi fokus.

5. 🛠️ Alat Bantu & Utilitas
Smart Sorting & Filter:

Filter: Semua, Tertunda (Overdue), Terselesaikan, Hari Ini, dan Sampah.

Sortir: Terbaru, Prioritas Tertinggi, atau Tenggat Terdekat.

Random Picker: Biarkan "Takdir Memilih" tugas mana yang harus dikerjakan selanjutnya jika Anda bingung.

Sistem Sampah (Trash Bin): Soft delete (masuk sampah dulu) dengan opsi Pulihkan (Restore) atau Hapus Permanen.

Fitur Undo: Notifikasi "Toast" dengan tombol Undo saat menghapus tugas.

6. ⚙️ Pengaturan & Data
Backup & Restore: Ekspor seluruh data (Tugas, XP, Folder) ke file .json dan pulihkan kapan saja (berguna untuk pindah device).

Tema Gelap (Dark Mode): Dukungan native untuk mode gelap yang nyaman di mata.

💻 Struktur Kode
Proyek ini dibangun menggunakan standar web modern tanpa framework berat:

index.html: Struktur semantik aplikasi, memuat layout Sidebar, Dashboard, dan Modals.

style.css:

Menggunakan CSS Variables (:root) untuk manajemen tema (Light/Dark).

Layout responsif dengan Grid dan Flexbox.

Sidebar collapsible (model laci) untuk tampilan mobile.

script.js:

State Management: Menggunakan objek appData tunggal yang disinkronkan ke localStorage.

DOM Manipulation: Rendering dinamis untuk daftar tugas, kalender, dan tag.

Date Logic: Penanganan logika tanggal untuk kalender dan fitur recurring.

📂 Struktur Folder
Bash

tugascoolyeah/
│
├── index.html      # Tampilan antarmuka utama
├── style.css       # Desain visual, tema, dan animasi
├── script.js       # Logika aplikasi, database lokal, dan gamifikasi
└── README.md       # Dokumentasi ini
🏁 Cara Menjalankan
Karena aplikasi ini bersifat Client-Side Static, Anda tidak perlu menginstal Node.js, database, atau server backend.

Clone atau Download repositori ini:

```Bash

git clone https://github.com/Arva-king/tugascoolyeah.git
```
Buka Folder hasil download.

Jalankan File: Klik dua kali pada index.html untuk membukanya di browser favorit Anda (Chrome, Edge, Firefox, Safari).

Tips: Untuk pengalaman pengembangan terbaik (agar ikon dan font dimuat sempurna tanpa cache), disarankan menggunakan ekstensi "Live Server" di VS Code.

🛡️ Keamanan Data
Data Anda 100% Pribadi. Aplikasi ini menyimpan semua data tugas dan progres level di dalam localStorage browser Anda. Tidak ada data yang dikirim ke cloud atau server pihak ketiga.

Jika Anda membersihkan cache browser (Clear Site Data), pastikan untuk melakukan Backup (Export Data) terlebih dahulu melalui menu di Sidebar.
