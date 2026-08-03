// src/utils/editor/sqlLinter.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlLinter.js
 * 파일 설명: SQL 코드의 명백한 문법 오류(괄호 불일치, 쉼표 누락, 예약어 오타 등)를 실시간으로 스캔하여 에러 배열을 반환하는 린터입니다.
 * 연결 위치: src/components/editor/CodeOverlay.jsx
 */

export const lintSql = (code) => {
  const errors = [];
  const lines = code.split('\n');
  let parenDepth = 0;
  let lastOpenParenLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 주석이거나 빈 줄은 검사 생략
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) continue;

    // 1. 괄호 쌍 불일치 추적 (Parenthesis tracking)
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '(') {
        parenDepth++;
        lastOpenParenLine = i;
      } else if (line[j] === ')') {
        parenDepth--;
        if (parenDepth < 0) {
          errors.push({ lineIndex: i, message: "문법 오류: 여는 괄호 '(' 가 누락되었거나 닫는 괄호가 너무 많습니다." });
          parenDepth = 0; // 연쇄적인 에러 발생을 막기 위해 초기화
        }
      }
    }

    // 2. 후행 쉼표 (Dangling comma) 감지: 쉼표로 끝난 뒤 다음 줄이 닫는 괄호인 경우
    if (trimmed.endsWith(',')) {
      let nextNonEmpty = '';
      for (let k = i + 1; k < lines.length; k++) {
        if (lines[k].trim()) {
          nextNonEmpty = lines[k].trim();
          break;
        }
      }
      if (nextNonEmpty.startsWith(')')) {
        errors.push({ lineIndex: i, message: "문법 오류: 닫는 괄호 ')' 직전에 불필요한 쉼표(,)가 있습니다." });
      }
    }

    // 3. 동일 줄 내의 쉼표 누락 감지 (예: id INT name VARCHAR)
    // 데이터 타입(INT 등) 뒤에 쉼표 없이 곧바로 다음 컬럼명과 타입이 나오는 패턴을 정규식으로 추적
    const types = 'INT|VARCHAR|BIGINT|DATETIME|TEXT|BOOLEAN|DATE|FLOAT|DOUBLE';
    const missingCommaRegex = new RegExp(`\\b(${types})\\b(?:\\s*\\([^)]*\\))?\\s+[a-zA-Z0-9_]+\\s+(${types})\\b`, 'i');
    if (missingCommaRegex.test(line)) {
      errors.push({ lineIndex: i, message: "문법 오류: 컬럼 정의(데이터 타입) 사이에 쉼표(,)가 누락된 것으로 의심됩니다." });
    }

    // 4. 주요 예약어 오타 감지 (Typos)
    const typos = {
      '\\bCREAT\\b': 'CREATE',
      '\\bFORM\\b': 'FROM',
      '\\bSELCT\\b': 'SELECT',
      '\\bWHER\\b': 'WHERE',
      '\\bUPDTE\\b': 'UPDATE',
      '\\bDELET\\b': 'DELETE'
    };
    for (const [typo, correct] of Object.entries(typos)) {
      if (new RegExp(typo, 'i').test(line)) {
        errors.push({ lineIndex: i, message: `오타 경고: '${correct}' 예약어를 의도하셨나요?` });
      }
    }
  }

  // 파일 끝까지 스캔했는데 닫히지 않은 여는 괄호가 남아있는 경우
  if (parenDepth > 0 && lastOpenParenLine !== -1) {
    errors.push({ lineIndex: lastOpenParenLine, message: "문법 오류: 여는 괄호 '(' 에 매칭되는 닫는 괄호가 누락되었습니다." });
  }

  return errors;
};