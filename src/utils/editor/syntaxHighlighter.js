// src/utils/editor/syntaxHighlighter.js v1.0
/*
 * 파일 위치: src/utils/editor/syntaxHighlighter.js
 * 파일 설명: 개발 코드 파일 편집 시, 정규식을 활용하여 실시간으로 구문을 강조(Syntax Highlighting)하는 가벼운 자체 파서입니다.
 * 연결 위치: src/components/editor/CodeOverlay.jsx
 */

export const highlightCode = (code, lang) => {
  if (!code) return '';
  
  // 1. HTML 엔티티 이스케이프 (태그 깨짐 방지)
  let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 2. 주요 개발 언어 범용 예약어 (SQL, Java, JS 중심)
  const keywords = 'SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|CREATE|TABLE|VIEW|ALTER|DROP|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|INT|VARCHAR|BIGINT|DATETIME|BOOLEAN|NOT|NULL|AND|OR|INNER|JOIN|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|AS|LIKE|IN|IS|public|private|protected|class|interface|implements|extends|void|static|final|import|package|if|else|for|while|do|switch|case|break|continue|return|new|try|catch|finally|throw|function|const|let|var|export|default|await|async|typeof|instanceof|true|false'.split('|').join('|');

    // 3. 단일 패스(Single-pass) 정규식 스캐너
    // 주석이나 문자열 내부의 예약어가 잘못 강조되는 것을 방지하기 위해 단일 정규식으로 순서를 보장하여 매칭합니다.
    // * p1: 다중 줄 주석 (/* ... */)
    // * p2: 단일 줄 주석 (// ... 또는 -- ...)
    // * p3: 문자열 ("...", '...', `...`)
    // * p4: 애노테이션 (@...)
    // * p5: 예약어
    // * p6: 숫자
    // 3. 단일 패스(Single-pass) 정규식 스캐너 (줄바꿈 대응 교정)
  const tokenRegex = new RegExp(
    `(\\/\\*[\\s\\S]*?\\*\\/)|(\\/\\/[^\\n]*|--[^\\n]*)|(".*?"|'.*?'|\`[\\s\\S]*?\`)|(@[a-zA-Z_]+)|\\b(${keywords})\\b|\\b(\\d+)\\b`, 'gi'
  );

  return escaped.replace(tokenRegex, (match, p1, p2, p3, p4, p5, p6) => {
    if (p1 || p2) return `<span style="color: #6e7781; font-style: italic;">${match}</span>`;
    if (p3) return `<span style="color: #032f62;">${match}</span>`;
    if (p4) return `<span style="color: #8250df; font-weight: 600;">${match}</span>`;
    if (p5) return `<span style="color: #cf222e; font-weight: 600;">${match}</span>`;
    if (p6) return `<span style="color: #005cc5;">${match}</span>`;
    return match;
  });
};