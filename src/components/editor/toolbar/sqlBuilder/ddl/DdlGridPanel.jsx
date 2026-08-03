// src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx v2.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DDL(CREATE/ALTER) 모드 전용 메인 패널입니다.
 * 파일 비대화 방지 및 200줄 이상 규정에 따라 기능별 하위 컴포넌트(Toolbar, ImportArea, GridTable, Preview)로 전면 분리되었으며, 
 * 본 패널은 각 컴포넌트의 상태(State)와 Props 로직을 중앙에서 조율하는 오케스트레이터(Orchestrator) 역할을 수행합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 */
import React, { useState, useEffect, useMemo } from 'react';
import { generateCreateTableSql } from '../../../../../utils/editor/sqlGenerator';
import { highlightCode } from '../../../../../utils/editor/syntaxHighlighter';
import { parseCreateTableSql } from '../../../../../utils/editor/sqlReverseParser';
import { generateMigrationScript } from '../../../../../utils/editor/sqlMigrationGenerator';
import { generateJpaEntity, generateDbml, generateJpaRepository, generateJpaService, generateJpaController } from '../../../../../utils/editor/sqlExportUtils';
import { copyToClipboard } from '../../../../../utils/clipboard';

// 기능별로 분리된 하위 자식 컴포넌트 임포트
import DdlToolbar from './DdlToolbar';
import DdlImportArea from './DdlImportArea';
import DdlGridTable from './DdlGridTable';
import DdlPreview from './DdlPreview';

function DdlGridPanel({ initialValue, onInsert }) {
  // 1. 상태(State) 관리
  const [tableName, setTableName] = useState('new_table');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importSqlText, setImportSqlText] = useState('');
  const [namingConvention, setNamingConvention] = useState('snake'); 
  
  const initialColumns = [
    { id: Date.now().toString(), name: 'id', type: 'BIGINT', length: '', pk: true, nn: true, uq: false, ai: true, comment: '고유 식별자' }
  ];
  const [columns, setColumns] = useState(initialColumns);
  
  const [originalTableName, setOriginalTableName] = useState('new_table');
  const [originalColumns, setOriginalColumns] = useState(JSON.parse(JSON.stringify(initialColumns)));

  // 2. 에디터에서 전달받은 역설계(Reverse Engineering) 초기 파싱 연산
  useEffect(() => {
    if (initialValue && initialValue.toUpperCase().includes('CREATE TABLE')) {
      console.log("[DdlGridPanel v2.0] 역설계 파싱 실행");
      const parsedData = parseCreateTableSql(initialValue);
      
      setTableName(parsedData.tableName);
      setOriginalTableName(parsedData.tableName);
      
      const newCols = parsedData.columns.length > 0 ? parsedData.columns : columns;
      setColumns(newCols);
      setOriginalColumns(JSON.parse(JSON.stringify(newCols)));
    }
  }, [initialValue]);

  // 3. 네이밍 규칙 관련 유틸리티 (Orchestrator 내부 종속)
  const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  const toCamelCase = (str) => str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

  const handleTableNameChange = (val) => {
    setTableName(namingConvention === 'snake' ? toSnakeCase(val) : toCamelCase(val));
  };

  const toggleNamingConvention = () => {
    const newConvention = namingConvention === 'snake' ? 'camel' : 'snake';
    setNamingConvention(newConvention);

    setColumns(prevColumns => prevColumns.map(col => {
      if (!col.name) return col;
      return {
        ...col,
        name: newConvention === 'snake' ? toSnakeCase(col.name) : toCamelCase(col.name)
      };
    }));
  };

  // 4. 그리드 CRUD 조작 함수
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { id: Date.now().toString(), name: '', type: 'VARCHAR', length: '255', pk: false, nn: false, uq: false, ai: false, comment: '' }
    ]);
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = [...columns];
    let finalValue = value;

    if (field === 'name') {
      finalValue = namingConvention === 'snake' ? toSnakeCase(value) : toCamelCase(value);
    }

    updatedColumns[index][field] = finalValue;
    setColumns(updatedColumns);
  };

  const handleDeleteColumn = (index) => {
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 1);
    setColumns(updatedColumns);
  };

  // 5. 실시간 SQL 컴파일 및 캐싱
  const compiledSql = useMemo(() => {
    return generateCreateTableSql(tableName, columns);
  }, [tableName, columns]);

  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  // 6. 외부 연동(Import/Export) 조작 로직
  const handleApplyImport = () => {
    if (!importSqlText.trim()) return;
    const parsedData = parseCreateTableSql(importSqlText);
    setTableName(parsedData.tableName);
    setOriginalTableName(parsedData.tableName);
    
    const newCols = parsedData.columns.length > 0 ? parsedData.columns : columns;
    setColumns(newCols);
    setOriginalColumns(JSON.parse(JSON.stringify(newCols)));
    
    setShowImportArea(false);
    setImportSqlText('');
  };

  const handleExport = async (type) => {
    let text = '';
    switch (type) {
      case 'Migration': text = generateMigrationScript(originalTableName, tableName, originalColumns, columns); break;
      case 'JPA Entity': text = generateJpaEntity(tableName, columns); break;
      case 'Repository': text = generateJpaRepository(tableName, columns); break;
      case 'Service': text = generateJpaService(tableName); break;
      case 'Controller': text = generateJpaController(tableName); break;
      case 'DBML': text = generateDbml(tableName, columns); break;
      default: return;
    }
    
    const success = await copyToClipboard(text);
    if (success) alert(`${type} 코드가 클립보드에 복사되었습니다.`);
  };

  // 7. 자식 컴포넌트 마운트 및 Props 전달
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', minWidth: 0 }}>
      
      <DdlToolbar 
        tableName={tableName}
        onTableNameChange={handleTableNameChange}
        namingConvention={namingConvention}
        toggleNamingConvention={toggleNamingConvention}
        showImportArea={showImportArea}
        setShowImportArea={setShowImportArea}
        handleExport={handleExport}
      />
      
      <DdlImportArea 
        showImportArea={showImportArea}
        setShowImportArea={setShowImportArea}
        importSqlText={importSqlText}
        setImportSqlText={setImportSqlText}
        handleApplyImport={handleApplyImport}
      />
      
      <DdlGridTable 
        columns={columns}
        handleColumnChange={handleColumnChange}
        handleDeleteColumn={handleDeleteColumn}
        handleAddColumn={handleAddColumn}
      />
      
      <DdlPreview 
        highlightedSql={highlightedSql}
        compiledSql={compiledSql}
        onInsert={onInsert}
      />
      
    </div>
  );
}

export default DdlGridPanel;