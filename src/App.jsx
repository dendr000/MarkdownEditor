// src/App.jsx v2.1
/*
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v2.1 수정사항): 별도로 분리되었던 뷰 모드 컨트롤 바를 삭제하고, 탐색기 슬라이드 토글 상태를 추가하여 헤더에 위임했습니다.
 */
import { useState, useRef } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import FileExplorer from './components/explorer/FileExplorer';
import OutlineMinimap from './components/editor/OutlineMinimap';
import { useOutline } from './hooks/editor/useOutline';
import { fetchFileContent } from './api/fileApi';
import './App.css';

function App() {
  console.log("App 컴포넌트(v2.1) 렌더링 시작 - UI 간소화 적용");
  
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true); // 탐색기 토글 상태
  
  const textareaRef = useRef(null);
  const outlineData = useOutline(markdown);

  const handleSelectFile = async (filePath) => {
    console.log(`[App v2.1] 파일 선택됨: ${filePath}`);
    try {
      const content = await fetchFileContent(filePath);
      setSelectedFile(filePath);
      setMarkdown(content);
    } catch (error) {
      console.error("파일 로드 실패:", error);
    }
  };

  return (
    <div className="app-layout">
      {/* 헤더에 뷰 모드와 탐색기 상태 제어권 이관 */}
      <Header 
        markdown={markdown} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        isExplorerOpen={isExplorerOpen}
        setIsExplorerOpen={setIsExplorerOpen}
      />
      
      <main className="workspace">
        
        {/* 1단: 파일 탐색기 (좌측 슬라이드 서랍) */}
        <FileExplorer 
          isExplorerOpen={isExplorerOpen} 
          onSelectFile={handleSelectFile} 
        />

        {/* 2단: 중앙 에디터/뷰어 패널 */}
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

        {/* 3단: 우측 목차 서랍 */}
        <OutlineMinimap 
          outline={outlineData} 
          textareaRef={textareaRef} 
        />
      </main>
    </div>
  );
}

export default App;