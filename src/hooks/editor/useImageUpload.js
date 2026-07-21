// src/hooks/editor/useImageUpload.js v2.0
/*
 * 파일 설명: 드래그 앤 드롭 및 클립보드 붙여넣기를 통해 이미지를 입력받고, ImgBB 클라우드 API를 호출하여 외부 호스팅 URL로 변환 및 에디터 본문에 삽입하는 비동기 통신 훅입니다. Base64 렌더링 렉을 원천 차단합니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useState } from 'react';

// FIXME: 여기에 발급받은 본인의 ImgBB API Key를 입력하세요.
const IMGBB_API_KEY = 'bda3ed7703e4b6514b4889edec8feaa7';

export const useImageUpload = (markdown, setMarkdown, textareaRef) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleImageUpload = async (file) => {
    console.log("[useImageUpload v2.0] 이미지 클라우드 업로드 파이프라인 진입 - 파일명:", file.name);
    
    if (!file.type.startsWith('image/')) {
      alert("이미지 포맷의 파일만 에디터 내에 즉시 삽입할 수 있습니다.");
      return;
    }

    if (IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY_HERE') {
      alert("API 키가 누락되었습니다. useImageUpload.js 파일 최상단에 ImgBB API 키를 입력해 주세요.");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // 1. 업로드 대기 UI 피드백 (로딩 스피너 역할을 하는 임시 마크다운 텍스트 주입)
    const uploadingText = `![이미지 업로드 중...](${file.name})`;
    const tempText = markdown.substring(0, start) + uploadingText + markdown.substring(end);
    setMarkdown(tempText);

    // 커서를 업로드 텍스트 뒤로 임시 이동
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + uploadingText.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);

    // 2. ImgBB API POST 전송 규격 (FormData 팩토리)
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    try {
      console.log("[useImageUpload v2.0] ImgBB 서버로 POST 요청 발송");
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 3. 성공 시: 임시 '업로드 중' 텍스트를 응답받은 실제 CDN URL 마크다운으로 치환
        const imageUrl = result.data.url;
        const finalImageMarkdown = `![image](${imageUrl})`;
        
        console.log("[useImageUpload v2.0] 업로드 성공 - URL:", imageUrl);

        setMarkdown((prevMarkdown) => {
          // 임시로 주입했던 문자열의 위치를 찾아 정식 URL 문자열로 리플레이스
          const replaceStart = prevMarkdown.indexOf(uploadingText);
          if (replaceStart !== -1) {
            return prevMarkdown.substring(0, replaceStart) + finalImageMarkdown + prevMarkdown.substring(replaceStart + uploadingText.length);
          }
          return prevMarkdown;
        });

      } else {
        throw new Error(result.error?.message || "업로드 실패");
      }
    } catch (error) {
      console.error("[useImageUpload v2.0] 이미지 업로드 통신 에러:", error);
      alert("클라우드 서버 통신 중 오류가 발생했습니다. 네트워크 상태를 확인해 주세요.");
      
      // 4. 실패 시: 임시 텍스트 롤백
      setMarkdown((prevMarkdown) => prevMarkdown.replace(uploadingText, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        handleImageUpload(file);
        break;
      }
    }
  };

  return { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste };
};