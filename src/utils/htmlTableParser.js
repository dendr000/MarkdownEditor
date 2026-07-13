// src/utils/htmlTableParser.js v1.0
/*
 * 파일 설명: HTML <table> 문자열을 React 상태 관리에 적합한 2차원 배열(Grid) 객체로 파싱하고, 역으로 변환하는 유틸리티 함수
 * 연결 위치: src/hooks/useHtmlTable.js 에서 초기 데이터 설정 및 최종 HTML 추출 시 호출됨
 */

export const parseHtmlToGrid = (html) => {
  console.log("parseHtmlToGrid 실행 - 입력된 HTML 파싱 시작");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');
  
  if (!table) {
    console.log("유효한 table 태그를 찾지 못함. 파싱 중단");
    return null;
  }

  const rows = Array.from(table.rows);
  if (rows.length === 0) return null;

  // 전체 표의 최대 열(Column) 개수 계산 (colspan을 고려)
  let maxCols = 0;
  rows.forEach(tr => {
    let colsInRow = 0;
    Array.from(tr.cells).forEach(cell => {
      colsInRow += parseInt(cell.getAttribute('colspan') || '1', 10);
    });
    if (colsInRow > maxCols) maxCols = colsInRow;
  });
  const maxRows = rows.length;

  console.log(`DOM 분석 완료. 예상 그리드 크기 - 행: ${maxRows}, 열: ${maxCols}`);

  // 빈 2차원 배열(Grid) 초기화
  const grid = Array.from({ length: maxRows }, () =>
    Array.from({ length: maxCols }, () => ({
      text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false
    }))
  );

  // 셀 데이터를 순회하며 Grid에 값과 병합 상태(isHidden) 할당
  let r = 0;
  rows.forEach(tr => {
    let c = 0;
    Array.from(tr.cells).forEach(cell => {
      // 이전 행/열의 병합(rowspan/colspan)으로 인해 숨겨진 칸은 건너뜀
      while (c < maxCols && grid[r][c].isHidden) {
        c++;
      }
      if (c >= maxCols) return;

      const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const align = cell.getAttribute('align') || (r === 0 ? 'center' : 'left');
      const text = cell.textContent.trim();

      // 현재 칸에 데이터 및 속성 기록
      grid[r][c] = { text, align, rowSpan, colSpan, isHidden: false };
      console.log(`[${r}, ${c}] 파싱 완료 - 텍스트: ${text}, rowSpan: ${rowSpan}, colSpan: ${colSpan}`);

      // 현재 칸이 확장(병합)된 영역만큼, 다른 칸들을 isHidden 처리하여 렌더링에서 제외시킴
      for (let spanR = 0; spanR < rowSpan; spanR++) {
        for (let spanC = 0; spanC < colSpan; spanC++) {
          if (spanR === 0 && spanC === 0) continue; // 자기 자신 제외
          if (r + spanR < maxRows && c + spanC < maxCols) {
            grid[r + spanR][c + spanC] = {
              text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: true
            };
          }
        }
      }
      c += colSpan;
    });
    r++;
  });

  return grid;
};

export const generateHtmlFromGrid = (grid) => {
  console.log("generateHtmlFromGrid 실행 - Grid 배열을 HTML 태그로 변환 시작");
  let htmlOutput = '\n<table>\n  <thead>\n';
  
  grid.forEach((row, rIndex) => {
    // 첫 번째 행은 thead 구역, 이후는 tbody 구역으로 분리
    if (rIndex === 0) htmlOutput += '    <tr>\n';
    else if (rIndex === 1) htmlOutput += '  </thead>\n  <tbody>\n    <tr>\n';
    else htmlOutput += '    <tr>\n';

    row.forEach((cell) => {
      // 병합되어 숨겨진 칸(isHidden)은 HTML 태그 생성에서 완전히 제외시킴
      if (cell.isHidden) return;

      const tag = rIndex === 0 ? 'th' : 'td';
      const rowSpanAttr = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
      const colSpanAttr = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
      const alignAttr = ` align="${cell.align}"`;

      htmlOutput += `      <${tag}${alignAttr}${rowSpanAttr}${colSpanAttr}>${cell.text}</${tag}>\n`;
    });

    htmlOutput += '    </tr>\n';
  });

  if (grid.length > 1) {
    htmlOutput += '  </tbody>\n</table>\n';
  } else {
    htmlOutput += '  </thead>\n</table>\n';
  }

  return htmlOutput;
};