// C:\dev\MarkdownEditor\src\hooks\editor\core\useAutoSave.js
/*
 * 파일 위치: src/hooks/editor/core/useAutoSave.js
 * 파일 설명: useEditor에서 분리됨. 파일 확장자 분석, 읽기 전용 상태 판별, 5초 무입력 시 자동 저장 기능을 전담합니다.
 */
import { useEffect } from 'react';
import { saveFileContent } from '../../../api/fileApi';

export const useAutoSave = (markdown, selectedFile) => {
  const getFileExtension = () => {
    if (!selectedFile) return 'md';
    const parts = selectedFile.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'md';
  };
  
  const fileExt = getFileExtension();
  const isMediaFile = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'xlsx', 'csv', 'pdf', 'pptx', 'ppt', 'docx', 'doc', 'zip', 'tar', 'gz', 'rar', '7z', 'exe'].includes(fileExt);
  const isGeneratedView = markdown && markdown.includes('(읽기 전용)');
  const isReadOnly = isMediaFile || isGeneratedView;

  useEffect(() => {
    if (!selectedFile || isReadOnly) {
      if (isReadOnly) console.log(`[useAutoSave v1.0] 읽기 전용 뷰어 상태 감지: '${selectedFile}' 자동 저장 차단`);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await saveFileContent(selectedFile, markdown);
        console.log(`[useAutoSave v1.0] 5초 무입력 감지: '${selectedFile}' 자동 저장 완료`);
      } catch (e) {
        console.error('자동 저장 실패', e);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [markdown, selectedFile, isReadOnly]);

  return { fileExt, isReadOnly };
};