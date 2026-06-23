# Code Lyoko Social Game Inspired - Battle Prototype MVP

## 1. Tujuan Project

Membuat prototype game browser berbasis auto battle yang terinspirasi dari Code Lyoko Social Game.

Fokus MVP hanya pada:

* Core Battle Engine
* Hero Selection
* Skill Selection
* Battle Simulation
* Battle Replay Visualization
* Stage Progression

Tidak perlu:

* Login
* Database
* Multiplayer
* Equipment
* Inventory
* Quest
* Guild
* Shop
* Save Data

Semua data dapat disimpan sementara di memory browser.

---

# 2. Konsep Permainan

Pemain memilih:

* 1 Hero
* Maksimal 4 Passive Skill

Setelah tombol Start ditekan:

1. Sistem membuat seluruh konfigurasi battle.
2. Sistem menghasilkan musuh berdasarkan stage.
3. Battle Engine mulai berjalan.
4. Battle Log dicatat setiap aksi.
5. UI menampilkan pertarungan secara visual.
6. Sistem menentukan pemenang.
7. Hasil pertarungan ditampilkan.
8. Pemain dapat melanjutkan stage berikutnya atau retry.

---

# 3. Teknologi MVP

## Frontend

* HTML
* CSS
* Vanilla JavaScript

## Arsitektur

Battle Engine dipisahkan dari UI.

Folder Structure:

/src
/engine
battle-engine.js
turn-manager.js
damage-calculator.js

```
/models
    hero.js
    enemy.js
    skill.js

/systems
    skill-system.js
    effect-system.js
    stage-generator.js

/ui
    renderer.js
    battle-log.js

app.js
```

---

# 4. Tampilan MVP

Hero direpresentasikan menggunakan:

O

Musuh direpresentasikan menggunakan:

X

Contoh:

O

HP: 100

---

X    X    X

HP   HP   HP

---

Battle Log

Hero attacks Enemy #1
Damage 12

Enemy #1 attacks Hero
Damage 8

---

# 5. Flow Permainan

## State 1

Hero Selection

Pemain memilih Hero.

Untuk MVP hanya tersedia:

Hero Alpha

---

## State 2

Skill Selection

Pemain memilih maksimal 4 skill.

---

## State 3

Battle Start

Battle Engine dibuat.

---

## State 4

Battle Running

Battle berjalan otomatis.

---

## State 5

Battle Result

Menampilkan:

* Winner
* Total Damage
* Critical Hit
* Dodge Count
* Counter Count

---

## State 6

Next Stage

Atau Retry.

---

# 6. Hero Base Stat

Hero Alpha

HP: 100
Speed: 50
Accuracy: 50%

Crit Chance: 5%
Dodge Chance: 1%
Counter Chance: 1%

Clone Chance: 0%
Shock Chance: 0%
Freeze Charge: 0
True Hit Charge: 0

Redirect Chance: 1%

---

# 7. Enemy Generation

Setiap stage menghasilkan musuh secara random.

## HP

80 - 120

## Speed

40 - 60

## Accuracy

40% - 60%

## Crit Chance

0% - 10%

## Dodge Chance

0% - 10%

## Counter Chance

0% - 10%

---

# 8. Stage System

Stage 1

1 Enemy

Stage 2

2 Enemy

Stage 3

3 Enemy

Stage 4

4 Enemy

Stage 5

Boss

Kemudian loop kembali dengan scaling stat.

---

# 9. Battle Rules

## Turn Order

Ditentukan berdasarkan Speed.

Semakin tinggi Speed semakin cepat mendapatkan giliran.

---

## Targeting

Hero dan musuh dapat menyerang target secara dinamis.

Saat giliran Hero:
- Target dipilih secara acak dari musuh yang masih hidup.
- Probabilitas ditentukan oleh sistem (setiap musuh memiliki kesempatan yang sama).

Saat giliran Musuh:
- Jika ada Clone, musuh wajib menyerang Clone terlebih dahulu.
- Jika tidak ada Clone, musuh menyerang Hero.

---

## Accuracy Check

Saat menyerang:

Hit Chance =

Accuracy - Dodge Chance

Jika gagal:

MISS

---

## Critical Check

Jika berhasil mengenai target:

Damage x 2

---

## Counter Check

Saat menerima serangan:

Counter Chance

Jika berhasil:

Serangan langsung dibalas.

---

## Death

HP <= 0

Karakter mati.

---

## Victory

Semua musuh mati.

---

## Defeat

Hero mati.

---

# 10. Damage Formula

Formula awal:

Damage =
10 + Random(1 - 10)

Critical:

Damage x 2

---

# 11. Skill System

Pemain memilih maksimal 4 skill.

---

## Skill 1

Quick Reflex

Effect:

Speed +10

---

## Skill 2

Agile

Effect:

Dodge +10%

---

## Skill 3

Counter Master

Effect:

Counter +10%

---

## Skill 4

Shadow Clone

Battle Start:

5% chance aktif.

Jika aktif:

Memunculkan 1 - 3 Clone.

Clone menerima serangan sebelum Hero.

Clone memiliki:

HP = 1

Jika terkena serangan langsung hilang.

---

## Skill 5

Chain Lightning

Saat menyerang:

5% chance aktif.

Jika aktif:

Target utama menerima damage penuh.

Musuh lain menerima:

50% damage.

---

## Skill 6

Sharpshooter

Effect:

Accuracy +10%

Crit Chance +10%

---

## Skill 7

Hunter

Effect:

Mengurangi Dodge musuh sebesar 10%.

---

## Skill 8

Frost Control

Saat battle dimulai:

Mendapatkan 1 - 3 Freeze Charge.

Saat charge digunakan:

Target kehilangan 1 turn.

---

## Skill 9

True Strike

Saat battle dimulai:

Mendapatkan 1 - 3 True Hit Charge.

Saat digunakan:

Serangan pasti mengenai target.

---

## Skill 10

Reflect Chaos

Saat terkena serangan:

10% chance aktif.

Jika aktif:

90% damage dikembalikan ke musuh.

10% damage tetap diterima Hero.

---

## Skill 11

Vitality

Effect:

HP +10

---

# 12. Battle Log Format

Contoh (target dipilih secara dinamis):

[Turn 1]

Hero attacks Enemy #2

Damage 12

Enemy #2 HP = 88

[Turn 2]

Enemy #1 attacks Hero

Damage 8

Hero HP = 92

[Turn 3]

Hero attacks Enemy #1 (Critical Hit)

Damage 24

Enemy #1 HP = 76

---

# 13. Battle Replay System

Battle Engine wajib menyimpan seluruh event.

Contoh:

events = [
attack,
damage,
critical,
dodge,
freeze,
death
]

UI hanya membaca event tersebut.

Dengan cara ini:

Battle Engine dan UI terpisah.

---

# 14. MVP Success Criteria

Prototype dianggap berhasil jika:

✓ Hero dapat dipilih

✓ Maksimal 4 skill dapat dipilih

✓ Musuh dapat dibuat random

✓ Battle dapat berjalan otomatis

✓ Battle log tampil

✓ Winner dapat ditentukan

✓ Retry berfungsi

✓ Next Stage berfungsi

✓ Semua skill dapat aktif sesuai probabilitas

✓ Battle dapat diputar ulang menggunakan event log

---

# 15. Future Development

Setelah MVP selesai:

Phase 2

* Hero Class
* Equipment
* Level System
* Skill Tree
* Sector System
* Boss Mechanic

Phase 3

* Account System
* Inventory
* Save Progress
* PvP Arena

Phase 4

* Multiplayer
* Guild
* Ranking
* Seasonal Event
