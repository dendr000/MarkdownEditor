// src/components/preview/LinkRenderer.jsx v1.0
/*
 * 파일 설명: 뷰어 내부의 링크(a 태그) 클릭 이벤트를 가로채어 파일 탭 이동을 유도하는 렌더러 컴포넌트입니다.
 * Preview.jsx에서 분리되었습니다.
 * 연결 위치: src/components/Preview.jsx 내부
 */
import React from 'react';

// 현재 열려있는 파일의 경로를 기준으로 타겟 링크의 절대 경로를 연산하는 함수
export const resolvePath = (currentFilePath, targetPath) => {
  const normalizedCurrent = currentFilePath.replace(/\\/g, '/');
  const normalizedTarget = targetPath.replace(/\\/g, '/');

  console.log(`[resolvePath v1.0] 경로 연산 시작 - 현재 파일: ${normalizedCurrent}, 타겟 경로: ${normalizedTarget}`);
  if (!normalizedTarget) {
    return '';
  }
  
  if (normalizedTarget.startsWith('/')) {
    return normalizedTarget.substring(1);
  }
  
  const lastSlashIndex = normalizedCurrent.lastIndexOf('/');
  const currentDir = lastSlashIndex === -1 ? '' : normalizedCurrent.substring(0, lastSlashIndex);
  
  const currentParts = currentDir ? currentDir.split('/') : [];
  const targetParts = normalizedTarget.split('/');
  
  for (const part of targetParts) {
    if (part === '.' || part === '') {
      continue;
    } else if (part === '..') {
      if (currentParts.length > 0) currentParts.pop();
    } else {
      currentParts.push(part);
    }
  }
  return currentParts.join('/');
};

function LinkRenderer({ node, href, children, selectedFile, onSelectFile, ...props }) {
  // 외부 링크(http)이거나 헤딩 앵커(#)인 경우 기본 동작 수행
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }

  let displayHref = href;
  const isInternal = href && !href.startsWith('http') && !href.startsWith('mailto:');

  // 새 탭 열기 등을 지원하기 위해 파라미터가 보이도록 덮어씌움
  if (isInternal) {
    let baseForResolve = selectedFile || '';
    if (!baseForResolve.split('/').pop().includes('.')) {
      baseForResolve = baseForResolve ? `${baseForResolve}/.virtual` : '.virtual';
    }
    const targetPath = resolvePath(baseForResolve, href);
    displayHref = `?file=${encodeURIComponent(targetPath)}`;
  }
  
  const handleClick = (e) => {
    if (isInternal && onSelectFile) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
        return;
      }
      
      e.preventDefault();
      let baseForResolve = selectedFile || '';
      if (!baseForResolve.split('/').pop().includes('.')) {
        baseForResolve = baseForResolve ? `${baseForResolve}/.virtual` : '.virtual';
      }
      const targetPath = resolvePath(baseForResolve, href);
      console.log(`[LinkRenderer v1.0] 내부 링크 감지 - 타겟 경로 변환: ${href} -> ${targetPath}`);

      const newUrl = `${window.location.pathname}?file=${encodeURIComponent(targetPath)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <a 
      href={displayHref} 
      onClick={handleClick} 
      target={isInternal ? "_self" : "_blank"} 
      rel={isInternal ? "" : "noopener noreferrer"} 
      style={{ cursor: 'pointer', color: '#0969da', textDecoration: 'none' }}
      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
      {...props}
    >
      {children}
    </a>
  );
}

export default LinkRenderer;