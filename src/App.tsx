import { createContext, useState, useContext, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ThreeDViewer from './ThreeDViewer';
import { select } from 'three/webgpu';

// Define the context and its type
interface FileContextType {
  file: File | null;
  fileName: string | null;
  setFile: (file: File | null) => void;
}
const FileContext = createContext<FileContextType | undefined>(undefined);

function App() {
  //file itself
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  //label for the file
  const fileRef = useRef<HTMLInputElement>(null)
  const selectRef=useRef<HTMLSelectElement>(null)
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      fileRef.current.value = e.target.files[0].name
      selectRef.current.value = '';
    }
  };
  const handleFileClose = () => {
    setFile(null);
    setFileName(null);
    fileRef.current.value = ''
    selectRef.current.value = '';


  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileName = e.target.value;
    console.log(fileName)
    if (fileName) {
      setFile(null)
      setFileName(fileName);
      fileRef.current.value = fileName
    } else {
      setFile(null);
      setFileName(null);
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
        <span>
          <label htmlFor="file">Choose file</label>
          <input type="text" disabled ref={fileRef} />
          <input type="file" onChange={handleFileChange} id='file' />
        </span>
        <select name="fileSelect" id="select" onChange={handleFileSelect}ref={selectRef} >
          <option value="">Select a model</option>
          <option value="charmander.stl">Charmander</option>
          <option value="cup.stl">Cup</option>
          <option value="keycap.stl">Keycap</option>
          <option value="squirtle.stl">Squirtle</option>
          <option value="bowl.stl">Bowl</option>
          <option value="bulbasaur.stl">Bulbasaur</option>

        </select>
        <button onClick={handleFileClose}>Close</button>
      </div>
      <FileContext.Provider value={{ file, setFile,fileName }}>
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