// src/hooks/app/useScrollSync.js v1.0
/*
 * 파일 설명: 에디터와 실시간 뷰어 간의 양방향 스크롤 동기화 연산을 전담하는 커스텀 훅입니다.
 * 연결 위치: src/App.jsx
 */
import { useEffect } from 'react';

export const useScrollSync = (textareaRef, previewRef, isSyncScroll, viewMode, markdown) => {
  useEffect(() => {
    if (!isSyncScroll || viewMode !== 'split') return;

    const editor = textareaRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleEditorScroll = () => {
      if (!isSyncScroll) return;
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
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
  }, [isSyncScroll, viewMode, markdown, textareaRef, previewRef]);
};