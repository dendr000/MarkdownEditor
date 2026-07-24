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
import * as XLSX from 'xlsx'; // [신규] 엑셀 파싱 라이브러리 추가
import './App.css';

function App() {
  console.log("App 컴포넌트(v2.4) 렌더링 시작 - URL 라우팅 패치 적용");
  
  const [markdown, setMarkdown] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('split');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  const textareaRef = useRef(null);
  const outlineData = useOutline(markdown);

  // isHistoryEvent가 true이면 브라우저 히스토리 스택에 URL을 추가하지 않습니다 (뒤로가기/새로고침 시 무한 루프 방지) [버전 2.9]
  const handleSelectFile = async (filePath, isHistoryEvent = false) => {
    const normalizedPath = filePath ? filePath.replace(/\\/g, '/') : '';
    console.log(`[App v2.9] 파일 선택됨 (정규화 완료): ${normalizedPath}`);
    
    try {
      const content = await fetchFileContent(normalizedPath);
      setSelectedFile(normalizedPath);
      
      // 엑셀 바이너리 데이터(ArrayBuffer) 파싱 및 HTML 표 변환 로직
      if (content instanceof ArrayBuffer) {
        console.log("[App v2.9] 엑셀 바이너리 데이터 HTML 표 변환 시작 (병합 셀 지원)");
        try {
          const workbook = XLSX.read(content, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 마크다운 표 문법은 셀 병합(rowspan/colspan)을 지원하지 않으므로, HTML 표 구조로 추출합니다.
          let rawHtml = XLSX.utils.sheet_to_html(worksheet);
          
          // 생성된 HTML 문서 문자열에서 <table> 태그 부분만 정규식으로 안전하게 추출
          const tableMatch = rawHtml.match(/<table[^>]*>[\s\S]*?<\/table>/i);
          
          if (tableMatch) {
            let htmlTable = tableMatch[0];
            
            // 깃허브 마크다운 스타일과 이질감이 없도록 HTML 표에 인라인 스타일을 강제 주입합니다.
            htmlTable = htmlTable.replace(/<table/, '<table style="border-collapse: collapse; min-width: 100%; font-size: 13px;" border="1"');
            htmlTable = htmlTable.replace(/<td/g, '<td style="padding: 6px 10px; border: 1px solid #d0d7de;"');
            
            setMarkdown(`> **엑셀 뷰어 (읽기 전용)**: \`${normalizedPath}\`\n\n<div style="width: 100%; overflow-x: auto; background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #d0d7de; margin-top: 16px;">\n${htmlTable}\n</div>`);
          } else {
            setMarkdown(`> **엑셀 뷰어**: \`${normalizedPath}\`\n\n데이터가 존재하지 않거나 빈 시트입니다.`);
          }
        } catch (parseError) {
          console.error("[App v2.9] 엑셀 파싱 에러:", parseError);
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
      console.error("[App v2.9] 파일 로드 실패:", error);
      if (isHistoryEvent) {
        console.log("[App v2.9] 유효하지 않은 URL 파라미터를 감지하여 주소창을 초기화합니다.");
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
          selectedFile={selectedFile}
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