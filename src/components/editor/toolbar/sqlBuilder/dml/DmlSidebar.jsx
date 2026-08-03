// src/components/editor/toolbar/sqlBuilder/dml/DmlSidebar.jsx v1.1
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlSidebar.jsx
 * 파일 설명: DML 워크스페이스 좌측에 위치하여, 캔버스로 드래그 앤 드롭할 수 있는 가상 테이블 목록을 제공합니다.
 * dml 하위 폴더로 이동 조치되었습니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 */
import React, { useState } from 'react';
import { Database, GripVertical, Plus, Trash2, Edit2, Check } from 'lucide-react';

function DmlSidebar() {
  console.log("[DmlSidebar v1.3] DML 사이드바 렌더링 시작");

  const [tables, setTables] = useState([
    { name: 'users', columns: ['id', 'username', 'email', 'address', 'created_at'] },
    { name: 'orders', columns: ['order_id', 'user_id', 'total_amount', 'status'] },
    { name: 'products', columns: ['product_id', 'name', 'price', 'stock'] }
  ]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState('');
  const [editIndex, setEditIndex] = useState(null); // 수정 모드 인덱스 상태

  const onDragStart = (event, tableData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(tableData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddTable = () => {
    if (!newTableName.trim() || !newTableColumns.trim()) return;
    const columns = newTableColumns.split(',').map(c => c.trim()).filter(c => c);
    
    if (editIndex !== null) {
      const updatedTables = [...tables];
      updatedTables[editIndex] = { name: newTableName.trim(), columns };
      setTables(updatedTables);
      setEditIndex(null);
    } else {
      setTables([...tables, { name: newTableName.trim(), columns }]);
    }
    
    setNewTableName('');
    setNewTableColumns('');
  };

  const handleEditClick = (index) => {
    setNewTableName(tables[index].name);
    setNewTableColumns(tables[index].columns.join(', '));
    setEditIndex(index);
  };

  const handleRemoveTable = (index) => {
    const updatedTables = [...tables];
    updatedTables.splice(index, 1);
    setTables(updatedTables);
    if (editIndex === index) {
      setEditIndex(null);
      setNewTableName('');
      setNewTableColumns('');
    }
  };

  return (
    <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', fontSize: '13px', fontWeight: 'bold', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={16} /> 테이블 커스텀 목록
      </div>
      
      {/* 커스텀 테이블 추가 폼 */}
      <div style={{ padding: '12px', borderBottom: '1px solid #d0d7de', backgroundColor: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="새 테이블명 (예: address)" 
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
        />
        <input 
          type="text" 
          placeholder="컬럼 목록 (쉼표 구분)" 
          value={newTableColumns}
          onChange={(e) => setNewTableColumns(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTable()}
          style={{ padding: '6px 8px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
        />
        <button 
          onClick={handleAddTable}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', backgroundColor: editIndex !== null ? '#2da44e' : '#0969da', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
        >
          {editIndex !== null ? <><Check size={14} /> 테이블 수정 완료</> : <><Plus size={14} /> 테이블 추가</>}
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: '11px', color: '#57606a', marginBottom: '8px' }}>
          * 테이블을 우측 캔버스로 드래그하세요.
        </div>
        
        {tables.map((table, idx) => (
          <div 
            key={`${table.name}-${idx}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            draggable
            onDragStart={(e) => onDragStart(e, table)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <GripVertical size={14} style={{ color: '#8c959f', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#24292f', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{table.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                onClick={() => handleEditClick(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0969da', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="테이블 수정"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => handleRemoveTable(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="테이블 삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DmlSidebar;