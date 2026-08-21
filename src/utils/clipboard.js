// C:\dev\MarkdownEditor\src\utils\clipboard.js v1.1
/*
 * 파일 위치: C:\dev\MarkdownEditor\src\utils\clipboard.js
 * 기능 요약: 클립보드 텍스트 복사 유틸리티 함수 (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    alert("클립보드 복사에 실패했습니다.");
    return false;
  }
};