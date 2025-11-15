# Calendar Tasks App – frontend

Frontend aplikacji do zarządzania zadaniami dziennymi oraz w widoku kalendarza.  
Zbudowany w **React + Vite**, z użyciem **React-Bootstrap** oraz **date-fns**.

Backend (FastAPI) dostarcza API oraz websocket do statusu serwera.

---

## Stos technologiczny

- React 18 + Vite
- React Router DOM – routing
- React-Bootstrap + Bootstrap 5 – UI
- Axios – komunikacja z API (z interceptorami JWT)
- date-fns (+ `pl` locale) – operacje na datach
- WebSocket – status backendu (`/ws/status`)

---

## Wymagania

- Node.js w wersji `>= 18`
- npm lub yarn
- Działający backend z API pod adresem ustawionym w `VITE_API_URL`
  (np. `http://localhost:8000` dla FastAPI)

---

## Instalacja

W katalogu głównym projektu:

    cd frontend
    npm install

---

## Konfiguracja środowiska

W katalogu `frontend` utwórz plik `.env` z zawartością:

    VITE_API_URL=http://localhost:8000

Aplikacja korzysta z tego adresu w:

- `src/api/axios.js`
- `src/components/StatusWs.jsx`

---

## Uruchomienie w trybie deweloperskim

    npm run dev

Aplikacja będzie dostępna pod adresem:

    http://localhost:5173

---

## Struktura projektu

    frontend/
    ├─ public/
    │  └─ planning.png          # logo
    ├─ src/
    │  ├─ api/
    │  │  └─ axios.js           # axios z JWT interceptorami
    │  ├─ assets/
    │  ├─ components/
    │  │  ├─ StatusWs.jsx       # online/offline (WebSocket)
    │  │  └─ TaskItem.jsx       # pojedyncze zadanie
    │  ├─ contexts/
    │  │  └─ AuthContext.jsx    # logowanie / profil / tokeny
    │  ├─ pages/
    │  │  ├─ Today.jsx          # zadania na dziś + modal CRUD
    │  │  ├─ Calendar.jsx       # widok kalendarza + zadania per dzień
    │  │  ├─ Profile.jsx        # edycja profilu i hasła
    │  │  ├─ Login.jsx
    │  │  └─ Register.jsx
    │  ├─ utils/
    │  │  └─ date.js            # helpery dat
    │  ├─ App.jsx               # routing + navbar
    │  ├─ App.css               # style UI, karty zadań, kalendarz, navbar
    │  ├─ index.css
    │  └─ main.jsx
    ├─ index.html
    └─ package.json

---

## Funkcjonalności

### Uwierzytelnianie (AuthContext)

- Rejestracja i logowanie użytkownika
- JWT (`access_token`) przechowywany w `localStorage`
- Profil użytkownika (`user`) przechowywany w `localStorage` po wywołaniu `/api/auth/me`
- `AuthContext` udostępnia:
    - `login(email, password)`
    - `register({ email, first_name, last_name, password })`
    - `refreshMe()`
    - `logout()`

Interceptory axios (`src/api/axios.js`):

- przed wysłaniem żądania – jeśli w `localStorage` jest `access_token`,
  dodawany jest nagłówek `Authorization: Bearer <token>`
- przy odpowiedzi `401` – token i profil są czyszczone z `localStorage`

Strony wymagające logowania są chronione przez `ProtectedRoute` w `App.jsx`
(`"/"`, `"/calendar"`, `"/profile"`).

---

### Lista zadań na dziś – `Today.jsx`

- Pobieranie zadań dla dzisiejszej daty (`/api/tasks?day=YYYY-MM-DD`)
- Modal dodawania i edycji zadania
- Walidacja formularza:
    - wymagane: Tytuł, Opis
    - opcjonalna godzina – jeśli wpisana, musi mieć format `HH:MM` (24h)
- Możliwość ustawienia koloru zadania:
    - przełącznik „Użyj koloru”
    - kolor wysyłany tylko gdy przełącznik jest włączony
- Przy edycji można oznaczyć zadanie jako ukończone
- Zadania ukończone:
    - są przygaszone
    - mają przekreślenie po przekątnej

---

### Widok kalendarza – `Calendar.jsx`

- Widok miesiąca
- Pobieranie zadań dla całego miesiąca (`/api/tasks?month=YYYY-MM`)
- Badge z liczbą zadań na każdy dzień
- Po kliknięciu dnia:
    - ustawiany jest `selectedDay`
    - pod kalendarzem wyświetlana jest lista zadań dla tego dnia
    - dostępny jest modal dodawania/edycji z tą samą walidacją co w `Today.jsx`
- Możliwość:
    - dodawania nowych zadań
    - edycji istniejących
    - oznaczania jako ukończone
    - usuwania zadań

---

### Profil użytkownika – `Profile.jsx`

- Edycja danych profilu (imię, nazwisko) – `PUT /api/auth/me`
- Po zapisie profil jest odświeżany przez `refreshMe()`
- Zmiana hasła – `POST /api/auth/change-password`
    - po udanej zmianie użytkownik jest wylogowywany

---

### Status backendu – `StatusWs.jsx`

- WebSocket na endpoint `/ws/status`
- Adres WS budowany na podstawie `VITE_API_URL`
  (zamiana `http` -> `ws`, `https` -> `wss`)
- Badge:
    - zielony „Online”, gdy połączenie jest aktywne i status to `ok`
    - szary „Offline” w pozostałych przypadkach
- Prosty mechanizm reconnectu co 2 sekundy przy utracie połączenia
- Zamknięcie połączenia i sprzątanie przy odmontowaniu komponentu

---

### Navbar – `App.jsx`

- Pełna szerokość (full-bleed) i sticky na górze ekranu
- Po lewej stronie:
    - logo aplikacji (`planning.png`)
    - napis „Calendar Tasks App”
- Linki nawigacji:
    - „Dzisiejszy task-list”
    - „Kalendarz”
    - „Profil”
    - „Logowanie” / „Rejestracja” w zależności od stanu zalogowania
- Po prawej stronie:
    - badge Online/Offline
    - tekst „Witaj {imię}”
    - przycisk „Wyloguj”

---

## Uruchamianie razem z backendem FastAPI

Przykładowy flow:

1. Uruchom backend:

       uvicorn main:app --host 0.0.0.0 --port 8000 --reload

2. Ustaw w pliku `frontend/.env`:

       VITE_API_URL=http://localhost:8000

3. W katalogu `frontend` uruchom:

       npm install
       npm run dev

4. Wejdź w przeglądarce na:

       http://localhost:5173

---
