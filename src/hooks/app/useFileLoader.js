// src/hooks/app/useFileLoader.js v1.0
/*
 * 파일 설명: App.jsx에서 파일 불러오기(MD, PDF, 엑셀) 및 브라우저 URL 라우팅(히스토리) 기능을 전담하는 커스텀 훅입니다.
 * 연결 위치: src/App.jsx
 */
import { useEffect } from 'react';
import { fetchFileContent } from '../../api/fileApi';
import * as XLSX from 'xlsx';

export const useFileLoader = (setMarkdown, setSelectedFile) => {
  const handleSelectFile = async (filePath, isHistoryEvent = false) => {
    const normalizedPath = filePath ? filePath.replace(/\\/g, '/') : '';
    console.log(`[useFileLoader v1.0] 파일 선택됨 (정규화 완료): ${normalizedPath}`);
    
    try {
      const fileExt = normalizedPath.split('.').pop().toLowerCase();
      setSelectedFile(normalizedPath);
      
      if (fileExt === 'pdf') {
        const pdfUrl = `/api/raw?target=${encodeURIComponent(normalizedPath)}`;
        setMarkdown(`> **PDF 뷰어 (읽기 전용)**: \`${normalizedPath}\`\n\n<iframe src="${pdfUrl}" width="100%" height="800px" style="border: 1px solid #d0d7de; border-radius: 8px; margin-top: 16px; background-color: #f6f8fa;"></iframe>`);
      } else {
        const content = await fetchFileContent(normalizedPath);
        
        if (content instanceof ArrayBuffer) {
          console.log("[useFileLoader v1.0] 엑셀 바이너리 데이터 HTML 표 변환 시작 (병합 셀 지원)");
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
            console.error("[useFileLoader v1.0] 엑셀 파싱 에러:", parseError);
            setMarkdown(`> **엑셀 로드 실패**: 파일이 손상되었거나 지원하지 않는 형식입니다.`);
          }
        } else {
          setMarkdown(content);
        }
      }
      
      if (!isHistoryEvent) {
        const newUrl = `${window.location.pathname}?file=${encodeURIComponent(normalizedPath)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (error) {
      console.error("[useFileLoader v1.0] 파일 로드 실패:", error);
      if (isHistoryEvent) {
        console.log("[useFileLoader v1.0] 유효하지 않은 URL 파라미터를 감지하여 주소창을 초기화합니다.");
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
      console.log(`[useFileLoader v1.0] URL 파라미터 감지: ${targetFile} 로드 시도`);
      handleSelectFile(targetFile, true);
    } else {
      console.log("[useFileLoader v1.0] 파라미터 없음: 에디터 대기 상태 진입");
      setSelectedFile(null);
      setMarkdown('');
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentFile = currentParams.get('file');
      
      console.log(`[useFileLoader v1.0] 브라우저 이동 감지 - 타겟 파일: ${currentFile || '없음'}`);
      
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

  return { handleSelectFile };
};