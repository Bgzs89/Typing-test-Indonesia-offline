# KetikCepat

Typing Speed Test offline berbahasa Indonesia.

## Fitur

- Mode kata, kalimat, paragraf
- Kesulitan mudah, sedang, sulit
- Durasi 15, 30, 60, 120 detik
- WPM, KPM, akurasi, konsistensi
- Highlight karakter benar/salah
- Riwayat skor via `localStorage`
- Dark mode mengikuti tema sistem
- PWA offline setelah pertama kali dibuka

## Menjalankan

Gunakan local server agar ES module dan Service Worker berjalan:

```bash
python -m http.server 8080
```

Buka <http://localhost:8080>.

## Struktur

```text
index.html
style.css
app.js
data/texts.js
sw.js
manifest.json
```

Tanpa backend, framework, atau dependency.