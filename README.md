# Kartu-Maba
Kartu maba sebagai task gerex

Feature :
1. Validasi Input (Wajib Isi & Cek NRP)
IMPORTANT

Sistem sekarang mengecek semua kolom sebelum membiarkanmu membuat kartu.

Wajib Diisi: Kamu tidak bisa lagi mengklik "Buat Kartu" jika nama, NRP, gugus, atau foto masih kosong.
Validasi NRP 10 Angka: Ada pengecekan khusus pada kolom NRP. Input harus berupa angka dan harus berjumlah persis 10 digit. Jika salah, sistem akan memunculkan pesan error berwarna merah di atas tombol Buat Kartu.

2. Penyimpanan Per-Sesi (Hilang saat Refresh)

Daftar kartu yang kamu buat sekarang hanya disimpan di state lokal (per-sesi). Ini artinya:

Kamu tetap bisa membuat 3, 5, atau berapapun kartu unik.
Setiap kali halaman direfresh, semua daftar kartu akan hilang/dibersihkan otomatis.
Proses upload gambar tetap dilakukan di sisi server (SSR) ke dalam public/uploads/ agar loading foto tetap optimal, namun data profilnya hanya menempel di sesi komputermu.

3. Fitur Hapus Kartu

Di mode Lihat List Kartu, sekarang ada sebuah tombol "X" merah di sudut kanan atas kartu yang sedang aktif. Jika kamu membuat kartu yang salah, cukup klik tombol silang tersebut dan kartu akan dihapus dari list. Jika semua kartu habis, kamu akan dikembalikan ke form pembuatan otomatis.
