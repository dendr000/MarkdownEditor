// src/App.jsx v2.4
/*
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v2.4 수정사항): URL Query Parameter(?file=)를 통한 라우팅 기능을 추가하여 새 탭 열기 및 뒤로가기 시 정상적인 파일을 로드하도록 개선했습니다.
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
  console.log("App 컴포넌트(v2.4) 렌더링 시작 - URL 라우팅 패치 적용");
  
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  const textareaRef = useRef(null);
  const outlineData = useOutline(markdown);

  // isHistoryEvent가 true이면 브라우저 히스토리 스택에 URL을 추가하지 않습니다 (뒤로가기/새로고침 시 무한 루프 방지) [버전 2.5]
  const handleSelectFile = async (filePath, isHistoryEvent = false) => {
    // 윈도우 환경 탐색기에서 넘어오는 역슬래시(\)를 표준 슬래시(/)로 완벽히 정규화
    const normalizedPath = filePath ? filePath.replace(/\\/g, '/') : '';
    console.log(`[App v2.5] 파일 선택됨 (정규화 완료): ${normalizedPath}`);
    
    try {
      const content = await fetchFileContent(normalizedPath);
      setSelectedFile(normalizedPath);
      setMarkdown(content);
      
      if (!isHistoryEvent) {
        const newUrl = `${window.location.pathname}?file=${encodeURIComponent(normalizedPath)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (error) {
      console.error("[App v2.5] 파일 로드 실패:", error);
      // 파일이 존재하지 않거나 권한이 없어 로드에 실패한 경우, 상태를 초기화하고 브라우저 URL 찌꺼기를 정리합니다.
      if (isHistoryEvent) {
        console.log("[App v2.5] 유효하지 않은 URL 파라미터를 감지하여 주소창을 초기화합니다.");
        window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
        setSelectedFile(null);
        setMarkdown('');
      }
    }
  };

  useEffect(() => {
    // URL에서 ?file= 파라미터를 추출합니다.
    const params = new URLSearchParams(window.location.search);
    const targetFile = params.get('file');

    if (targetFile) {
      console.log(`[App v2.6] URL 파라미터 감지: ${targetFile} 로드 시도`);
      handleSelectFile(targetFile, true);
    } else {
      // 워크스페이스가 변경되었을 때 test.md가 없을 확률이 높으므로, 강제로 불러오지 않고 에디터를 빈 상태로 대기시킵니다.
      console.log("[App v2.6] 파라미터 없음: 에디터 대기 상태 진입");
      setSelectedFile(null);
      setMarkdown('');
    }

    // 브라우저 뒤로 가기 / 앞으로 가기 이벤트 감지
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentFile = currentParams.get('file');
      
      console.log(`[App v2.6] 브라우저 이동 감지 - 타겟 파일: ${currentFile || '없음'}`);
      
      if (currentFile) {
        handleSelectFile(currentFile, true);
      } else {
        setSelectedFile(null);
        setMarkdown('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
          onSelectFile={(path) => handleSelectFile(path, false)} 
        />

        <div className={`main-content mode-${viewMode}`}>
          {viewMode !== 'editor' && (
            <div className="pane preview-pane">
              <Preview 
                markdown={markdown} 
                selectedFile={selectedFile} 
                onSelectFile={(path) => handleSelectFile(path, false)}
              />
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