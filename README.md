# AI Code Assistant

A production-ready microservices-based AI code assistant featuring RAG capabilities over your repositories and agentic actions (refactoring, explaining, optimizing, debugging, generating tests, and documenting).

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Monaco Editor
- **Backend Layer**: Java Spring Boot (Proxy & JWT Authentication)
- **AI Analytics Service**: Python FastAPI (LangChain, FAISS, Sentence-Transformers, OpenAI)

---

## 🛠️ Setup Instructions & Local Run Guide

### PREREQUISITES
1. **Java 17** & **Maven**
2. **Python 3.9+**
3. **Node.js 18+**
4. An **OpenAI API Key** (set as an environment variable or in a `.env` file).

### 1. Python AI Service
**Role**: Provides RAG embeddings (FAISS) and LLM logic via Langchain.

```bash
cd ai-service-python
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file containing your OpenAI key
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Run the FastAPI server (runs on port 8000)
python main.py
```

### 2. Java Backend
**Role**: API Gateway & Authentication via JWT.

```bash
cd backend-java

# Ensure the Python service URL is correct in src/main/resources/application.yml (defaults to localhost:8000)

# Build and run using Maven Wrapper or local Maven
mvn clean install
mvn spring-boot:run
# Server runs on port 8080
```

### 3. Frontend
**Role**: UI, Chat interface, and Monaco Code Editor.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Vite runs on port 5173
```

---

## 🔌 Sample API Requests

### 1. Authentication (Login)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\", \"password\":\"password\"}"
  
# Returns: {"token": "eyJhbGciOiJIUz... "}
```

### 2. Upload Repository (RAG Embedding)
*Requires the JWT token from the previous step.*
```bash
curl -X POST http://localhost:8080/api/upload/repo \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@/path/to/your/project.zip"
```

### 3. Query Repository (RAG Context)
```bash
curl -X POST http://localhost:8080/api/chat/query \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"What does the Auth service do?\", \"context\": \"\"}"
```

### 4. Agentic Context Action (e.g. Refactor)
```bash
curl -X POST http://localhost:8080/api/agent/execute \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
        \"intent\": \"refactor\", 
        \"code\": \"function isEven(n) { if(n % 2 == 0) return true; else return false; }\", 
        \"context\": \"\"
      }"
```

---

## 🎨 Implemented Capabilities
- **Chat UI**: Built-in chat experience directly in React using React-Markdown.
- **Code Context Actions**: Integrated toolbar in the chat for sending raw codes off for debug, optimization, generation via LLMs.
- **Secure Authentication Layer**: Java gateway sits before the Python analytics service to ensure endpoints are authenticated.
- **Vector Search RAG**: Unzips, parses extensions efficiently, chunks by length recursively, and answers questions using FAISS locally. 
