// src/App.jsx v9.0
/*
 * 파일 위치: src/App.jsx
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v9.0 수정사항): 다크 테마(눈뽕 방지) 상태 관리를 추가하고 body 태그에 data-theme 속성을 동기화합니다.
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
  console.log("[App v9.0] 렌더링 시작 - 다크 테마 상태 관리 탑재");

  // 스토리지 모드 및 테마 상태 초기화
  const [storageMode, setStorageMode] = useState(getStorageMode());
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('md_editor_theme');
    console.log(`[App v9.0] 로컬 스토리지 테마 로드: ${savedTheme || 'light'}`);
    return savedTheme || 'light';
  });

  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

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

  // 테마 상태가 변경될 때마다 로컬 스토리지 저장 및 body data-theme 속성 업데이트
  useEffect(() => {
    console.log(`[App v9.0] 테마 속성 DOM(body)에 반영: ${theme}`);
    localStorage.setItem('md_editor_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleStorageModeChange = (mode) => {
    console.log(`[App v9.0] 스토리지 스위칭 감지: ${mode}`);
    apiSetStorageMode(mode);
    setStorageMode(mode);
    setSelectedFile(null);
    setMarkdown('');
    window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
  };

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
        storageMode={storageMode}
        onStorageModeChange={handleStorageModeChange}
        theme={theme}
        setTheme={setTheme}
      />

      <main
        className="workspace"
        onClick={(e) => {
          if (isExplorerAutoClose && isExplorerOpen && !isExplorerPinned) {
            if (!e.target.closest('.file-explorer-container')) {
              console.log("[App v9.0] 외부 클릭 감지: 탐색기 자동 닫기 실행");
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
          storageMode={storageMode}
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
              {selectedFile && selectedFile.toLowerCase().endsWith('.sql') ? (
                <SqlViewer sql={markdown} />
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
        </div>

        <OutlineMinimap outline={outlineData} textareaRef={textareaRef} />
      </main>
    </div>
  );
}

export default App;