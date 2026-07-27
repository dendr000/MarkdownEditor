// src/App.jsx v8.0
/*
 * 파일 위치: src/App.jsx
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v8.0 수정사항): 전체 코드 변경 지시에 따라 변경 전 코드를 생략하고, 탐색기 제어 상태를 하위로 전달합니다.
 */
import { useState, useRef } from 'react';
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
  console.log("[App v8.0] 렌더링 시작 - 최상위 레이아웃 구성");
  const [storageMode, setStorageMode] = useState(getStorageMode());
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

  const handleStorageModeChange = (mode) => {
    console.log(`[App v8.0] 스토리지 스위칭 감지: ${mode}`);
    apiSetStorageMode(mode);
    setStorageMode(mode);
    setSelectedFile(null);
    setMarkdown('');
    window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
  };

  return (
    <div className="app-layout">
      <Header markdown={markdown} viewMode={viewMode} setViewMode={setViewMode} isExplorerOpen={isExplorerOpen} setIsExplorerOpen={setIsExplorerOpen} selectedFile={selectedFile} isSyncScroll={isSyncScroll} setIsSyncScroll={setIsSyncScroll} isExplorerAutoClose={isExplorerAutoClose} setIsExplorerAutoClose={setIsExplorerAutoClose} onBreadcrumbClick={(path) => handleSelectFile(path, false)} storageMode={storageMode} onStorageModeChange={handleStorageModeChange} />
      <main className="workspace" onClick={(e) => { if (isExplorerAutoClose && isExplorerOpen && !isExplorerPinned) { if (!e.target.closest('.file-explorer-container')) { console.log("[App v8.0] 외부 클릭 감지: 탐색기 닫기"); setIsExplorerOpen(false); } } }} style={{ position: 'relative', overflow: 'hidden' }}>
        <FileExplorer isExplorerOpen={isExplorerOpen} setIsExplorerOpen={setIsExplorerOpen} onSelectFile={(path) => handleSelectFile(path, false)} selectedFile={selectedFile} explorerWidth={explorerWidth} setExplorerWidth={setExplorerWidth} isExplorerPinned={isExplorerPinned} setIsExplorerPinned={setIsExplorerPinned} setIsResizing={setIsResizing} storageMode={storageMode} />
        <div className={`main-content mode-${viewMode}`} style={{ width: isExplorerPinned && isExplorerOpen ? `calc(100% - ${explorerWidth}px)` : '100%', marginLeft: isExplorerPinned && isExplorerOpen ? `${explorerWidth}px` : '0', transition: isResizing ? 'none' : 'margin-left 0.3s ease, width 0.3s ease' }}>
          {viewMode !== 'editor' && (
            <div className="pane preview-pane">
              {selectedFile && selectedFile.toLowerCase().endsWith('.sql') ? <SqlViewer sql={markdown} /> : <Preview markdown={markdown} selectedFile={selectedFile} onSelectFile={(path) => handleSelectFile(path, false)} previewRef={previewRef} />}
            </div>
          )}
          {viewMode !== 'preview' && (
            <div className="pane editor-pane">
              <Editor markdown={markdown} setMarkdown={setMarkdown} selectedFile={selectedFile} textareaRef={textareaRef} />
            </div>
          )}
        </div>
        <OutlineMinimap outline={outlineData} textareaRef={textareaRef} />
      </main>
    </div>
  );
}
export default App;