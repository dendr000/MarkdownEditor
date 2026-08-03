// src/components/editor/toolbar/SqlQueryBuilderModal.jsx v1.3
/*
 * 파일 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 최상위 모달 컨트롤러입니다.
 * (v1.3 수정사항): 전달받은 fileExt를 바탕으로 마크다운 외부의 순수 코드 파일(.sql, .java 등)에 백틱 래핑을 방지합니다.
 * 연결 위치: src/components/editor/EditorModals.jsx
 */
import React, { useState, useEffect } from 'react';
import { X, TableProperties, Network, ShieldCheck } from 'lucide-react';
import DdlGridPanel from './sqlBuilder/ddl/DdlGridPanel'; 
import DmlGridPanel from './sqlBuilder/dml/DmlGridPanel'; 
import DclMatrixPanel from './sqlBuilder/dcl/DclMatrixPanel'; 

function SqlQueryBuilderModal({ isOpen, onClose, initialValue, onInsert, fileExt }) {
  const [currentMode, setCurrentMode] = useState('DDL');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen && initialValue) {
      console.log("[SqlQueryBuilderModal v1.3] 에디터 선택 텍스트 감지, 자동 탭 라우팅 실행");
      const upperText = initialValue.toUpperCase();
      if (upperText.includes('CREATE TABLE') || upperText.includes('ALTER TABLE')) {
        setCurrentMode('DDL');
      } else if (upperText.includes('SELECT') || upperText.includes('JOIN')) {
        setCurrentMode('DML');
      } else if (upperText.includes('GRANT') || upperText.includes('REVOKE')) {
        setCurrentMode('DCL');
      }
    }
  }, [isOpen, initialValue]);

  const handleModeChange = (mode) => {
    if (mode === currentMode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(mode);
      setIsTransitioning(false);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      {/* 캔버스 및 작업 영역 확장을 위해 모달 규격을 1100px -> 1400px, 높이를 750px -> 800px로 확대합니다. */}
      <div className="diagram-modal-content" style={{ width: '1400px', height: '800px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa' }}>
          <div className="header-title-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableProperties size={20} style={{ color: '#0969da' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#24292f' }}>시각적 SQL 쿼리 빌더 (Visual Query Builder)</h3>
          </div>
          <button className="close-x-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}>
            <X size={20} />
          </button>
        </div>

        <div className="diagram-modal-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ width: '220px', borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#57606a', borderBottom: '1px solid #d0d7de' }}>작업 모드 선택</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
              <button 
                onClick={() => handleModeChange('DDL')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DDL' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DDL' ? '#0969da' : '#24292f' }}
              >
                <TableProperties size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DDL (스키마 정의)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>CREATE, ALTER, DROP</div>
                </div>
              </button>

              <button 
                onClick={() => handleModeChange('DML')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DML' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DML' ? '#0969da' : '#24292f' }}
              >
                <Network size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DML (데이터 조작)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>SELECT, INSERT, JOIN</div>
                </div>
              </button>

              <button 
                onClick={() => handleModeChange('DCL')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DCL' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DCL' ? '#0969da' : '#24292f' }}
              >
                <ShieldCheck size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DCL (권한 제어)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>GRANT, REVOKE</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            backgroundColor: '#f6f8fa', 
            padding: '24px', 
            overflowY: 'auto',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.15s ease-in-out',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {currentMode === 'DDL' && (
              <DdlGridPanel 
                initialValue={initialValue} 
                onInsert={(rawSql) => { 
                  if (!onInsert) return;
                  const isMarkdown = !fileExt || ['md', 'txt', 'mdx'].includes(fileExt.toLowerCase());
                  const finalCode = isMarkdown ? `\n\`\`\`sql\n${rawSql}\n\`\`\`\n` : `\n${rawSql}\n`;
                  onInsert(finalCode); 
                  onClose(); 
                }} 
              />
            )}

            {currentMode === 'DML' && (
              <DmlGridPanel 
                onInsert={(rawSql) => { 
                  if (!onInsert) return;
                  const isMarkdown = !fileExt || ['md', 'txt', 'mdx'].includes(fileExt.toLowerCase());
                  const finalCode = isMarkdown ? `\n\`\`\`sql\n${rawSql}\n\`\`\`\n` : `\n${rawSql}\n`;
                  onInsert(finalCode); 
                  onClose(); 
                }} 
                fileExt={fileExt}
              />
            )}

            {currentMode === 'DCL' && (
              <DclMatrixPanel 
                onInsert={(rawSql) => { 
                  if (!onInsert) return;
                  const isMarkdown = !fileExt || ['md', 'txt', 'mdx'].includes(fileExt.toLowerCase());
                  const finalCode = isMarkdown ? `\n\`\`\`sql\n${rawSql}\n\`\`\`\n` : `\n${rawSql}\n`;
                  onInsert(finalCode); 
                  onClose(); 
                }} 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SqlQueryBuilderModal;