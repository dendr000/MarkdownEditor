// src/utils/editor/codeFormatter.js v1.0
/*
 * 파일 위치: src/utils/editor/codeFormatter.js
 * 파일 설명: 정규식을 활용하여 각 개발 언어별 코드를 보기 좋게 정렬(들여쓰기 및 줄바꿈)해 주는 자체 포매터 유틸리티입니다.
 * 연결 위치: src/hooks/editor/useCodeFormatter.js
 */

const formatHTML = (code) => {
  let indentLevel = 0;
  const result = code
    .replace(/>\s+</g, '><') // 태그 사이의 공백 제거
    .replace(/</g, '~::~<')
    .replace(/>/g, '>~::~')
    .split('~::~')
    .filter(str => str.trim());

  let formatted = '';
  result.forEach((token) => {
    if (token.match(/^<\//)) {
      indentLevel--;
      formatted += '\n' + '  '.repeat(Math.max(indentLevel, 0)) + token;
    } else if (token.match(/^<[^!/?][^>]*>$/)) {
      formatted += (formatted ? '\n' : '') + '  '.repeat(Math.max(indentLevel, 0)) + token;
      // 스스로 닫히는 태그(input, img, br 등)가 아니면 들여쓰기 증가
      if (!token.match(/<\w+[^>]*\/>/) && !token.match(/<(input|img|br|hr|meta|link)/i)) {
        indentLevel++;
      }
    } else if (token.match(/^<!/)) {
      formatted += '\n' + '  '.repeat(Math.max(indentLevel, 0)) + token;
    } else {
      formatted += token;
    }
  });
  return formatted.trim();
};

const formatCSS = (code) => {
  return code
    .replace(/\s*([{}:;,])\s*/g, '$1') // 구문 주변 공백 제거
    .replace(/\{/g, ' {\n  ')
    .replace(/;/g, ';\n  ')
    .replace(/,\s*/g, ', ')
    .replace(/\}/g, '\n}\n\n')
    .replace(/  \}/g, '}')
    .trim();
};

const formatSQL = (code) => {
  let formatted = code.replace(/\s+/g, ' '); // 다중 공백 단일화
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE'];
  
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${kw.toUpperCase()}`);
  });
  
  // 조건절 들여쓰기
  formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  $1');
  return formatted.trim();
};

const formatCStyle = (code) => {
  let indentLevel = 0;
  const lines = code.split('\n');
  const formattedLines = lines.map(line => {
    let trimmed = line.trim();
    if (!trimmed) return '';

    // 닫는 괄호로 시작하면 먼저 들여쓰기 감소
    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const formattedLine = '  '.repeat(Math.max(0, indentLevel)) + trimmed;

    // 해당 줄의 여는 괄호와 닫는 괄호 개수를 계산하여 다음 줄의 들여쓰기 수준 결정
    const openCount = (trimmed.match(/\{/g) || []).length + (trimmed.match(/\[/g) || []).length;
    const closeCount = (trimmed.match(/\}/g) || []).length + (trimmed.match(/\]/g) || []).length;
    
    // 시작 문자가 닫는 괄호였다면 이미 감소시켰으므로 보정
    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentLevel += openCount - Math.max(0, closeCount - 1);
    } else {
      indentLevel += openCount - closeCount;
    }

    return formattedLine;
  });
  return formattedLines.join('\n');
};

export const formatCode = (code, lang) => {
  try {
    switch (lang) {
      case 'html': case 'xml': case 'svg':
        return formatHTML(code);
      case 'css': case 'scss':
        return formatCSS(code);
      case 'sql':
        return formatSQL(code);
      case 'javascript': case 'java': case 'js': case 'ts':
        return formatCStyle(code);
      case 'jsx': case 'tsx':
        // [안전 장치] JSX는 HTML과 JS가 섞여 있어 단일 정규식 포매팅 시 코드가 파손될 위험이 있으므로 원본을 유지합니다.
        console.warn(`[codeFormatter] ${lang} 확장자는 안전을 위해 포매팅을 생략합니다.`);
        return code;
      default:
        return code; // 포매팅을 지원하지 않는 언어는 원본 반환
    }
  } catch (error) {
    console.error(`[codeFormatter v1.0] ${lang} 포매팅 중 오류 발생. 원본 코드를 유지합니다.`, error);
    return code; // 안전성 확보: 파싱 실패 시 코드 유실 방지
  }
};