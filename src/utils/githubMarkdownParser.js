// src/utils/githubMarkdownParser.js v1.0
/*
 * 파일 설명: 기본 마크다운 파서가 인식하지 못하는 GitHub 고유 문법(Alerts, Diff 블록)을 HTML 구조로 사전 변환하는 프리프로세서입니다.
 * 연결 위치: src/components/Preview.jsx 내부에서 마크다운 문자열을 렌더링하기 전에 호출됩니다.
 */

export const preprocessGitHubFlavored = (text) => {
  if (!text) return '';
  let parsed = text;

  // 1. GitHub Alerts 파싱 (> [!NOTE] 형태를 HTML div 블록으로 변환)
  const alertRegex = /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n((?:> .*(?:\n|$))*)/gm;
  parsed = parsed.replace(alertRegex, (match, type, content) => {
    const cleanContent = content.replace(/^> ?/gm, ''); // 각 줄 앞의 꺾쇠(>) 제거
    const typeLower = type.toLowerCase();
    const typeTitle = type.charAt(0) + typeLower.slice(1);
    
    return `<div class="gh-alert gh-alert-${typeLower}">
<p class="gh-alert-title">${typeTitle}</p>\n
${cleanContent}
</div>\n\n`;
  });

  // 2. GitHub Diff 코드 블록 파싱 (+, -, ! 기호를 감지하여 색상 span 부여)
  const diffRegex = /```diff\n([\s\S]*?)```/g;
  parsed = parsed.replace(diffRegex, (match, content) => {
    const lines = content.split('\n').map(line => {
      if (line.startsWith('+')) return `<span class="diff-add">${line}</span>`;
      if (line.startsWith('-')) return `<span class="diff-remove">${line}</span>`;
      if (line.startsWith('!')) return `<span class="diff-change">${line}</span>`;
      return line;
    }).join('\n');
    return `<pre><code class="language-diff">${lines}</code></pre>`;
  });

  return parsed;
};