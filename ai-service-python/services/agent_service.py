from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

class AgentService:
    def __init__(self):
        # We rely on Gemini 2.5 Flash for better reasoning in refactoring, debugging, etc.
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
        
    def execute(self, intent: str, code: str, context: str = None) -> str:
        templates = {
            "explain": "Explain the following code in simple terms. Break down complex parts.\n\nCode:\n{code}\n\nExplanation:",
            "optimize": "Analyze the following code for inefficiencies (time/space complexity, readability) and provide an optimized version with explanations.\n\nCode:\n{code}\n\nOptimized Output:",
            "debug": "Find any potential logical or syntax bugs in the following code and provide a fix. Explain what was wrong.\n\nCode:\n{code}\n\nBug Fixes:",
            "test": "Generate comprehensive unit tests for the following code. Use standard testing frameworks applicable to the language.\n\nCode:\n{code}\n\nUnit Tests:",
            "document": "Add professional documentation and comments to the following code. Ensure proper docstrings.\n\nCode:\n{code}\n\nDocumented Code:",
            "refactor": "Refactor the following code to make it cleaner, more maintainable, and conform to standard best practices.\n\nCode:\n{code}\n\nRefactored Code:"
        }
        
        template_str = templates.get(intent.lower())
        if not template_str:
            template_str = f"Perform the requested action '{intent}' on the following code snippet:\n\nCode:\n{{code}}\n\nResult:"
            
        if context:
            template_str = f"Background Context:\n{context}\n\n" + template_str
            
        prompt = PromptTemplate(template=template_str, input_variables=["code"])
        filled_prompt = prompt.format(code=code)
        
        response = self.llm.invoke(filled_prompt)
        return response.content
