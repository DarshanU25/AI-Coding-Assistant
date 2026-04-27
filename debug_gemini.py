from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import traceback
import os

print("Dir:", os.getcwd())
load_dotenv()
print("API KEY:", os.environ.get("GOOGLE_API_KEY", "NOT_FOUND")[:10])

try:
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.2)
    templates = {
        "explain": "Explain the following code in simple terms. Break down complex parts.\n\nCode:\n{code}\n\nExplanation:"
    }
    template_str = templates.get("explain")
    prompt = PromptTemplate(template=template_str, input_variables=["code"])
    filled_prompt = prompt.format(code="def hello(): pass")
    
    response = llm.invoke(filled_prompt)
    print("SUCCESS")
    print(response.content)
except Exception as e:
    print("FAILED EXCEPTION:")
    traceback.print_exc()
