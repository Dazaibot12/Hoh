# **App Name**: DAZAI CONVERT

## Core Features:

- TON Price Fetcher: Mengambil harga terbaru TON dari Coingecko sebagai sumber utama. Jika gagal, fallback otomatis ke TonAPI dengan kurs USD/IDR.
- Currency Conversion: Konversi dua arah: TON → IDR dan IDR → TON. Perhitungan real-time berdasarkan harga yang di-fetch.
- Customizable Format: User dapat mengatur format balasan untuk transaksi beli/jual. Placeholder dinamis: {input_amount}, {harga_dasar}, {laba}, {output_currency}, dll.
- Profit Calculation: Perhitungan laba berdasarkan persentase atau nilai tetap per TON. Validasi otomatis jika laba terlalu besar agar hasil tetap wajar.
- Format Recommendation: Memberikan rekomendasi template tampilan hasil konversi dengan bantuan AI. Membantu user merancang format yang konsisten dan mudah dibaca.
- Settings Persistence: Menyimpan pengaturan user (format, nilai laba, mode WTB/WSB). Data tersimpan di local storage / Firestore agar tetap ada saat login berikutnya.

## Style Guidelines:

- Primary Color: Medium Violet #8B5CF6 → memberi kesan modern & teknologi finansial.
- Background Color: Light Gray #F3F4F6 → menjaga keterbacaan & kesan bersih.
- Accent Color: Soft Purple #A78BFA → untuk tombol, highlight, dan CTA penting.
- Headline Font: "Space Grotesk", sans-serif → tampil futuristik, tegas, komputerisasi.
- Body Font: "Inter", sans-serif → mendukung keterbacaan isi teks panjang.
- Icons: Simple, outline-style, terkait currency (💰), settings (⚙️), dan alerts (⚠️).
- Layout: Minimalis dengan section jelas: Bagian Settings di sidebar/atas. Bagian Conversion Result di panel utama. Tampilan responsif untuk desktop & mob