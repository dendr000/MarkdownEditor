// src/App.jsx v11.0
/*
 * 파일 위치: src/App.jsx
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v11.0 수정사항): 브라우저 전역에 걸쳐 사용자의 Ctrl+S (저장) 단축키 입력을 차단하여, 브라우저 기본 다른 이름으로 저장 창이 뜨지 않도록 방어하는 로직이 추가되었습니다.
 */
import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import FileExplorer from './components/explorer/FileExplorer';
import OutlineMinimap from './components/editor/OutlineMinimap';
import SqlViewer from './components/preview/SqlViewer';
import { useOutline } from './hooks/editor/useOutline';
import { useFileLoader } from './hooks/app/useFileLoader';
import { useScrollSync } from './hooks/app/useScrollSync';
import { getStorageMode, setStorageMode as apiSetStorageMode } from './api/fileApi';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('md_editor_theme');
    return savedTheme || 'light';
  });

  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  
  // 탐색기 열림/닫힘 상태를 localStorage에서 불러옴 (기본값 true)
  const [isExplorerOpen, setIsExplorerOpen] = useState(() => {
    const savedExplorerState = localStorage.getItem('md_editor_explorer_open');
    return savedExplorerState !== null ? JSON.parse(savedExplorerState) : true;
  });

  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  const [isSyncScroll, setIsSyncScroll] = useState(true);
  const [isExplorerAutoClose, setIsExplorerAutoClose] = useState(false);

  const [explorerWidth, setExplorerWidth] = useState(260);
  const [isExplorerPinned, setIsExplorerPinned] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const outlineData = useOutline(markdown);
  const { handleSelectFile } = useFileLoader(setMarkdown, setSelectedFile);
  useScrollSync(textareaRef, previewRef, isSyncScroll, viewMode, markdown);

  useEffect(() => {
    localStorage.setItem('md_editor_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // 탐색기 상태가 변할 때마다 localStorage에 즉시 저장
  useEffect(() => {
    localStorage.setItem('md_editor_explorer_open', JSON.stringify(isExplorerOpen));
  }, [isExplorerOpen]);

  // [핵심 로직] 브라우저 전역 레벨에서 Ctrl + S 동작을 무력화합니다.
  useEffect(() => {
    const preventGlobalSave = (e) => {
      // MacOS의 Cmd 키(metaKey)와 Windows의 Ctrl 키(ctrlKey)를 모두 감지
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault(); // 브라우저 고유의 다운로드 창 실행 방지
      }
    };

    window.addEventListener('keydown', preventGlobalSave);
    return () => {
      window.removeEventListener('keydown', preventGlobalSave);
    };
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
        isSyncScroll={isSyncScroll}
        setIsSyncScroll={setIsSyncScroll}
        isExplorerAutoClose={isExplorerAutoClose}
        setIsExplorerAutoClose={setIsExplorerAutoClose}
        onBreadcrumbClick={(path) => handleSelectFile(path, false)}
        theme={theme}
        setTheme={setTheme}
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
          setIsExplorerOpen={setIsExplorerOpen}
          onSelectFile={(path) => handleSelectFile(path, false)}
          selectedFile={selectedFile}
          explorerWidth={explorerWidth}
          setExplorerWidth={setExplorerWidth}
          isExplorerPinned={isExplorerPinned}
          setIsExplorerPinned={setIsExplorerPinned}
          setIsResizing={setIsResizing}
          storageMode="BROWSER"
        />

        <div
          className={`main-content mode-${viewMode}`}
          data-explorer-floating={!(isExplorerPinned && isExplorerOpen)}
          style={{
            width: isExplorerPinned && isExplorerOpen ? `calc(100% - ${explorerWidth}px)` : '100%',
            marginLeft: isExplorerPinned && isExplorerOpen ? `${explorerWidth}px` : '0',
            transition: isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <>
            {viewMode !== 'editor' && (
              <div className="pane preview-pane">
                {selectedFile && selectedFile.toLowerCase().endsWith('.sql') ? (
                  <SqlViewer sql={markdown} selectedFile={selectedFile} />
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
                <Editor
                  markdown={markdown}
                  setMarkdown={setMarkdown}
                  selectedFile={selectedFile}
                  textareaRef={textareaRef}
                />
              </div>
            )}
          </>
        </div>

        <OutlineMinimap outline={outlineData} textareaRef={textareaRef} />
      </main>
    </div>
  );
}

export default App;