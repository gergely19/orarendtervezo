# Webes Órarendtervező Alkalmazás

Ez a projekt egy egyszerű webes alkalmazás hallgatók számára, amely segít a kurzusok kezelésében. Az alábbi lépések segítségével beállítható és használható az alkalmazás:

## Telepítési és Használati Útmutató

### 1. Lokális webszerver indítása
Indítsunk el egy lokális webszervert, például a [XAMPP](https://www.apachefriends.org/) segítségével. Más webszerver is használható, amely támogatja a HTML és JavaScript fájlok futtatását.

### 2. A `script.js` fájl konfigurálása
Nyissuk meg a `script.js` fájlt, és módosítsuk az `errors` dictionary-t az igényeknek megfelelően:
- Azoknak a tantárgyaknak a kurzuskódját, amelyeket NEM szeretnénk megjeleníteni, adjuk hozzá a dictionary-hez.
- Minden kurzuskódhoz adjunk meg egy listát, amely tartalmazza az adott kurzushoz tartozó számokat.

#### Példa:
```javascript
const errors = {
    "IP-18cSZÁMEA1G": [1,2,12], //Számításelmélet Gy
    "IP-18cNM1G": [1,2,3], //Numerikus módszerek Gy
    "IP-18AB1G": [1,2,3,4,5,9,10,11,12], //Adatbázisok I Gy
    "IP-18OPREG": [1,2,3,4,5,6,7,8,9], //Operációs rendszerek Gy
    "IP-18cSZTEG": [1,2,3] //Szoftvertechnologia Ea+Gy
}
```

### 3. A weblap megnyitása
Nyissuk meg a weblapot egy böngészőben. Ehhez másoljuk be a projekt elérési útját a böngésző címsorába (pl. `http://localhost/mappa_neve`).

### 4. Lekérdezések végrehajtása
1. Írjuk be a tantárgy kódját a megadott mezőbe.
2. Kattintsunk a "Lekérdezés" gombra.
3. Az alkalmazás megjeleníti az összes kurzust kurzuskódokkal, színekkel elkülönítve, egy naptár formájában.

### 5. Kurzus törlése
Ha egy kurzust szeretnénk eltávolítani:
- Kattintsunk a naptárban a törölni kívánt kurzusra.
- A kattintás hatására a kurzus törlődik a naptárból.

## Megjegyzések
- Az alkalmazás böngészőben futtatható, és nem igényel külön telepítést.
- A `script.js` fájl helyes konfigurálása kulcsfontosságú a megfelelő működéshez.

