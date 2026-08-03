// src/components/editor/toolbar/MockDataModal.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/MockDataModal.jsx
 * 파일 설명: 사용자가 입력한 CREATE TABLE 구문을 분석하여 더미 데이터 또는 프로시저 쿼리를 자동 생성하는 모달 UI입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useState, useEffect } from 'react';
import { X, Database, Copy, Play } from 'lucide-react';
import { parseSqlForMock, generateMockData, generateProcedure } from '../../../utils/editor/mockGenerator';
import { copyToClipboard } from '../../../utils/clipboard';

function MockDataModal({ isOpen, onClose, markdown, onInsert }) {
  const [tab, setTab] = useState('mock'); // 'mock' | 'procedure'
  const [sqlInput, setSqlInput] = useState('');
  const [rowCount, setRowCount] = useState(50);
  const [output, setOutput] = useState('');
  const [parsedTables, setParsedTables] = useState([]);
  
  // 모달이 열릴 때 에디터의 마크다운 텍스트를 기본값으로 파싱
  useEffect(() => {
    if (isOpen) {
      setSqlInput(markdown || '');
      setOutput('');
    }
  }, [isOpen, markdown]);

  // 입력된 SQL이 변경될 때마다 테이블 구조 실시간 분석
  useEffect(() => {
    const tables = parseSqlForMock(sqlInput);
    setParsedTables(tables);
  }, [sqlInput]);

  const handleGenerate = () => {
    if (parsedTables.length === 0) {
      alert('분석 가능한 CREATE TABLE 구문이 없습니다. 스키마를 먼저 작성해 주세요.');
      return;
    }
    
    let generated = '';
    if (tab === 'mock') {
      generated = generateMockData(parsedTables, rowCount);
    } else {
      generated = generateProcedure(parsedTables, rowCount);
    }
    setOutput(generated);
  };

  const handleCopy = async () => {
    if (!output) return;
    const success = await copyToClipboard(output);
    if (success) alert('클립보드에 복사되었습니다.');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '800px', height: '650px', maxHeight: '90vh', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 28px rgba(0,0,0,0.2)' }}>
        
        <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} /> SQL 더미 데이터 / 프로시저 생성기
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 좌측: 입력 및 설정 패널 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', borderRight: '1px solid #d0d7de' }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#24292f' }}>분석 대상 SQL 스키마 (CREATE TABLE):</label>
              <div style={{ fontSize: '11px', color: '#57606a', marginTop: '4px' }}>
                ※ 특정 데이터를 원할 경우 <b>-- mock: 값</b>을 적거나, 하단에 <b>-- 컬럼명: 값1, 값2</b>로 지정해 주세요.
              </div>
            </div>
            <textarea 
              value={sqlInput} 
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="CREATE TABLE users (&#10;  id INT,&#10;  name VARCHAR(50)&#10;);&#10;&#10;-- name: 김덕배, 하덕배&#10;-- email: test@test.com"
              style={{ flex: 1, padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', resize: 'none', outline: 'none' }}
            />
            
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#57606a' }}>
              <strong>분석된 테이블:</strong> {parsedTables.length}개 
              {parsedTables.length > 0 && ` (${parsedTables.map(t => t.name).join(', ')})`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#24292f' }}>생성할 데이터 개수:</label>
              <input 
                type="number" 
                value={rowCount} 
                onChange={(e) => setRowCount(Number(e.target.value) || 1)}
                min="1" max="10000"
                style={{ width: '80px', padding: '6px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '12px', color: '#8c959f' }}>줄 (행)</span>
            </div>
          </div>

          {/* 우측: 출력 탭 및 결과 패널 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', backgroundColor: '#f6f8fa' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #d0d7de', marginBottom: '12px' }}>
              <button onClick={() => setTab('mock')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: tab === 'mock' ? '2px solid #0969da' : 'none', fontWeight: tab === 'mock' ? 'bold' : 'normal', color: tab === 'mock' ? '#0969da' : '#57606a', cursor: 'pointer' }}>더미 데이터 (INSERT)</button>
              <button onClick={() => setTab('procedure')} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: tab === 'procedure' ? '2px solid #0969da' : 'none', fontWeight: tab === 'procedure' ? 'bold' : 'normal', color: tab === 'procedure' ? '#0969da' : '#57606a', cursor: 'pointer' }}>프로시저 (PROCEDURE)</button>
            </div>

            <button onClick={handleGenerate} style={{ width: '100%', padding: '10px', backgroundColor: '#2da44e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px' }}>
              <Play size={16} /> 쿼리 스크립트 생성
            </button>

            <textarea 
              value={output} 
              readOnly
              placeholder="생성된 쿼리가 이곳에 표시됩니다."
              style={{ flex: 1, padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', resize: 'none', outline: 'none', backgroundColor: '#ffffff', whiteSpace: 'pre' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={handleCopy} disabled={!output} style={{ flex: 1, padding: '8px', backgroundColor: output ? '#0969da' : '#8c959f', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: output ? 'pointer' : 'not-allowed' }}>
                <Copy size={16} /> 클립보드 복사
              </button>
              <button onClick={() => { onInsert(output); onClose(); }} disabled={!output} style={{ flex: 1, padding: '8px', backgroundColor: output ? '#24292f' : '#8c959f', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: output ? 'pointer' : 'not-allowed' }}>
                에디터 위치에 삽입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockDataModal;