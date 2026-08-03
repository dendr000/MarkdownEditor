// src/utils/editor/sqlMigrationGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlMigrationGenerator.js
 * 파일 설명: 기존 스키마 스냅샷과 현재 DDL 그리드의 상태를 비교(Diff)하여,
 * 데이터베이스 마이그레이션에 필요한 ALTER TABLE 스크립트를 자동 생성하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 */

export const generateMigrationScript = (oldTableName, newTableName, oldCols, newCols) => {
  console.log("[sqlMigrationGenerator v1.0] 마이그레이션 스크립트 생성 시작");

  let script = `-- 마이그레이션 스크립트 자동 생성 (Diff 추적)\n`;
  let alters = [];

  // 1. 테이블 이름 변경 추적
  if (oldTableName !== newTableName) {
    script += `RENAME TABLE ${oldTableName} TO ${newTableName};\n\n`;
  }

  const oldMap = new Map(oldCols.filter(c => c.name).map(c => [c.name, c]));
  const newMap = new Map(newCols.filter(c => c.name).map(c => [c.name, c]));

  // 2. 컬럼 삭제 (DROP) - 데이터 유실 방지를 위해 가장 먼저 표기
  oldCols.forEach(oldCol => {
    if (!oldCol.name) return;
    if (!newMap.has(oldCol.name)) {
      alters.push(`DROP COLUMN ${oldCol.name}`);
    }
  });

  // 3. 컬럼 추가 (ADD)
  newCols.forEach(newCol => {
    if (!newCol.name) return;
    if (!oldMap.has(newCol.name)) {
      alters.push(`ADD COLUMN ${buildColumnDef(newCol)}`);
    }
  });

  // 4. 컬럼 속성 수정 (MODIFY)
  newCols.forEach(newCol => {
    if (!newCol.name) return;
    if (oldMap.has(newCol.name)) {
      const oldCol = oldMap.get(newCol.name);
      if (isChanged(oldCol, newCol)) {
        alters.push(`MODIFY COLUMN ${buildColumnDef(newCol)}`);
      }
    }
  });

  // 5. PK(기본키) 변경 추적
  const oldPks = oldCols.filter(c => c.pk).map(c => c.name).sort().join(', ');
  const newPks = newCols.filter(c => c.pk).map(c => c.name).sort().join(', ');
  
  if (oldPks !== newPks) {
    if (oldPks) alters.push(`DROP PRIMARY KEY`);
    if (newPks) alters.push(`ADD PRIMARY KEY (${newPks})`);
  }

  // 최종 스크립트 조립
  if (alters.length > 0) {
    script += `ALTER TABLE ${newTableName}\n  ` + alters.join(',\n  ') + ';\n';
  } else if (oldTableName === newTableName) {
    script += `-- 변경된 스키마 내역이 없습니다.\n`;
  }

  console.log("[sqlMigrationGenerator v1.0] 마이그레이션 스크립트 생성 완료");
  return script;
};

const buildColumnDef = (col) => {
  let def = `${col.name} ${col.type}`;
  const needsLength = ['VARCHAR', 'CHAR', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE'].includes(col.type);
  if (needsLength && col.length && col.length.trim() !== '') {
    def += `(${col.length})`;
  }
  
  if (col.type.includes('INT') && col.ai) def += ' AUTO_INCREMENT';
  if (col.nn && !col.pk) def += ' NOT NULL';
  if (col.uq) def += ' UNIQUE';
  if (col.comment && col.comment.trim() !== '') def += ` COMMENT '${col.comment}'`;
  
  return def;
};

const isChanged = (oldCol, newCol) => {
  return oldCol.type !== newCol.type ||
         oldCol.length !== newCol.length ||
         oldCol.nn !== newCol.nn ||
         oldCol.uq !== newCol.uq ||
         oldCol.ai !== newCol.ai ||
         oldCol.comment !== newCol.comment;
};