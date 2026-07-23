// src/App.jsx v2.3
/*
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v2.3 수정사항): 현재 선택된 파일 경로(selectedFile)를 헤더에 표시하기 위해 Prop으로 전달합니다.
 */
import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import FileExplorer from './components/explorer/FileExplorer';
import OutlineMinimap from './components/editor/OutlineMinimap';
import { useOutline } from './hooks/editor/useOutline';
import { fetchFileContent } from './api/fileApi';
import './App.css';

function App() {
  console.log("App 컴포넌트(v2.3) 렌더링 시작 - 헤더 파일명 표시 패치 적용");
  
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  const textareaRef = useRef(null);
  const outlineData = useOutline(markdown);

  const handleSelectFile = async (filePath) => {
    console.log(`[App v2.3] 파일 선택됨: ${filePath}`);
    try {
      const content = await fetchFileContent(filePath);
      setSelectedFile(filePath);
      setMarkdown(content);
    } catch (error) {
      console.error("파일 로드 실패 (초기 test.md 파일이 없을 수 있습니다):", error);
    }
  };

  useEffect(() => {
    console.log("[App v2.3] 초기 설정: test.md 기본 로드 시도");
    handleSelectFile('test.md');
  }, []);

  return (
    <div className="app-layout">
      <Header 
        markdown={markdown} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        isExplorerOpen={isExplorerOpen}
        setIsExplorerOpen={setIsExplorerOpen}
        selectedFile={selectedFile}
      />
      
      <main className="workspace">
        
        <FileExplorer 
          isExplorerOpen={isExplorerOpen} 
          onSelectFile={handleSelectFile} 
        />

        <div className={`main-content mode-${viewMode}`}>
          {viewMode !== 'editor' && (
            <div className="pane preview-pane">
              <Preview markdown={markdown} />
            </div>
          )}
          
          {viewMode !== 'preview' && (
            <div className="pane editor-pane">
              <Editor 
                markdown={markdown} 
                setMarkdown={setMarkdown} 
                selectedFile={selectedFile}
                textareaRef={textareaRef}
              />
            </div>
          )}
        </div>

        <OutlineMinimap 
          outline={outlineData} 
          textareaRef={textareaRef} 
        />
      </main>
    </div>
  );
}

export default App;