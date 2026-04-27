import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import CodeEditor from './components/CodeEditor';
import { login, uploadRepo } from './services/api';
import { UploadCloud, LogIn } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState('// Welcome to AI Code Assistant\n// Write or paste your code here...\n\nfunction calculateFact(n) {\n  if (n <= 1) return 1;\n  return n * calculateFact(n-1);\n}');

  useEffect(() => {
    // Attempt automatic login for demo purposes
    login('admin', 'password').then(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        alert("Uploading repo... This may take a minute.");
        await uploadRepo(file);
        alert("Repository embedded successfully! You can now ask questions about it.");
      } catch (error) {
        alert("Error uploading repo. Make sure the backend is running.");
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full">Connecting to services...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">AI Code Assistant</h1>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md flex items-center gap-2 transition">
            <UploadCloud size={18} />
            <span className="font-semibold">Upload Repo (ZIP)</span>
            <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Code Editor */}
        <div className="w-1/2 h-full border-r border-gray-700">
             <CodeEditor code={currentCode} onChange={setCurrentCode} />
        </div>
        
        {/* Right Pane: Chat */}
        <div className="w-1/2 h-full bg-gray-800 flex flex-col">
             <Chat contextCode={currentCode} setContextCode={setCurrentCode} />
        </div>
      </div>
    </div>
  );
}

export default App;
