// src/App.jsx v6.0
/*
 * 파일 위치: src/App.jsx
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v6.0 수정사항): CodeViewer 및 CodeEditor 아키텍처를 전면 폐기하고, 마크다운 전용 환경으로 롤백했습니다.
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
import './App.css';

function App() {
  console.log("App 컴포넌트(v6.0) 렌더링 시작 - 뷰어/에디터 아키텍처 롤백 적용");

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