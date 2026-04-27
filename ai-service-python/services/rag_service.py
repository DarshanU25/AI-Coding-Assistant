import os
import zipfile
import tempfile
import shutil
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self):
        self._embeddings = None
        self.vector_store = None
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
        
    @property
    def embeddings(self):
        if self._embeddings is None:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self._embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        return self._embeddings
        
    def embed_repository(self, zip_path: str):
        extract_dir = tempfile.mkdtemp()
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
                
            documents = []
            valid_extensions = ('.py', '.java', '.js', '.jsx', '.ts', '.tsx', '.md', '.html', '.css', '.json')
            for root, _, files in os.walk(extract_dir):
                for file in files:
                    if file.endswith(valid_extensions):
                        file_path = os.path.join(root, file)
                        try:
                            # Using auto encoding fallback or explicit utf-8
                            loader = TextLoader(file_path, autodetect_encoding=True)
                            docs = loader.load()
                            # Tag documents with relative file path
                            for doc in docs:
                                rel_path = os.path.relpath(file_path, extract_dir)
                                doc.metadata["source"] = rel_path
                            documents.extend(docs)
                        except Exception as e:
                            print(f"Failed to load {file_path}: {e}")
            
            if not documents:
                raise ValueError("No valid code files found to embed.")

            # Chunk intelligently avoiding breaking functions mid-way if possible
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            chunks = text_splitter.split_documents(documents)
            
            # Embed using local sentence transformer model and store in FAISS index in memory
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
            
            return {"files_processed": len(documents), "chunks_created": len(chunks)}
        finally:
            shutil.rmtree(extract_dir)

    def query(self, query: str, context: str = None) -> str:
        # If user is asking something strictly about the current editor context
        if context and len(context.strip()) > 0:
            prompt = f"You are a helpful AI coding assistant.\n\nContext block:\n{context}\n\nQuestion:\n{query}\n\nAnswer:"
            return self.llm.invoke(prompt).content
            
        # If user queries global repo
        if not self.vector_store:
            # Fallback to general LLM response if no repo is indexed
            return self.llm.invoke(query).content
            
        docs = self.vector_store.similarity_search(query, k=5)
        context_docs = "\n\n".join([f"Path: {d.metadata.get('source', '')}\n```\n{d.page_content}\n```" for d in docs])
        
        qa_prompt = f"Use the following pieces of context from the codebase to answer the user's question.\n\nContext:\n{context_docs}\n\nQuestion: {query}\n\nAnswer:"
        return self.llm.invoke(qa_prompt).content
