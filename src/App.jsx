// src/App.jsx v3.2
/*
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v3.2 수정사항): 문법 에러 수정 및 비대해진 파일 크기를 줄이기 위해 파일 로드 및 스크롤 동기화 로직을 커스텀 훅으로 분리했습니다.
 */
import { useState, useRef } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import FileExplorer from './components/explorer/FileExplorer';
import OutlineMinimap from './components/editor/OutlineMinimap';
import SqlViewer from './components/preview/SqlViewer'; // [신규] SQL 전용 시각화 뷰어 임포트
import CodeViewer from './components/preview/CodeViewer'; // [신규] 개발 코드 전용 뷰어 임포트
import { useOutline } from './hooks/editor/useOutline';
import { useFileLoader } from './hooks/app/useFileLoader';
import { useScrollSync } from './hooks/app/useScrollSync';
import './App.css';

function App() {
  console.log("App 컴포넌트(v3.2) 렌더링 시작 - 로직 분리 및 500 에러 패치 적용");
  
  // 글로벌 상태 관리
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  // DOM Refs
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  
  // 설정 상태 관리
  const [isSyncScroll, setIsSyncScroll] = useState(true);
  const [isExplorerAutoClose, setIsExplorerAutoClose] = useState(false);
  
  // 탐색기 크기 및 고정(Pin) 상태 관리
  const [explorerWidth, setExplorerWidth] = useState(260); 
  const [isExplorerPinned, setIsExplorerPinned] = useState(false); 
  const [isResizing, setIsResizing] = useState(false);

  // 분리된 커스텀 훅 연결
  const outlineData = useOutline(markdown);
  const { handleSelectFile } = useFileLoader(setMarkdown, setSelectedFile);
  useScrollSync(textareaRef, previewRef, isSyncScroll, viewMode, markdown);

  // [신규] 현재 선택된 파일이 개발 코드 파일인지 판별하여 에디터와 뷰어의 렌더링 분기에 사용합니다.
  const fileExt = selectedFile ? selectedFile.split('.').pop().toLowerCase() : 'md';
  const codeExtensions = ['java', 'py', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'sh', 'yaml', 'yml', 'xml', 'ini', 'env', 'properties', 'bat', 'cmd', 'json', 'html', 'css', 'js', 'jsx', 'ts', 'tsx'];
  const isCodeFile = codeExtensions.includes(fileExt);

  return (
    <div className="app-layout">
      <Header 
        markdown={markdown} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        isExplorerOpen={isExplorerOpen}
        setIsExplorerOpen={setIsExplorerOpen}
        selectedFile={selectedFile}
        isSyncScroll={isSyncScroll}
        setIsSyncScroll={setIsSyncScroll}
        isExplorerAutoClose={isExplorerAutoClose}
        setIsExplorerAutoClose={setIsExplorerAutoClose}
        onBreadcrumbClick={(path) => handleSelectFile(path, false)}
      />
      
      <main 
        className="workspace" 
        onClick={(e) => {
          if (isExplorerAutoClose && isExplorerOpen && !isExplorerPinned) {
            if (!e.target.closest('.file-explorer-container')) {
              setIsExplorerOpen(false);
            }
          }
        }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <FileExplorer 
          isExplorerOpen={isExplorerOpen} 
          onSelectFile={(path) => handleSelectFile(path, false)} 
          selectedFile={selectedFile}
          explorerWidth={explorerWidth}
          setExplorerWidth={setExplorerWidth}
          isExplorerPinned={isExplorerPinned}
          setIsExplorerPinned={setIsExplorerPinned}
          setIsResizing={setIsResizing}
        />

        <div 
          className={`main-content mode-${viewMode}`}
          style={{ 
            width: isExplorerPinned && isExplorerOpen ? `calc(100% - ${explorerWidth}px)` : '100%', 
            marginLeft: isExplorerPinned && isExplorerOpen ? `${explorerWidth}px` : '0', 
            transition: isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
        >
          {viewMode !== 'editor' && (
            <div className="pane preview-pane">
              {/* [수정] 확장자에 따라 SQL 뷰어, 개발 코드 뷰어, 마크다운 뷰어를 완전히 분기하여 출력합니다. */}
              {selectedFile && selectedFile.toLowerCase().endsWith('.sql') ? (
                <SqlViewer sql={markdown} />
              ) : isCodeFile ? (
                <CodeViewer content={markdown} fileExt={fileExt} previewRef={previewRef} />
              ) : (
                <Preview 
                  markdown={markdown} 
                  selectedFile={selectedFile} 
                  onSelectFile={(path) => handleSelectFile(path, false)}
                  previewRef={previewRef}
                />
              )}
            </div>
          )}
          
          {viewMode !== 'preview' && (
            <div className="pane editor-pane">
              {/* [수정] 에디터 내부에 isCodeFile 속성을 전달하여 툴바 출력 여부를 제어합니다. */}
              <Editor 
                markdown={markdown} 
                setMarkdown={setMarkdown} 
                selectedFile={selectedFile}
                textareaRef={textareaRef}
                isCodeFile={isCodeFile}
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