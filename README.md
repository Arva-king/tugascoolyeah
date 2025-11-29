# ✨ To-Do List Interaktif

![Status](https://img.shields.io/badge/Status-Completed-success)
![Technology](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-blue)

To-Do List adalah aplikasi manajemen tugas (Task Manager) berbasis web modern yang dirancang untuk meningkatkan produktivitas pribadi. Dibangun dengan pendekatan Dashboard, aplikasi ini menggabungkan daftar tugas tradisional dengan elemen Gamifikasi, Manajemen Waktu (Pomodoro), dan Analisis Visual.

Aplikasi ini bersifat Client-Side penuh, berjalan langsung di browser tanpa perlu instalasi server, dan menyimpan data secara aman di perangkat pengguna (localStorage).

🔗 Repositori: github.com/Arva-king/tugascoolyeah

## 🚀 Fitur Unggulan
# 📅 1. Dashboard & Manajemen Waktu
Dual-Pane Layout: Tata letak efisien dengan formulir input di kiri dan kalender interaktif di kanan.

Kalender Riwayat (Habit Tracker): Visualisasi produktivitas harian. Tanggal diwarnai otomatis:

🟢 Hijau (Sempurna): Semua tugas selesai (100%).

🟡 Kuning (Proses): Tugas sebagian selesai.

🔴 Merah (Terlewat): Ada tugas yang belum selesai pada tanggal yang sudah lewat.

Preview Harian: Klik tanggal mana saja di kalender untuk melihat arsip tugas pada hari tersebut tanpa meninggalkan halaman utama.

# 🍅 2. Fokus & Produktivitas
Zen Mode Pomodoro: Timer layar penuh (Full Screen Overlay) dengan desain minimalis untuk fokus total.

Sistem Tugas Berulang (Recurring): Dukungan untuk tugas yang otomatis muncul kembali secara Harian atau Mingguan (logika tanggal otomatis diperbarui saat tugas diselesaikan).

Prioritas & Tenggat Waktu: Penanda visual untuk tingkat urgensi (Low, Medium, High) dan status keterlambatan (Overdue).

Random Picker: Fitur "Pilihkan Saya Tugas" untuk mengatasi decision fatigue.

# 🎮 3. Gamifikasi (Sistem XP & Level)
Sistem poin yang terintegrasi langsung dengan tindakan pengguna di dalam kode:

Mendapatkan XP:

+5 XP: Saat membuat tugas baru.

+10 XP: Saat menyelesaikan tugas (Checklist).

+50 XP: Saat menyelesaikan sesi timer Pomodoro.

Sanksi XP:

-10 XP: Jika membatalkan status selesai pada tugas (Uncheck).

Level Up: Naik level setiap kelipatan 100 XP.

Daily Streak: Menghitung hari berturut-turut pengguna aktif login ke aplikasi.

# 📂 4. Organisasi & Manajemen Data
Sistem Folder: Kelompokkan tugas ke dalam proyek (misal: Kantor, Kuliah). Mendukung pembuatan, edit nama, dan hapus folder.

Label Kustom (Tags): Tambahkan label warna-warni tak terbatas.

Tempat Sampah (Soft Delete): Tugas yang dihapus masuk ke folder "Sampah" terlebih dahulu.

Pulihkan: Kembalikan tugas ke daftar aktif.

Hapus Permanen: Menghapus data selamanya dari memori.

Undo: Notifikasi singkat (Toast) dengan tombol Undo saat tugas baru saja dihapus.

Backup & Restore: Ekspor seluruh data ke file .json dan pulihkan kapan saja.

# 🎨 5. UI/UX Modern
Dark Mode: Tema gelap terintegrasi yang nyaman di mata (menyimpan preferensi pengguna).

Smart Sorting: Urutkan tugas berdasarkan Terbaru, Prioritas, atau Tenggat Terdekat.

Filter Cerdas: Navigasi cepat antara tugas Aktif, Tertunda (Overdue), Hari Ini, dan Selesai.

# 🛠️ Teknologi
Proyek ini dibangun menggunakan standar web modern tanpa ketergantungan pada library atau framework eksternal yang berat.

HTML5: Struktur semantik dan elemen modal dialog.

CSS3:

CSS Grid & Flexbox untuk layout responsif.

CSS Variables untuk tema dinamis (Light/Dark).

Animasi CSS murni (tanpa library animasi JS).

JavaScript (Vanilla ES6+):

Manipulasi DOM tingkat lanjut.

LocalStorage API untuk persistensi data (tugas, folder, XP, setting).

Logika Tanggal & Waktu kustom (bebas bug timezone).

# 📂 Struktur Folder
Bash

tugascoolyeah/
│
├── index.html      # Kerangka utama aplikasi (Dashboard Layout, Modals)
├── style.css       # Styling visual, tema, animasi, dan responsivitas
├── script.js       # Logika inti, manajemen data, gamifikasi, dan kalender
├── README.md       # Dokumentasi proyek
💻 Cara Menjalankan
Karena aplikasi ini berjalan di sisi klien (client-side), Anda tidak perlu menginstal Node.js, PHP, atau database server.

Clone Repositori:

```Bash
git clone https://github.com/Arva-king/tugascoolyeah.git
```
Buka Folder: Masuk ke direktori hasil clone.

Jalankan: Cukup buka file index.html menggunakan browser modern (Chrome, Edge, Firefox, Safari).

Tips: Untuk pengalaman pengembangan terbaik, gunakan ekstensi "Live Server" di VS Code.
