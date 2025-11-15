# Calendar Tasks App

Aplikacja webowa typu Kalendarz + Lista Zadań, stworzona w technologii FastAPI z wykorzystaniem PostgreSQL jako bazy danych oraz autoryzacji JWT.
Projekt pozwala użytkownikom rejestrować się, logować, zarządzać zadaniami w kalendarzu i monitorować status serwera przez WebSocket.

## Funkcjonalności

- Rejestracja, logowanie i zmiana hasła użytkownika (JWT Auth)
- Operacje CRUD na zadaniach (To-Do)
- Widok kalendarza z filtrowaniem po dacie, miesiącu i statusie
- Zadania z kolorami i godzinami
- WebSocket `/ws/status` — zwraca asynchronicznie status serwera w JSON
- Testy jednostkowe z wykorzystaniem `pytest`
- Konfiguracja środowiska przez plik `.env`

## Struktura projektu

```
backend/
│
├── app/
│   ├── api/               # Endpointy FastAPI (auth, tasks, health)
│   ├── core/              # Konfiguracja, JWT, bezpieczeństwo
│   ├── db/                # Modele ORM i inicjalizacja bazy
│   ├── schemas/           # Schematy Pydantic
│   └── main.py            # Główna aplikacja FastAPI
│
├── tests/                 # Testy jednostkowe (pytest)
├── .env                   # Zmienne środowiskowe
├── requirements.txt       # Lista zależności
└── README.md
```

## Konfiguracja środowiska

### 1. Klonowanie projektu
```bash
git clone <adres_repozytorium>
cd backend
```

### 2. Utworzenie wirtualnego środowiska
```bash
python -m venv .venv
.venv\Scripts\activate     # Windows
# lub
source .venv/bin/activate  # Linux / macOS
```

### 3. Instalacja zależności
```bash
pip install -r requirements.txt
```

### 4. Konfiguracja pliku `.env`
Przykład (domyślnie już dodany):

```env
APP_NAME=CalendarAPI
APP_ENV=dev
APP_PORT=8000
APP_HOST=localhost

# JWT
JWT_SECRET=change_me_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=calendar_db
DB_SCHEMA=calendar

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Uruchomienie aplikacji

### Start serwera FastAPI:
```bash
uvicorn app.main:app --reload
```

Serwer wystartuje pod adresem:
http://localhost:8000/

## Uruchomienie testów

Aby sprawdzić poprawność działania całego backendu:

```bash
pytest -v
```

## Dostępne główne endpointy

| Metoda | Endpoint | Opis |
|--------|-----------|------|
| POST | `/api/auth/register` | Rejestracja użytkownika |
| POST | `/api/auth/login` | Logowanie i zwrot tokenu JWT |
| GET | `/api/auth/me` | Pobranie profilu zalogowanego użytkownika |
| POST | `/api/auth/change-password` | Zmiana hasła |
| GET | `/api/tasks` | Pobranie zadań (filtry: `day`, `month`, `completed`) |
| POST | `/api/tasks` | Dodanie nowego zadania |
| PUT | `/api/tasks/{id}` | Aktualizacja zadania |
| DELETE | `/api/tasks/{id}` | Usunięcie zadania |
| WS | `/ws/status` | WebSocket – status serwera |

## Technologie

- FastAPI – nowoczesny framework backendowy
- SQLAlchemy – ORM do obsługi bazy danych
- PostgreSQL
- Pydantic v2 – walidacja i typowanie danych
- Passlib + Bcrypt – haszowanie haseł
- PyJWT – generowanie tokenów JWT
- pytest – testy jednostkowe