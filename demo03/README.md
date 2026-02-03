# Demo 3: Tiedostojen upload

>Huom! Johtuen .env -tiedoston puuttumisesta tee seuraavat toimenpiteet demon toimimiseksi!

1. Luo `.env`-tiedosto palvelimen juureen
2. Lisää tiedostoon rivi
    - DATABASE_URL="file:./dev.db"

Prisman tietokannan voi alustaa poistamalla `dev.db`-tiedoston ja `migrations`-kansion prisma-kansion alta ja suorittamalla komennot:

1. `npx prisma migrate dev --name init`
2. `npx prisma generate`