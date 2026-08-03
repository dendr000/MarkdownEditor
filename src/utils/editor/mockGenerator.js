// src/utils/editor/mockGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/mockGenerator.js
 * 파일 설명: SQL CREATE TABLE 스키마를 파싱하여 무작위 더미 데이터(INSERT 문) 및 프로시저 스크립트를 생성하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/MockDataModal.jsx
 */

// SQL 구문에서 테이블명과 컬럼 타입 추출
export const parseSqlForMock = (sql) => {
  if (!sql) return [];
  const tables = [];
  
  // 1. 전역 커스텀 룰(테이블 외부 주석) 사전 추출 (예: -- name: 김덕배, 하덕배)
  const globalMocks = {};
  const globalMockRegex = /(?:^|\n)\s*--\s*([a-zA-Z0-9_]+)\s*:\s*([^\r\n]+)/g;
  let gMatch;
  while ((gMatch = globalMockRegex.exec(sql)) !== null) {
    const key = gMatch[1].trim().toLowerCase();
    // 'mock' 키워드는 인라인 주석 전용이므로 제외
    if (key !== 'mock') {
      globalMocks[key] = gMatch[2].split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // 2. CREATE TABLE 본문 파싱
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s*\(([\s\S]*?)\)\s*(?:;|ENGINE|DEFAULT|CHARACTER|PARTITION|$)/gi;
  let match;

  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1].replace(/[`"']/g, '');
    const columnsRaw = match[2];
    const columns = [];
    
    let current = '';
    let depth = 0;
    for (let i = 0; i < columnsRaw.length; i++) {
      if (columnsRaw[i] === '(') depth++;
      else if (columnsRaw[i] === ')') depth--;
      else if (columnsRaw[i] === ',' && depth === 0) {
        columns.push(current.trim());
        current = '';
        continue;
      }
      current += columnsRaw[i];
    }
    if (current.trim()) columns.push(current.trim());

    const parsedCols = columns.map(c => {
      const clean = c.replace(/(--.*|\/\*.*?\*\/)/g, '').trim();
      if (!clean || /^(PRIMARY KEY|CONSTRAINT|FOREIGN KEY|UNIQUE|KEY)/i.test(clean)) return null;
      
      const parts = clean.split(/\s+/);
      const name = (parts[0] || '').replace(/[`"']/g, '');
      const type = (parts[1] || 'VARCHAR').toUpperCase();

      // 3. 커스텀 룰 매핑 (인라인 우선 -> 전역 룰 순서로 적용)
      let customMock = null;
      const inlineMockMatch = c.match(/(?:--|\/\*)\s*mock\s*:\s*([^*/\n]+)/i);
      
      if (inlineMockMatch) {
        customMock = inlineMockMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      } else if (globalMocks[name.toLowerCase()]) {
        customMock = globalMocks[name.toLowerCase()];
      }

      return { name, type, customMock };
    }).filter(Boolean);

    if (parsedCols.length > 0) {
      tables.push({ name: tableName, columns: parsedCols });
    }
  }
  return tables;
};

// 타입 및 커스텀 룰별 무작위 데이터 생성기
const generateRandomValue = (col, index) => {
  // 1. 커스텀 룰(-- mock: 값)이 있으면 무조건 우선 적용
  if (col.customMock && col.customMock.length > 0) {
    const randomItem = col.customMock[Math.floor(Math.random() * col.customMock.length)];
    return isNaN(randomItem) ? `'${randomItem}'` : randomItem;
  }

  const type = col.type;
  const name = col.name.toLowerCase();

  // 2. 컬럼명 기반 스마트 기본값 (한국어 특화)
  if (name.includes('name') || name.includes('이름')) {
    const names = ['김덕배', '하덕배', '홍길동', '이순신', '유관순', '강감찬', '사용자1', '사용자2'];
    return `'${names[Math.floor(Math.random() * names.length)]}'`;
  }
  if (name.includes('email') || name.includes('메일')) {
    return `'user${index}@example.com'`;
  }
  if (name.includes('phone') || name.includes('tel') || name.includes('연락처')) {
    return `'010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}'`;
  }

  // 3. 기본 타입 기반 무작위 생성
  if (type.includes('INT') || type.includes('BIGINT')) {
    if (name === 'id' || name.includes('_id')) return index; // ID는 순차 증가
    return Math.floor(Math.random() * 100000) + 1;
  }
  if (type.includes('VARCHAR') || type.includes('TEXT') || type.includes('CHAR')) {
    return `'Data_${index}_${Math.random().toString(36).substring(2, 7)}'`;
  }
  if (type.includes('DATE') || type.includes('DATETIME')) {
    const year = 2020 + Math.floor(Math.random() * 6);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `'${year}-${month}-${day}'`;
  }
  if (type.includes('BOOLEAN') || type.includes('TINYINT')) {
    return Math.random() > 0.5 ? 'TRUE' : 'FALSE';
  }
  if (type.includes('FLOAT') || type.includes('DOUBLE') || type.includes('DECIMAL')) {
    return (Math.random() * 1000).toFixed(2);
  }
  return `'Value_${index}'`;
};

// 단순 INSERT 더미 데이터 스크립트 생성
export const generateMockData = (tables, rowsCount) => {
  let result = '';
  tables.forEach(table => {
    result += `-- [더미 데이터] ${table.name} 테이블 (${rowsCount}건 생성)\n`;
    const colNames = table.columns.map(c => c.name).join(', ');
    
    for (let i = 1; i <= rowsCount; i++) {
      const values = table.columns.map(col => generateRandomValue(col, i)).join(', ');
      result += `INSERT INTO ${table.name} (${colNames}) VALUES (${values});\n`;
    }
    result += '\n';
  });
  return result.trim();
};

// DELIMITER $$ 를 포함한 Stored Procedure 스크립트 생성
export const generateProcedure = (tables, rowsCount) => {
  let proc = '';
  tables.forEach(table => {
    const colNames = table.columns.map(c => c.name).join(', ');
    const procName = `InsertDummyData_${table.name}`;
    
    proc += `DELIMITER $$\n\n`;
    proc += `CREATE PROCEDURE ${procName}()\n`;
    proc += `BEGIN\n`;
    proc += `  DECLARE i INT DEFAULT 1;\n`;
    proc += `  WHILE i <= ${rowsCount} DO\n`;

    const values = table.columns.map(col => {
      // 1. 커스텀 룰 (프로시저 환경에서는 ELT와 RAND 함수 활용)
      if (col.customMock && col.customMock.length > 0) {
        const items = col.customMock.map(item => isNaN(item) ? `'${item}'` : item).join(', ');
        return `ELT(FLOOR(1 + (RAND() * ${col.customMock.length})), ${items})`;
      }

      const name = col.name.toLowerCase();
      
      // 2. 컬럼명 기반 스마트 룰 (프로시저 환경)
      if (name.includes('name') || name.includes('이름')) {
        return `ELT(FLOOR(1 + (RAND() * 6)), '김덕배', '하덕배', '홍길동', '이순신', '사용자1', '사용자2')`;
      }
      if (name.includes('email') || name.includes('메일')) {
        return `CONCAT('user', i, '@example.com')`;
      }
      if (name.includes('phone') || name.includes('tel') || name.includes('연락처')) {
        return `CONCAT('010-', FLOOR(1000 + RAND() * 9000), '-', FLOOR(1000 + RAND() * 9000))`;
      }

      // 3. 기본 타입
      if (col.type.includes('INT')) {
        if (name === 'id' || name.includes('_id')) return 'i'; // ID는 루프 인덱스로 처리
        return 'FLOOR(RAND() * 100000)';
      }
      if (col.type.includes('VARCHAR') || col.type.includes('TEXT')) return `CONCAT('Data_', i, '_', SUBSTRING(MD5(RAND()), 1, 5))`;
      if (col.type.includes('DATE')) return `CURRENT_DATE - INTERVAL FLOOR(RAND() * 365) DAY`;
      if (col.type.includes('BOOLEAN')) return `IF(RAND() > 0.5, TRUE, FALSE)`;
      if (col.type.includes('FLOAT')) return `ROUND(RAND() * 1000, 2)`;
      return `i`;
    });

    proc += `    INSERT INTO ${table.name} (${colNames}) VALUES (${values.join(', ')});\n`;
    proc += `    SET i = i + 1;\n`;
    proc += `  END WHILE;\n`;
    proc += `END$$\n\n`;
    proc += `DELIMITER ;\n\n`;
    proc += `-- 생성된 프로시저 실행 방법:\n`;
    proc += `-- CALL ${procName}();\n\n`;
  });
  return proc.trim();
};