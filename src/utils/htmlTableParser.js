// src/utils/htmlTableParser.js v4.0
/*
 * 파일 설명: HTML 표의 DOM을 분석하여 상태로 반환하고, 상태를 다시 HTML 태그로 렌더링하는 유틸리티 (캡션 지원 추가)
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

  // 캡션 파싱
  const captionNode = table.querySelector('caption');
  const caption = captionNode ? captionNode.textContent.trim() : '';

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
      
      const text = cell.textContent.trim();
      const bold = cell.querySelector('b, strong') !== null;
      const italic = cell.querySelector('i, em') !== null;
      const strike = cell.querySelector('del, s, strike') !== null;
      const color = cell.style.color || '';
      const bgColor = cell.style.backgroundColor || '';

      grid[r][c] = { text, align, rowSpan, colSpan, isHidden: false, bold, italic, strike, color, bgColor };

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

  // grid 배열과 caption 문자열을 묶어서 반환
  return { grid, caption };
};

export const generateHtmlFromGrid = (grid, caption = '') => {
  console.log("generateHtmlFromGrid 실행 - Grid 및 캡션을 HTML 태그로 변환 (깃허브 얼룩말 무늬 방지 적용)");
  let htmlOutput = '\n<table>\n';
  
  if (caption.trim() !== '') {
    htmlOutput += `  <caption>${caption.trim()}</caption>\n`;
  }
  
  htmlOutput += '  <thead>\n';
  
  grid.forEach((row, rIndex) => {
    // 깃허브의 짝수 행 회색 배경(Zebra striping)을 무력화하기 위해 모든 tr 태그에 투명 배경색을 인라인으로 강제 주입합니다.
    // 다크모드/라이트모드 환경에 구애받지 않도록 transparent 속성을 사용합니다.
    if (rIndex === 0) htmlOutput += '    <tr style="background-color: transparent;">\n';
    else if (rIndex === 1) htmlOutput += '  </thead>\n  <tbody>\n    <tr style="background-color: transparent;">\n';
    else htmlOutput += '    <tr style="background-color: transparent;">\n';

    row.forEach((cell) => {
      if (cell.isHidden) return;

      const tag = rIndex === 0 ? 'th' : 'td';
      const rowSpanAttr = cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : '';
      const colSpanAttr = cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : '';
      const alignAttr = ` align="${cell.align}"`;

      const styles = [];
      if (cell.color && cell.color !== 'inherit') styles.push(`color: ${cell.color}`);
      if (cell.bgColor && cell.bgColor !== 'transparent') styles.push(`background-color: ${cell.bgColor}`);
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';

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