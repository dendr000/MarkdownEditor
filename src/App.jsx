// src/App.jsx v3.0
/*
 * 파일 설명: 3단 레이아웃을 조율하는 최상위 컴포넌트입니다.
 * (v3.0 수정사항): 에디터와 실시간 뷰어 간의 양방향 스크롤 동기화 기능이 추가되었습니다.
 */
import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Editor from './components/editor/Editor';
import FileExplorer from './components/explorer/FileExplorer';
import OutlineMinimap from './components/editor/OutlineMinimap';
import { useOutline } from './hooks/editor/useOutline';
import { fetchFileContent } from './api/fileApi';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  console.log("App 컴포넌트(v3.0) 렌더링 시작 - 스크롤 동기화 패치 적용");
  
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  const textareaRef = useRef(null);
  const previewRef = useRef(null); // [신규] 뷰어 스크롤 DOM 추적을 위한 Ref
  const [isSyncScroll, setIsSyncScroll] = useState(true); // [신규] 스크롤 동기화 토글 상태
  const outlineData = useOutline(markdown);

  const handleSelectFile = async (filePath, isHistoryEvent = false) => {
    const normalizedPath = filePath ? filePath.replace(/\\/g, '/') : '';
    console.log(`[App v3.0] 파일 선택됨 (정규화 완료): ${normalizedPath}`);
    
    try {
      const content = await fetchFileContent(normalizedPath);
      setSelectedFile(normalizedPath);
      
      if (content instanceof ArrayBuffer) {
        console.log("[App v3.0] 엑셀 바이너리 데이터 HTML 표 변환 시작 (병합 셀 지원)");
        try {
          const workbook = XLSX.read(content, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          let rawHtml = XLSX.utils.sheet_to_html(worksheet);
          const tableMatch = rawHtml.match(/<table[^>]*>[\s\S]*?<\/table>/i);
          
          if (tableMatch) {
            let htmlTable = tableMatch[0];
            htmlTable = htmlTable.replace(/<table/, '<table style="border-collapse: collapse; min-width: 100%; font-size: 13px;" border="1"');
            htmlTable = htmlTable.replace(/<td/g, '<td style="padding: 6px 10px; border: 1px solid #d0d7de;"');
            
            setMarkdown(`> **엑셀 뷰어 (읽기 전용)**: \`${normalizedPath}\`\n\n<div style="width: 100%; overflow-x: auto; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #d0d7de; margin-top: 16px;">\n${htmlTable}\n</div>`);
          } else {
            setMarkdown(`> **엑셀 뷰어**: \`${normalizedPath}\`\n\n데이터가 존재하지 않거나 빈 시트입니다.`);
          }
        } catch (parseError) {
          console.error("[App v3.0] 엑셀 파싱 에러:", parseError);
          setMarkdown(`> **엑셀 로드 실패**: 파일이 손상되었거나 지원하지 않는 형식입니다.`);
        }
      } else {
        setMarkdown(content);
      }
      
      if (!isHistoryEvent) {
        const newUrl = `${window.location.pathname}?file=${encodeURIComponent(normalizedPath)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (error) {
      console.error("[App v3.0] 파일 로드 실패:", error);
      if (isHistoryEvent) {
        console.log("[App v3.0] 유효하지 않은 URL 파라미터를 감지하여 주소창을 초기화합니다.");
        window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname);
        setSelectedFile(null);
        setMarkdown('');
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetFile = params.get('file');

    if (targetFile) {
      console.log(`[App v3.0] URL 파라미터 감지: ${targetFile} 로드 시도`);
      handleSelectFile(targetFile, true);
    } else {
      console.log("[App v3.0] 파라미터 없음: 에디터 대기 상태 진입");
      setSelectedFile(null);
      setMarkdown('');
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentFile = currentParams.get('file');
      
      console.log(`[App v3.0] 브라우저 이동 감지 - 타겟 파일: ${currentFile || '없음'}`);
      
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

  // [신규] 에디터와 프리뷰 간의 양방향 스크롤 동기화 로직 [버전 3.0]
  useEffect(() => {
    if (!isSyncScroll || viewMode !== 'split') return;

    const editor = textareaRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) return;

    // 무한 루프(에디터 스크롤 -> 뷰어 스크롤 -> 에디터 스크롤...) 방지를 위한 플래그
    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleEditorScroll = () => {
      if (!isSyncScroll) return;
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
      // 스크롤된 비율(%) 계산 = 현재 스크롤 위치 / (전체 내용 높이 - 화면에 보이는 높이)
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    };

    const handlePreviewScroll = () => {
      if (!isSyncScroll) return;
      if (isSyncingRight) {
        isSyncingRight = false;
        return;
      }
      isSyncingLeft = true;
      const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
    };

    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [isSyncScroll, viewMode, markdown]);

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
      />
      
      <main className="workspace">
        <FileExplorer 
          isExplorerOpen={isExplorerOpen} 
          onSelectFile={(path) => handleSelectFile(path, false)} 
          selectedFile={selectedFile}
        />

        <div className={`main-content mode-${viewMode}`}>
          {viewMode !== 'editor' && (
            <div className="pane preview-pane">
              <Preview 
                markdown={markdown} 
                selectedFile={selectedFile} 
                onSelectFile={(path) => handleSelectFile(path, false)}
                previewRef={previewRef}
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