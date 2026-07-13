// src/utils/tableConverter.js v2.0
/*
 * 파일 설명: 마크다운 표 문자열을 2차원 그리드 객체 배열로 파싱하고, 역으로 그리드 배열을 마크다운 표 문법으로 생성하는 상호 변환 유틸리티입니다.
 * 깃허브 마크다운(GFM)의 인라인 서식(굵게, 기울임, 취소선) 파싱 및 표 내부 파이프(|) 특수기호 이스케이프 처리가 포함되어 있습니다.
 * 연결 위치: 표 모달 컴포넌트 또는 에디터 툴바의 변환 기능 트리거 시 호출되어 사용됩니다.
 */

/**
 * 마크다운 표 텍스트를 분석하여 2차원 그리드(Grid) 상태 배열로 변환합니다.
 * @param {string} mdText - 마크다운 표 형태의 문자열
 * @returns {Array|null} 2차원 그리드 배열 객체 또는 실패 시 null
 */
export const parseMdToGrid = (mdText) => {
  console.log("parseMdToGrid 실행 - 마크다운 텍스트 파싱 시작");
  
  if (!mdText || mdText.trim() === '') {
    console.log("[로그] 입력된 마크다운 텍스트가 비어 있어 파싱을 중단합니다.");
    return null;
  }

  // 줄바꿈 기준으로 행 분리 후 양끝 공백 제거 및 빈 줄 필터링
  const lines = mdText.split('\n').map(line => line.trim()).filter(line => line !== '');
  
  // 구분선 행( 예: |--|:|--:| ) 위치 찾기 및 순수 데이터 행 분류
  const separatorIndex = lines.findIndex(line => /^[|\s\-:]+$/.test(line) && line.includes('-'));
  
  if (separatorIndex === -1) {
    console.log("[로그] 마크다운 구분선(---)을 찾지 못해 유효한 표가 아닌 것으로 판단합니다.");
    return null;
  }

  console.log(`[로그] 구분선 확인 완료. 구분선 행 인덱스: ${separatorIndex}`);

  // 구분선 행을 파이프(|) 기준으로 분리하여 각 열의 정렬 상태 파악
  const separatorParts = lines[separatorIndex].split('|').map(p => p.trim()).filter((_, i, arr) => {
    if (i === 0 && arr[i] === '') return false;
    if (i === arr.length - 1 && arr[i] === '') return false;
    return true;
  });

  // 각 열의 정렬 속성 추출 (:--- 왼쪽, :---: 가운데, ---: 오른쪽)
  const columnAlignments = separatorParts.map(part => {
    const hasLeft = part.startsWith(':');
    const hasRight = part.endsWith(':');
    if (hasLeft && hasRight) return 'center';
    if (hasRight) return 'right';
    return 'left';
  });

  // 구분선 행을 제외한 순수 데이터 행만 필터링
  const dataLines = lines.filter((_, idx) => idx !== separatorIndex);
  const maxRows = dataLines.length;
  
  // 데이터 행을 파싱하여 text를 추출하고 정렬 및 깃허브 지원 서식(Bold, Italic, Strike) 매핑
  const parsedRows = dataLines.map((line, rIndex) => {
    let cleanLine = line;
    // 양 끝 장식용 파이프 제거 (단, 이스케이프된 \| 는 건드리지 않음)
    if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1);
    if (cleanLine.endsWith('|') && !cleanLine.endsWith('\\|')) {
      cleanLine = cleanLine.substring(0, cleanLine.length - 1);
    }
    
    // 이스케이프되지 않은 정규 파이프(|)를 기준으로만 셀을 분할하기 위한 정규식 처리
    // 긍정형 후방 탐색을 지원하지 않는 환경도 고려하여 임시 문자 치환 기법 사용
    const tempLine = cleanLine.replace(/\\\|/g, '@@PIPE@@');
    const splitCells = tempLine.split('|').map(cell => cell.replace(/@@PIPE@@/g, '\\|'));

    return splitCells.map((cell, cIndex) => {
      let text = cell.trim();
      let bold = false;
      let italic = false;
      let strike = false;

      // 마크다운 서식 태그 추출 로직 (단순 매핑용)
      if (text.startsWith('**') && text.endsWith('**')) {
        bold = true;
        text = text.substring(2, text.length - 2).trim();
      }
      if (text.startsWith('~~') && text.endsWith('~~')) {
        strike = true;
        text = text.substring(2, text.length - 2).trim();
      }
      if ((text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) ||
          (text.startsWith('_') && text.endsWith('_') && !text.startsWith('__'))) {
        italic = true;
        text = text.substring(1, text.length - 1).trim();
      }

      // 파싱이 끝난 텍스트 내부의 이스케이프된 파이프 기호를 일반 문자로 복구
      text = text.replace(/\\\|/g, '|');

      const align = columnAlignments[cIndex] || (rIndex === 0 ? 'center' : 'left');
      
      return {
        text,
        align,
        rowSpan: 1, // MD 표는 병합 지원 안 함
        colSpan: 1,
        isHidden: false,
        bold,
        italic,
        strike,
        color: '',   // MD 표는 색상 지원 안 함
        bgColor: ''  // MD 표는 색상 지원 안 함
      };
    });
  });

  if (parsedRows.length === 0) return null;

  const maxCols = Math.max(...parsedRows.map(r => r.length));
  console.log(`[로그] 마크다운 파싱 완료. 크기 - 행: ${maxRows}, 열: ${maxCols}`);

  // 규격 정규화
  const finalGrid = parsedRows.map((row, rIndex) => {
    const newRow = [...row];
    while (newRow.length < maxCols) {
      newRow.push({
        text: '', align: rIndex === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
        bold: false, italic: false, strike: false, color: '', bgColor: ''
      });
    }
    return newRow;
  });

  return finalGrid;
};

/**
 * 2차원 그리드(Grid) 상태 배열을 마크다운 표 문자열 문법으로 변환합니다.
 * @param {Array} grid - 2차원 표 상태 배열
 * @returns {string} 변환 완성된 마크다운 표 문자열
 */
export const generateMdFromGrid = (grid) => {
  console.log("generateMdFromGrid 실행 - 그리드 상태를 마크다운 텍스트로 전환 시작");
  
  if (!grid || grid.length === 0) {
    console.log("[로그] 그리드가 유효하지 않아 빈 문자열을 반환합니다.");
    return '';
  }

  let mdOutput = '\n';
  const colsCount = grid[0].length;

  grid.forEach((row, rIndex) => {
    const rowCells = [];
    
    row.forEach((cell) => {
      // 마크다운은 병합을 지원하지 않으므로 HTML에서 넘어온 구조일지라도 숨겨진 빈 텍스트로 펼쳐서 출력
      if (cell.isHidden) {
        rowCells.push(' ');
        return;
      }

      // 깃허브 표 문법 파괴를 방지하기 위해 텍스트 내부에 사용자가 입력한 파이프(|) 기호를 이스케이프(\|) 처리
      let cellText = cell.text.replace(/\|/g, '\\|');

      // 마크다운 서식 지원 결합
      if (cell.bold) cellText = `**${cellText}**`;
      if (cell.italic) cellText = `*${cellText}*`;
      if (cell.strike) cellText = `~~${cellText}~~`;
      
      rowCells.push(cellText);
    });

    mdOutput += '| ' + rowCells.join(' | ') + ' |\n';

    // 헤더(첫 번째 행) 아래에 정렬 구분선 주입
    if (rIndex === 0) {
      const separatorCells = [];
      for (let c = 0; c < colsCount; c++) {
        const align = grid[0][c].align;
        if (align === 'center') separatorCells.push(':---:');
        else if (align === 'right') separatorCells.push('---:');
        else separatorCells.push(':---');
      }
      mdOutput += '| ' + separatorCells.join(' | ') + ' |\n';
      console.log("[로그] 마크다운 구분선 조립 완료");
    }
  });

  mdOutput += '\n';
  console.log("마크다운 표 최종 문자열 생성 성공");
  return mdOutput;
};