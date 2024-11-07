import { createContext, useState, useContext } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ThreeDViewer from './ThreeDViewer';

// Define the context and its type
interface FileContextType {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Three.js web viewer</h1>
      <div className="card">
        <input type="file" onChange={handleFileChange} />
      </div>
      <FileContext.Provider value={{ file, setFile }}>
        <ThreeDViewer />
      </FileContext.Provider>
    </>
  );
}

export default App;

// Custom hook to use the FileContext
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileContext.Provider');
  }
  return context;
};