---

# 10.1 Stage Progression Rules

## Hero Scaling

Setelah Hero memenangkan Stage:

* Hero melanjutkan ke Stage berikutnya.
* HP Hero dipulihkan menjadi penuh.
* Maximum HP Hero bertambah sebesar 50% dari Maximum HP sebelumnya.

Contoh:

Stage 1

HP = 100

Stage 2

HP = 150

Stage 3

HP = 225

Stage 4

HP = 337

Stage 5

HP = 505

---

## Enemy Scaling

Setelah melewati Stage 5:

* Jumlah musuh mengikuti pola Stage System.
* Stat musuh meningkat secara bertahap.

Contoh:

Cycle 1

HP = 80 - 120

Cycle 2

HP = 120 - 180

Cycle 3

HP = 180 - 270

Scaling disesuaikan secara otomatis oleh Stage Generator.

---

# 10.2 Dynamic Damage Rules

Damage tidak boleh bersifat tetap.

Setiap serangan harus menghasilkan nilai yang berbeda.

Formula:

Base Damage =
Random(10 - 20)

Final Damage =
Base Damage + Modifier

Modifier berasal dari:

* Skill
* Critical Hit
* Status Effect

---

## Critical Hit

Hero dan Musuh dapat menghasilkan Critical Hit.

Jika Critical Hit terjadi:

Final Damage =
Final Damage × 2

Battle Log wajib menampilkan:

CRITICAL HIT

Critical Hit harus menjadi salah satu sumber damage tertinggi selama battle berlangsung.

---

# 10.3 Combat Animation Rules

Karena belum tersedia asset gambar:

Sistem menggunakan karakter sederhana dan animasi CSS.

Representasi:

Hero = O

Enemy = X

Projectile = .

Impact = *

Critical = !

Clone = O O O

Freeze = ❄

Miss = ~

Counter = ↩

---

## Hero Attack Animation

Contoh:

O . . . . X

atau

O -----> X

---

## Critical Attack Animation

Contoh:

O ======> X

CRITICAL HIT !

---

## Dodge Animation

Contoh:

O ~

MISS

---

## Counter Animation

Contoh:

X -----> O

COUNTER

O -----> X

---

## Clone Animation

Contoh:

O O O

Clone muncul sebelum battle dimulai.

Clone menerima serangan terlebih dahulu.

---

## Freeze Animation

Contoh:

X ❄

Target kehilangan giliran.

---

## Reflect Animation

Contoh:

X -----> O

REFLECT

O -----> X

---

## Death Animation

Contoh:

X

↓

*

↓

hilang

---

# 13.1 Animation Playback System

Battle Engine tidak boleh mengontrol animasi.

Battle Engine hanya menghasilkan Event.

Contoh:

events = [
attack,
projectile,
hit,
damage,
critical,
dodge,
freeze,
counter,
death
]

UI Renderer bertugas menerjemahkan event menjadi animasi.

---

# 13.2 Turn Delay System

Setiap aksi battle harus memiliki jeda.

Tujuan:

* Pemain dapat mengikuti alur cerita battle.
* Animasi dapat dimainkan.
* Battle Log dapat dibaca.

Default:

800ms - 1200ms per action.

Contoh:

Attack

↓ 800ms

Projectile

↓ 800ms

Impact

↓ 800ms

Damage

↓ 800ms

Next Turn

---

# 13.3 Battle Speed Mode

Sistem harus mendukung:

## Normal Mode

Menampilkan:

* Animasi
* Battle Log
* Delay

## Fast Forward Mode

Menampilkan:

* Battle Log
* Hasil Battle

Tanpa animasi dan tanpa delay.

Mode ini dipersiapkan untuk pengembangan berikutnya.
