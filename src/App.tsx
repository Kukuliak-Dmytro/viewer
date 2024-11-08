import { createContext, useState, useContext,useRef } from 'react';
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
  const fileRef=useRef(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      fileRef.current.value=e.target.files[0].name
    }
  };
    const handleFileClose = () => {
      setFile(null);
      fileRef.current.value=''

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
        <span>
          <label htmlFor="file">Choose file</label>
          <input type="text" disabled ref={fileRef} />
          <input type="file" onChange={handleFileChange} id='file'/>
        </span>
        <button onClick={handleFileClose}>Close</button>
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