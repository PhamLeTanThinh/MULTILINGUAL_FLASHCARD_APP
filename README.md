
# Multilingual Flashcard Learning App

Ứng dụng học từ vựng đa ngôn ngữ (Anh, Trung, Hàn, Nhật) với backend FastAPI và frontend Next.js.

---

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Tech Stack](#tech-stack)
3. [Cấu trúc Project](#cấu-trúc-project)
4. [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)
5. [Tính năng chính](#tính-năng-chính)
6. [Triển khai (Deployment)](#triển-khai-deployment)
7. [Tài liệu chi tiết](#tài-liệu-chi-tiết)

---

## 🎯 Tổng quan
Hệ thống học từ vựng đa ngôn ngữ (Anh, Trung, Hàn, Nhật) với các tính năng quản lý flashcard, tra cứu từ điển, phát âm, và học tập hiệu quả.

## 🛠️ Tech Stack
**Frontend:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand, React Query, Axios, Papa Parse

**Backend:**
- FastAPI (Python 3.10+), SQLAlchemy, SQLite
- Pydantic, gTTS, pypinyin, pykakasi, hangul-romanize

**Từ điển & API:**
- CC-CEDICT, JMdict, Google Translate API

## 📁 Cấu trúc Project
```
flashcard-app/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── database.py        # DB connection
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Database operations
│   │   ├── routers/
│   │   │   ├── users.py       # User endpoints
│   │   │   ├── decks.py       # Deck endpoints
│   │   │   ├── flashcards.py  # Flashcard endpoints
│   │   │   ├── dictionary.py  # Dictionary search
│   │   │   └── tts.py         # Text-to-speech
│   │   ├── services/
│   │   │   ├── ai_example_generator.py
│   │   │   ├── cleanup_service.py
│   │   │   ├── dictionary_service.py
│   │   │   ├── pronunciation.py
│   │   │   └── tts_service.py
│   │   └── utils/
│   │       └── csv_parser.py
│   ├── data/
│   │   ├── cedict.txt         # Chinese dictionary
│   │   └── jmdict.json        # Japanese dictionary
│   ├── requirements.txt
│   └── .env
│
└── frontend/                   # Next.js
	├── src/
	│   ├── app/
	│   │   ├── layout.tsx
	│   │   ├── page.tsx       # Home/User selection
	│   │   ├── users/
	│   │   │   └── [userId]/
	│   │   │       └── decks/
	│   │   │           └── [deckId]/
	│   │   │               ├── page.tsx
	│   │   │               └── study/
	│   │   │                   └── page.tsx
	│   ├── components/
	│   │   ├── ui/
	│   │   ├── UserCard.tsx
	│   │   ├── DeckCard.tsx
	│   │   ├── FlashCard.tsx
	│   │   ├── CSVImport.tsx
	│   │   ├── DictionarySearch.tsx
	│   │   └── LanguageSelector.tsx
	│   ├── lib/
	│   │   ├── api.ts         # API client
	│   │   └── utils.ts
	│   ├── store/
	│   │   └── useStore.ts    # Zustand store
	│   └── types/
	│       └── index.ts       # TypeScript types
	├── public/
	├── package.json
	├── tailwind.config.ts
	├── tsconfig.json
	└── next.config.js
```

## 🚀 Cài đặt & Khởi chạy

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
echo "DATABASE_URL=sqlite:///./flashcard.db" > .env
echo "BACKEND_PORT=8000" >> .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env
uvicorn app.main:app --reload --port 8000
```
Truy cập: http://localhost:8000  (API docs: /docs)

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```
Truy cập: http://localhost:3000

## 🎨 Tính năng chính
- Quản lý Users, Decks, Flashcards (CRUD)
- Import CSV, tra cứu từ điển
- Tự động phát âm, Text-to-Speech
- Flip card animation, UI chuyên nghiệp (Tailwind + shadcn/ui)
- TypeScript, API docs, dễ mở rộng

## ☁️ Triển khai (Deployment)

**Backend:**
- Railway, Render, Fly.io (xem hướng dẫn chi tiết trong `MULTILINGUAL_FLASHCARD_APP.md`)

**Frontend:**
- Vercel (khuyên dùng)

## 📚 Tài liệu chi tiết
Xem thêm hướng dẫn, API, ví dụ CSV, tips... trong file [`MULTILINGUAL_FLASHCARD_APP.md`](./MULTILINGUAL_FLASHCARD_APP.md).
