
Simple chat bot. 

Stack:

- React
- Fast API

Purpose:

Create API bot with custom system prompt for workshop.

Instructions to run it Local:

Backend:

Install:

Create .env

```bash
API_KEY = '<Open AI>'
SYSTEM_PROMPT = '<ChatGPT instructions>'
```

Windows:
```bash
cd lambda
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
```

Run: 
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Frontend:

Install:
```bash
cd react-client
npm install
npm run start
```

Run:

```bash
npm run start
```

