// src/components/editor/CodeOverlay.jsx v1.0
/*
 * 파일 위치: src/components/editor/CodeOverlay.jsx
 * 파일 설명: 개발 코드 편집 시 textarea 바로 뒤에 겹쳐져 줄 번호와 구문 강조(Syntax Highlighting)를 표시하는 오버레이 컴포넌트입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useMemo } from 'react';
import { highlightCode } from '../../utils/editor/syntaxHighlighter';
import { lintSql } from '../../utils/editor/sqlLinter';

function CodeOverlay({ markdown, language, overlayRef, lineNumRef }) {
  // 개행 문자를 기준으로 줄 번호를 계산합니다.
  const lineNumbers = useMemo(() => {
    const linesCount = markdown.split('\n').length;
    return Array.from({ length: linesCount }, (_, i) => i + 1).join('\n');
  }, [markdown]);

  // 커스텀 파서를 통해 코드를 HTML로 변환합니다.
  const highlightedHtml = useMemo(() => {
    return highlightCode(markdown, language);
  }, [markdown, language]);

  // SQL 파일일 경우에만 실시간 린터를 가동합니다.
  const lintErrors = useMemo(() => {
    if (language?.toLowerCase() === 'sql') {
      return lintSql(markdown);
    }
    return [];
  }, [markdown, language]);

  return (
    <>
      <div className="line-numbers-container" ref={lineNumRef}>
        {lineNumbers}
        {/* 미니맵(Gutter) 에러 경고 점 렌더링 */}
        {lintErrors.map((err, idx) => (
          <div
            key={`lint-dot-${idx}`}
            className="sql-lint-error-dot"
            style={{ top: `calc(24px + ${err.lineIndex} * 1.6em)` }}
            title={err.message}
          />
        ))}
      </div>
      <div className="code-overlay-container" ref={overlayRef}>
        {/* 코드 아래에 깔리는 붉은 물결 밑줄 레이어 */}
        {lintErrors.map((err, idx) => (
          <div
            key={`lint-line-${idx}`}
            className="sql-lint-error-line"
            style={{ top: `calc(24px + ${err.lineIndex} * 1.6em)` }}
          />
        ))}
        <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </div>
    </>
  );
}

export default CodeOverlay;