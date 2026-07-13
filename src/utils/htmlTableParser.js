// src/utils/htmlTableParser.js v3.0
/*
 * 파일 설명: HTML <table> 문자열을 분석하여 DOM을 통해 병합 속성 및 서식(굵기, 기울임, 취소선, 색상)을 상태 객체로 파싱/생성하는 유틸리티
 * 연결 위치: src/hooks/table/useTableGrid.js 에서 데이터 변환 시 호출됨
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

  const grid = Array.from({ length: maxRows }, () =>
    Array.from({ length: maxCols }, () => ({
      text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false,
      bold: false, italic: false, strike: false, color: '', bgColor: ''
    }))
  );

  let r = 0;
  rows.forEach(tr => {
    let c = 0;
    Array.from(tr.cells).forEach(cell => {
      while (c < maxCols && grid[r][c].isHidden) {
        c++;
      }
      if (c >= maxCols) return;

      const rowSpan = parseInt(cell.getAttribute('rowspan') || '1', 10);
      const colSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const align = cell.getAttribute('align') || (r === 0 ? 'center' : 'left');
      
      // 서식 태그 및 스타일 파싱
      const text = cell.textContent.trim();
      const bold = cell.querySelector('b, strong') !== null;
      const italic = cell.querySelector('i, em') !== null;
      const strike = cell.querySelector('del, s, strike') !== null;
      const color = cell.style.color || '';
      const bgColor = cell.style.backgroundColor || '';

      grid[r][c] = { text, align, rowSpan, colSpan, isHidden: false, bold, italic, strike, color, bgColor };
      console.log(`[${r}, ${c}] 파싱 완료 - 서식 포함`);

      for (let spanR = 0; spanR < rowSpan; spanR++) {
        for (let spanC = 0; spanC < colSpan; spanC++) {
          if (spanR === 0 && spanC === 0) continue;
          if (r + spanR < maxRows && c + spanC < maxCols) {
            grid[r + spanR][c + spanC] = {
              text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: true,
              bold: false, italic: false, strike: false, color: '', bgColor: ''
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
    if (rIndex === 0) htmlOutput += '    <tr>\n';
    else if (rIndex === 1) htmlOutput += '  </thead>\n  <tbody>\n    <tr>\n';
    else htmlOutput += '    <tr>\n';

    row.forEach((cell) => {
      if (cell.isHidden) return;

      const tag = rIndex === 0 ? 'th' : 'td';
      const rowSpanAttr = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
      const colSpanAttr = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
      const alignAttr = ` align="${cell.align}"`;

      // 인라인 스타일 조립
      const styles = [];
      if (cell.color && cell.color !== 'inherit') styles.push(`color: ${cell.color}`);
      if (cell.bgColor && cell.bgColor !== 'transparent') styles.push(`background-color: ${cell.bgColor}`);
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

      // 텍스트 서식 태그 조립
      let innerText = cell.text;
      if (cell.bold) innerText = `<b>${innerText}</b>`;
      if (cell.italic) innerText = `<i>${innerText}</i>`;
      if (cell.strike) innerText = `<strike>${innerText}</strike>`;

      htmlOutput += `      <${tag}${alignAttr}${rowSpanAttr}${colSpanAttr}${styleAttr}>${innerText}</${tag}>\n`;
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