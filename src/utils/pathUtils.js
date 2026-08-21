// src/utils/pathUtils.js v1.2
/*
 * 파일 위치: src/utils/pathUtils.js
 * 연결 위치: src/components/explorer/ExplorerTreeNode.jsx 내부에서 호출
 * 기능 요약: 파일 시스템 경로 계산(상대 경로 추출 등)과 관련된 순수 자바스크립트 비즈니스 로직을 제공하는 유틸리티입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 */

export const getRelativePath = (currentPath, targetPath) => {
  if (!currentPath || !targetPath) return '';
  const currentParts = currentPath.split('/');
  
  // 현재 에디터에 열려있는(selectedFile) 경로가 파일인지 폴더인지 확장자(.) 유무로 판별합니다.
  const isFile = currentPath.split('/').pop().includes('.');
  if (isFile) {
    currentParts.pop(); // 기준이 파일이면 부모 디렉토리로 기준점을 한 칸 올립니다.
  }

  const targetParts = targetPath.split('/');

  let commonLength = 0;
  while (commonLength < currentParts.length && commonLength < targetParts.length && currentParts[commonLength] === targetParts[commonLength]) {
    commonLength++;
  }

  const upCount = currentParts.length - commonLength;
  
  // [핵심 패치] upCount가 0일 때 (같은 폴더이거나 하위 폴더로 진입할 때) 불필요한 './' 접두사를 제거하여 깃허브 마크다운 포맷에 맞게 자연스럽게 출력되도록 수정
  const upString = upCount > 0 ? '../'.repeat(upCount) : ''; 
  const downString = targetParts.slice(commonLength).join('/');

  return upString + downString;
};