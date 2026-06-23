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

Scaling disesuaikan secara otomatis oleh Stage Generator menggunakan konstanta CYCLE_SCALE.

---

# 10.2 Dynamic Damage Rules

Damage tidak boleh bersifat tetap.

Setiap serangan harus menghasilkan nilai yang berbeda.

Base Damage =
Random(10 - 20)

Implementasi: nilai MIN = 10 dan MAX = 20 disimpan sebagai konstanta DAMAGE_MIN dan DAMAGE_MAX di damage-calculator.js.

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

Implementasi aktual menggunakan delay per-event (bukan fixed interval):

| Event Type | Delay |
|---|---|
| ACTOR | 400ms |
| TURN_START | 600ms |
| DODGE / MISS | 600ms |
| DEATH / CLONE_DESTROYED | 800ms |
| ATTACK / COUNTER / REFLECT_CHAOS | 900ms |
| CRITICAL | 1100ms |
| DAMAGE / CHAIN_LIGHTNING | 500ms |
| VICTORY / DEFEAT | 1500ms |
| lainnya | 400ms |

Setiap event diproses satu per satu melalui antrian (event queue) dengan setTimeout.

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

---

# 13.4 Animation Sync System (pendingDamage / pendingDeath)

## Masalah

Battle Engine menghitung semua damage dalam satu turn sebelum mengembalikan daftar event. Akibatnya, saat UI me-render tiap event, HP entity sudah dalam keadaan post-damage — animasi muncul terlambat.

## Solusi: pendingDamage

Setiap kali turn baru dimulai, app.js memindai seluruh event queue dan menghitung total damage per entity:

```
pendingDamage[entityName] = jumlah semua damage yang akan terjadi di turn ini
```

Sebelum render tiap event, UI menambahkan pendingDamage kembali ke HP entity sehingga menampilkan nilai pre-damage. Setelah animasi event selesai (pada setTimeout berikutnya), damage dikurangkan dari pendingDamage dan entity menampilkan HP yang sebenarnya.

Alur visual:

1. ATTACK — HP masih pre-damage (100 + 20 = 120, ditampilkan sebagai 100 karena max HP)
2. DAMAGE — animasi impact + float "-20", HP masih pre-damage
3. Event berikutnya — pendingDamage dikurangi, HP menampilkan nilai real (80)

## Solusi: pendingDeath

Entity yang mati dalam satu turn langsung di-set `isAlive = false` oleh engine. Agar kematian tidak tampil sebelum animasi selesai, app.js mencatat entity yang akan mati di `pendingDeath`.

Selama DEATH event berlangsung:

* Render menampilkan entity sebagai "hidup" dengan HP = 0 (bukan "✕ mati")
* Animasi skull "✕" diputar
* Setelah delay DEATH selesai, entity dihapus dari pendingDeath
* Render event berikutnya menampilkan entity sebagai "✕ mati"

Alur visual kematian:

1. ATTACK — proyektil, HP pre-damage
2. DAMAGE — impact, float, HP pre-damage
3. DEATH — entity di 0 HP, animasi skull, pendingDeath dibersihkan
4. Event berikutnya — entity tampil sebagai "✕ mati"

---

# 14. Stage Progression Bonus Skill

## Deskripsi

Setiap kali Hero naik ke Stage berikutnya:

* Hero mendapatkan kesempatan memilih 1 Skill tambahan.
* Sistem menampilkan **2 opsi skill** yang dipilih secara acak dari skill yang belum dimiliki.
* Pemain mengklik salah satu kartu skill untuk mengambilnya.
* Skill yang sudah dipilih sebelumnya tidak akan muncul lagi.
* Pemain dapat memilih untuk melewati (Skip) tanpa mengambil skill.

## Aturan

* Jika semua 11 skill sudah dimiliki, tidak ada skill yang ditawarkan.
* Skill baru langsung aktif saat battle stage berikutnya dimulai.
* Tidak ada batasan jumlah maksimal skill setelah bonus stage. (Awal hanya 4, bisa bertambah).
* Jika hanya 1 skill tersisa yang belum dimiliki, hanya 1 kartu yang ditampilkan.
