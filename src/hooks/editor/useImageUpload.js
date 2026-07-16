// src/hooks/editor/useImageUpload.js v1.0
/*
 * 파일 설명: 에디터 텍스트 영역의 파일 드래그 앤 드롭 및 클립보드 붙여넣기를 통한 이미지 Base64 인코딩 업로드 로직을 분리한 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useState } from 'react';

export const useImageUpload = (markdown, setMarkdown, textareaRef) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    console.log("[useImageUpload] 드래그 오버 상태 진입 - 브라우저 기본 동작 차단 완료");
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    console.log("[useImageUpload] 드래그 영역 이탈 - 비활성 상태 전환 완료");
    setIsDragActive(false);
  };

  const handleImageUpload = (file) => {
    console.log("[useImageUpload] 이미지 파싱 연산 진입 - 파일명:", file.name, "MIME 규격:", file.type);
    
    if (!file.type.startsWith('image/')) {
      console.log("[useImageUpload] 에러: 삽입 거부 - 파일 규격이 이미지(image/*) 형식이 아닙니다.");
      alert("이미지 포맷의 파일만 에디터 내에 즉시 삽입할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log("[useImageUpload] 파일 텍스트 스트림 인코딩 성공 - Base64 주소값 획득");
      const base64Data = event.target.result;
      const imageMarkdown = `![${file.name}](${base64Data})`;
      
      const textarea = textareaRef.current;
      if (!textarea) {
        console.log("[useImageUpload] 에러: textarea 엘리먼트 참조 인스턴스가 존재하지 않습니다.");
        return;
      }
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newText = markdown.substring(0, start) + imageMarkdown + markdown.substring(end);
      setMarkdown(newText);
      
      setTimeout(() => {
        console.log("[useImageUpload] 텍스트 영역 데이터 갱신 완료 - 입력 타겟 포커스 재부여 및 커서 바인딩");
        textarea.focus();
        const nextCursorPos = start + imageMarkdown.length;
        textarea.setSelectionRange(nextCursorPos, nextCursorPos);
      }, 0);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log("[useImageUpload] 파일 드롭 감지 및 다운로드 차단 처리 완료");
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log("[useImageUpload] 파일 추출 성공. 개수:", files.length, "- 업로드 연계 이관 진행");
      handleImageUpload(files[0]);
    } else {
      console.log("[useImageUpload] 드롭된 파일 정보 배열이 확인되지 않습니다.");
    }
  };

  const handlePaste = (e) => {
    console.log("[useImageUpload] 클립보드 붙여넣기 이벤트 감지 완료");
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        console.log("[useImageUpload] 클립보드 내 파일 기반 이미지 노드 확인 성공 - 기본 동작 중지");
        e.preventDefault();
        const file = items[i].getAsFile();
        handleImageUpload(file);
        break;
      }
    }
  };

  return { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste };
};