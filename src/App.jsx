// src/App.jsx v13.1
/*
 * 파일 위치: src/App.jsx
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v13.1 수정사항): 탐색기 투명도(explorerOpacity)와 무관하게, 사용자가 '고정(Pin)' 토글을 켜면 에디터 본문을 항상 우측으로 밀어내도록 레이아웃 연산 로직을 수정했습니다.
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
  
  const [isExplorerOpen, setIsExplorerOpen] = useState(() => {
    const savedExplorerState = localStorage.getItem('md_editor_explorer_open');
    return savedExplorerState !== null ? JSON.parse(savedExplorerState) : true;
  });

  const [explorerOpacity, setExplorerOpacity] = useState(() => {
    const savedOpacity = localStorage.getItem('md_editor_explorer_opacity');
    return savedOpacity !== null ? parseFloat(savedOpacity) : 1.0;
  });

  const [isGhostModeClickThrough, setIsGhostModeClickThrough] = useState(() => {
    const savedGhost = localStorage.getItem('md_editor_ghost_click');
    return savedGhost !== null ? JSON.parse(savedGhost) : true;
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

  useEffect(() => {
    localStorage.setItem('md_editor_explorer_open', JSON.stringify(isExplorerOpen));
  }, [isExplorerOpen]);

  useEffect(() => {
    localStorage.setItem('md_editor_explorer_opacity', explorerOpacity);
  }, [explorerOpacity]);

  useEffect(() => {
    localStorage.setItem('md_editor_ghost_click', JSON.stringify(isGhostModeClickThrough));
  }, [isGhostModeClickThrough]);

  useEffect(() => {
    const preventGlobalSave = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault(); 
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
        explorerOpacity={explorerOpacity}
        setExplorerOpacity={setExplorerOpacity}
        isGhostModeClickThrough={isGhostModeClickThrough}
        setIsGhostModeClickThrough={setIsGhostModeClickThrough}
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
          explorerOpacity={explorerOpacity}
          isGhostModeClickThrough={isGhostModeClickThrough}
        />

        <div
          className={`main-content mode-${viewMode}`}
          data-explorer-floating={!(isExplorerPinned && isExplorerOpen)}
          style={{
            // [핵심 패치] 투명도 조건(explorerOpacity === 1)을 제거하여, 고정 토글 상태(isExplorerPinned)만으로 레이아웃을 통제합니다.
            width: (isExplorerPinned && isExplorerOpen) ? `calc(100% - ${explorerWidth}px)` : '100%',
            marginLeft: (isExplorerPinned && isExplorerOpen) ? `${explorerWidth}px` : '0',
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