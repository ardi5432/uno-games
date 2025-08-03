# UNO Game dengan AI

## Link Games
- https://ardi5432.github.io/uno-games/
- https://uno-games.netlify.app/

## Deskripsi
Implementasi digital permainan kartu UNO klasik dengan lawan AI. Game ini menampilkan antarmuka pengguna yang indah dengan animasi dan beberapa tingkat kesulitan AI.

## Teknologi
- HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- Font Awesome, DiceBear API

## Fitur Utama
- 🎨 UI interaktif dengan animasi kartu
- 🤖 3 tingkat kesulitan AI (Mudah, Sedang, Sulit)
- ⚙️ Pengaturan game yang fleksibel
- 🃏 Aturan UNO lengkap
- 📱 Responsif untuk berbagai perangkat

## Cara Instalasi
1. Clone repository
2. Buka index.html
3. Mainkan langsung tanpa instalasi tambahan

## Dukungan AI
1. Organisasi dan struktur kode
2. Penamaan dan kejelasan fungsi
3. Hapus kode yang redundan
4. Tambahkan penanganan kesalahan yang tepat
5. Optimalkan kinerja

## Kecerdasan Buatan (AI) dalam Permainan
### 🟢 Mudah (Easy)
- 🎲 Memilih kartu yang bisa dimainkan secara acak
- 🤔 Terkadang melewatkan langkah yang jelas
- 🙅 Tidak selalu memainkan kartu yang baru diambil meskipun memungkinkan

### 🟡 Sedang (Medium) - *Default*
- 🧠 70% langkah strategis, 30% acak (meniru perilaku manusia)
- ⚡ Memprioritaskan kartu aksi (Skip, Reverse, Draw 2)
- 👍 Biasanya memainkan kartu yang baru diambil jika memungkinkan

### 🔴 Sulit (Hard)
- ♟️ Selalu melakukan langkah optimal
- 🃏 Menggunakan kartu Wild secara strategis
- 🔥 Agresif memainkan kartu aksi untuk mengganggu pemain
- ✅ Selalu memainkan kartu yang baru diambil jika memungkinkan

### Aturan Standar UNO yang Diterapkan AI
- 🔊 Otomatis mengatakan "UNO!" saat tinggal 1 kartu
- 🎯 Menangani efek semua kartu spesial dengan benar
- 🔄 Mengikuti aturan pencocokan warna dan angka
- 🗃️ Mengelola tumpukan kartu dan mengocok ulang saat diperlukan
- ⏭️ Melewati giliran secara otomatis ketika diperlukan
