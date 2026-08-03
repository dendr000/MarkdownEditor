// src/components/editor/toolbar/sqlBuilder/dml/DmlTableNode.jsx v1.1
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlTableNode.jsx
 * 파일 설명: React Flow 캔버스에 렌더링되는 커스텀 노드(Node) 컴포넌트입니다.
 * dml 하위 폴더로 이동 조치되었습니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 */
import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Table2, Key, X } from 'lucide-react';

function DmlTableNode({ id, data }) {
  console.log(`[DmlTableNode v1.2] 커스텀 노드 렌더링 - 테이블명: ${data.tableName}`);
  
  const { setNodes, setEdges } = useReactFlow();

  const handleDeleteNode = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div style={{ width: '200px', backgroundColor: '#ffffff', border: '1px solid #0969da', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
      
      {/* 테이블 노드 헤더 */}
      <div style={{ backgroundColor: '#0969da', color: '#ffffff', padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table2 size={16} />
          {data.tableName}
        </div>
        <button 
          onClick={handleDeleteNode}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          title="캔버스에서 제거"
        >
          <X size={14} />
        </button>
      </div>

      {/* 테이블 컬럼 목록 및 연결 Handle */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {data.columns && data.columns.map((colName, idx) => {
          // 편의상 id나 _id가 포함되면 열쇠(Key) 아이콘을 표시합니다.
          const isKey = colName.toLowerCase().includes('id');
          
          return (
            <div key={idx} style={{ position: 'relative', padding: '6px 12px', borderBottom: '1px solid #f0f3f6', fontSize: '12px', color: '#24292f', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
              
              {/* 왼쪽 타겟(Target) 핸들 - 선을 받는 곳 */}
              <Handle 
                type="target" 
                position={Position.Left} 
                id={colName} 
                style={{ background: '#0969da', width: '8px', height: '8px', left: '-4px' }} 
              />
              
              {isKey && <Key size={12} style={{ color: '#cf222e' }} />}
              <span style={{ flex: 1 }}>{colName}</span>

              {/* 오른쪽 소스(Source) 핸들 - 선이 시작되는 곳 */}
              <Handle 
                type="source" 
                position={Position.Right} 
                id={colName} 
                style={{ background: '#2da44e', width: '8px', height: '8px', right: '-4px' }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DmlTableNode;