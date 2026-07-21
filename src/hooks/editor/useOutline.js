// src/hooks/editor/useOutline.js v1.0
/*
 * 파일 설명: 에디터 본문의 마크다운 텍스트를 실시간으로 스캔하여 제목(#) 노드들의 계층(level)과 텍스트 커서 위치(charIndex)를 추출하는 커스텀 훅입니다.
 */
import { useState, useEffect } from 'react';

export const useOutline = (markdown) => {
  const [outline, setOutline] = useState([]);

  useEffect(() => {
    const lines = markdown.split('\n');
    const parsedOutline = [];
    let currentCharIndex = 0;
    
    lines.forEach((line) => {
      // # 기호로 시작하는 마크다운 헤더 문법 추출 (H1~H6)
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (match) {
        parsedOutline.push({
          id: `outline-${currentCharIndex}`,
          level: match[1].length,
          text: match[2].trim(),
          charIndex: currentCharIndex
        });
      }
      // 다음 줄 검사를 위해 현재 줄 길이 + 개행문자(\n) 1칸 더하기
      currentCharIndex += line.length + 1;
    });
    
    setOutline(parsedOutline);
  }, [markdown]);

  return outline;
};