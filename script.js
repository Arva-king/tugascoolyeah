// inisialisasi
// 1. Mengambil elemen-elemen yang kita butuhkan
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');

// Kunci untuk menyimpan data di localStorage
const STORAGE_KEY = 'todoAppTasks';

// 2. State Aplikasi (Sumber Kebenaran)
// Kita ambil data dari localStorage, atau jika tidak ada, kita mulai dengan array kosong
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/**
 * 3. Fungsi untuk menyimpan data ke localStorage
 */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * 4. Fungsi untuk "merender" atau menampilkan seluruh daftar tugas ke DOM
 * Ini adalah fungsi inti yang akan menangani penambahan, penghapusan, dan penyortiran
 */
function renderList() {
  // Kosongkan daftar <ul> di HTML terlebih dahulu
  todoList.innerHTML = '';

  // Sortir array 'tasks':
  // Tugas yang belum selesai (completed: false) akan di atas
  // Tugas yang sudah selesai (completed: true) akan di bawah
  const sortedTasks = [...tasks].sort((a, b) => {
    // (false adalah 0, true adalah 1, jadi ini akan mengurutkan 0 sebelum 1)
    return a.completed - b.completed;
  });

  // Loop melalui array yang sudah di-sortir dan buat elemen HTML
  sortedTasks.forEach(task => {
    // Membuat elemen <li> (item tugas)
    const todoItem = document.createElement('li');
    todoItem.classList.add('todo-item');
    // Jika tugas selesai, tambahkan kelas 'completed'
    if (task.completed) {
      todoItem.classList.add('completed');
    }

    // Membuat <span> untuk teks tugas
    const todoTextSpan = document.createElement('span');
    todoTextSpan.classList.add('todo-text');
    todoTextSpan.textContent = task.text;

    // Membuat <div> untuk tombol aksi
    const todoActionsDiv = document.createElement('div');
    todoActionsDiv.classList.add('todo-actions');

    // Membuat tombol "Selesai"
    const completeButton = document.createElement('button');
    completeButton.classList.add('btn-complete');
    completeButton.textContent = 'Selesai';

    // Membuat tombol "Hapus"
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-delete');
    deleteButton.textContent = 'Hapus';

    // Menyusun elemen-elemen
    todoActionsDiv.appendChild(completeButton);
    todoActionsDiv.appendChild(deleteButton);
    todoItem.appendChild(todoTextSpan);
    todoItem.appendChild(todoActionsDiv);

    // Masukkan <li> ke dalam <ul> (daftar tugas)
    todoList.appendChild(todoItem);
  });
}

// 5. Event: Tambah tugas baru (Form Submit)
todoForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const todoText = todoInput.value.trim();

  // Validasi: Cek apakah input kosong
  if (todoText === '') {
    errorMessage.textContent = 'Nama tugas tidak boleh kosong.';
    return;
  }

  // Validasi: Cek duplikat
  if (tasks.some(task => task.text.toLowerCase() === todoText.toLowerCase())) {
    errorMessage.textContent = 'Tugas ini sudah ada dalam daftar.';
    return;
  }

  // Input valid, bersihkan pesan error dan input
  errorMessage.textContent = '';
  todoInput.value = '';

  // Buat objek tugas baru
  const newTask = {
    text: todoText,
    completed: false
  };

  // Tambahkan tugas baru ke array 'tasks'
  tasks.push(newTask);

  // Simpan ke localStorage dan render ulang list
  saveTasks();
  renderList();
});

// 6. Event: Tugas selesai & tugas dihapus (Event Delegation)
todoList.addEventListener('click', function(event) {
  const clickedElement = event.target;
  const todoItem = clickedElement.closest('.todo-item');

  // Jika klik di luar tombol/item, abaikan
  if (!todoItem) return;

  // Dapatkan teks dari item yang diklik
  // Kita akan menggunakan ini untuk menemukan data di array 'tasks'
  const todoText = todoItem.querySelector('.todo-text').textContent;

  // Cari index dari tugas di array 'tasks'
  const taskIndex = tasks.findIndex(task => task.text === todoText);

  // Jika tidak ketemu (seharusnya tidak mungkin), abaikan
  if (taskIndex === -1) return;

  // 6a. Cek apakah yang diklik adalah tombol "Hapus"
  if (clickedElement.classList.contains('btn-delete')) {
    // Hapus tugas dari array 'tasks' menggunakan index-nya
    tasks.splice(taskIndex, 1);
  }

  // 6b. Cek apakah yang diklik adalah tombol "Selesai"
  if (clickedElement.classList.contains('btn-complete')) {
    // Ubah status 'completed' di array 'tasks'
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
  }

  // Setelah data di array 'tasks' diubah, simpan dan render ulang
  saveTasks();
  renderList();
});

// 7. Panggil renderList() saat halaman pertama kali dimuat
// Ini akan memuat tugas dari localStorage dan menampilkannya
renderList();