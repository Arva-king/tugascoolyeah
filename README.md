# ✨ To-Do List

**To-Do List** adalah aplikasi manajemen tugas (*Task Manager*) berbasis web modern yang dirancang untuk meningkatkan produktivitas pribadi. Dibangun dengan pendekatan **Dashboard**, aplikasi ini menggabungkan daftar tugas tradisional dengan elemen **Gamifikasi**, **Manajemen Waktu (Pomodoro)**, dan **Analisis Visual**.

Aplikasi ini bersifat *Client-Side* penuh, berjalan langsung di browser tanpa perlu instalasi server, dan menyimpan data secara aman di perangkat pengguna.

🔗 **Repositori:** [github.com/Arva-king/tugascoolyeah](https://github.com/Arva-king/tugascoolyeah)

## 🚀 Fitur Unggulan

### 📅 1. Dashboard & Manajemen Waktu
* **Dual-Pane Layout:** Tata letak efisien dengan formulir input di kiri dan kalender interaktif di kanan.
* **Kalender Riwayat (Habit Tracker):** Visualisasi produktivitas harian. Tanggal diwarnai otomatis:
    * 🟢 **Hijau:** Semua tugas selesai (100%).
    * 🟡 **Kuning:** Tugas sebagian selesai (Proses).
    * 🔴 **Merah:** Ada tugas yang terlewat.
* **Preview Harian:** Klik tanggal mana saja di kalender untuk melihat arsip tugas pada hari tersebut tanpa meninggalkan halaman utama.

### 🍅 2. Fokus & Produktivitas
* **Zen Mode Pomodoro:** Timer layar penuh (*Full Screen Overlay*) dengan desain minimalis untuk fokus total.
* **Sistem Tugas Berulang (Recurring):** Dukungan untuk tugas yang otomatis muncul kembali secara Harian atau Mingguan (dengan logika tanggal cerdas).
* **Prioritas & Tenggat Waktu:** Penanda visual untuk tingkat urgensi (Low, Medium, High) dan status keterlambatan (Overdue).
* **Random Picker:** Fitur "Pilihkan Saya Tugas" untuk mengatasi *decision fatigue*.

### 🎮 3. Gamifikasi (Motivasi)
* **Sistem XP & Level:** Dapatkan poin pengalaman setiap kali menyelesaikan tugas atau sesi fokus. Naikkan level produktivitas Anda!
* **Daily Streak:** Menghitung hari berturut-turut pengguna aktif menggunakan aplikasi.

### 📂 4. Organisasi & Manajemen Data
* **Sistem Folder:** Kelompokkan tugas ke dalam proyek (misal: Kantor, Kuliah). Mendukung pembuatan, edit, dan hapus folder.
* **Label Kustom (Tags):** Tambahkan label warna-warni tak terbatas.
* **Tempat Sampah (Recycle Bin):** Tugas yang dihapus masuk ke penampungan sementara sebelum dihapus permanen (aman dari klik tidak sengaja).
* **Backup & Restore:** Ekspor seluruh data ke file `.json` dan pulihkan kapan saja.

### 🎨 5. UI/UX Modern
* **Dark Mode:** Tema gelap terintegrasi yang nyaman di mata.
* **Smart Sorting:** Urutkan tugas berdasarkan Prioritas, Tenggat Waktu Terdekat, atau Tanggal Dibuat.
* **Filter Cerdas:** Navigasi cepat antara tugas Aktif, Tertunda (Overdue), Hari Ini, dan Selesai.

---

## 🛠️ Teknologi

Proyek ini dibangun menggunakan standar web modern tanpa ketergantungan pada *library* atau *framework* eksternal yang berat.

* **HTML5:** Struktur semantik.
* **CSS3:** * CSS Grid & Flexbox untuk layout responsif.
    * CSS Variables untuk tema dinamis (Light/Dark).
    * Animasi CSS murni (tanpa library animasi JS).
* **JavaScript (Vanilla ES6+):** * Manipulasi DOM tingkat lanjut.
    * **LocalStorage API** untuk persistensi data.
    * Logika Tanggal & Waktu kustom (bebas bug timezone).

## 📂 Struktur Folder

```bash
tugascoolyeah/
│
├── index.html      # Kerangka utama aplikasi (Dashboard Layout)
├── style.css       # Styling visual, tema, animasi, dan responsivitas
├── script.js       # Logika inti, manajemen data, gamifikasi, dan kalender
├── README.md       # Dokumentasi proyek
└── images/         # (Opsional) Aset gambar untuk dokumentasi
```
💻 Cara Menjalankan
Karena aplikasi ini berjalan di sisi klien (client-side), Anda tidak perlu menginstal Node.js, PHP, atau database server.

Clone Repositori:
```bash
git clone https://github.com/Arva-king/tugascoolyeah.git
```
Buka Folder: Masuk ke direktori hasil clone.

Jalankan: Cukup buka file index.html menggunakan browser modern (Chrome, Edge, Firefox, Safari).

Tips: Untuk pengalaman pengembangan terbaik, gunakan ekstensi "Live Server" di VS Code.
