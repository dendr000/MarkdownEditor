// src/components/preview/SqlErdViewer.jsx v1.0
/*
 * 파일 위치: src/components/preview/SqlErdViewer.jsx
 * 파일 설명: SqlViewer에서 파싱된 테이블 데이터를 넘겨받아 React Flow 노드와 엣지로 변환하고 배치하는 ERD 메인 뷰어입니다.
 * 연결 위치: src/components/preview/SqlViewer.jsx
 * 기능: 테이블 간의 FOREIGN KEY 참조 관계를 정규식으로 추출하여 선(Edge)으로 연결하고, 그리드 형태의 오토 레이아웃을 계산합니다.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, MarkerType, applyNodeChanges, applyEdgeChanges, Panel, MiniMap } from 'reactflow';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import 'reactflow/dist/style.css';
import ErdNode from './ErdNode';

// React Flow에 커스텀 노드를 등록하기 위한 객체입니다.
const nodeTypes = {
  erdNode: ErdNode,
};

function SqlErdViewer({ parsedTables }) {
  console.log("[SqlErdViewer v1.0] ERD 다이어그램 변환 및 렌더링 시작");

  const { initialNodes, initialEdges } = useMemo(() => {
    console.log("[SqlErdViewer v1.0] 파싱된 테이블 데이터를 기반으로 노드 및 엣지 계산 시작");
    
    const nodes = [];
    const edges = [];
    
    // 단순 그리드 배치를 위한 x, y 좌표 추적 변수입니다.
    let currentX = 50;
    let currentY = 50;
    const X_SPACING = 350;
    const Y_SPACING = 300;
    const MAX_COLUMNS = 3; // 한 줄에 배치할 최대 테이블 개수

    parsedTables.forEach((table, index) => {
      console.log(`[SqlErdViewer v1.0] 테이블 노드 생성 중: ${table.name}`);
      
      // 1. 노드(테이블) 생성
      nodes.push({
        id: table.name,
        type: 'erdNode', // 등록된 커스텀 노드 타입 지정
        position: { x: currentX, y: currentY },
        data: { 
          label: table.name,
          columns: table.columns 
        }
      });

      // 다음 테이블을 위한 좌표 계산 (그리드 레이아웃)
      if ((index + 1) % MAX_COLUMNS === 0) {
        currentX = 50;
        currentY += Y_SPACING;
      } else {
        currentX += X_SPACING;
      }

      // 2. 엣지(관계선) 생성을 위한 FOREIGN KEY 탐색
      table.columns.forEach(col => {
        // 테이블 레벨 제약 조건 (FOREIGN KEY (...) REFERENCES target_table(...))
        if (col.isConstraint && col.text.toUpperCase().includes('FOREIGN KEY')) {
          const match = col.text.match(/REFERENCES\s+([a-zA-Z0-9_]+)/i);
          if (match) {
            const targetTable = match[1].replace(/[`"']/g, '');
            console.log(`[SqlErdViewer v1.0] 테이블 레벨 외래키 감지: ${table.name} -> ${targetTable}`);
            
            edges.push({
              id: `e-${table.name}-${targetTable}-${index}`,
              source: table.name,
              target: targetTable,
              type: 'smoothstep', // 부드러운 꺾은선 스타일 적용
              animated: false,
              style: { stroke: '#0969da', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#0969da' }
            });
          }
        } 
        // 컬럼 레벨 제약 조건 (col_name INT REFERENCES target_table(...))
        else if (!col.isConstraint && col.extra && col.extra.toUpperCase().includes('REFERENCES')) {
          const match = col.extra.match(/REFERENCES\s+([a-zA-Z0-9_]+)/i);
          if (match) {
            const targetTable = match[1].replace(/[`"']/g, '');
            console.log(`[SqlErdViewer v1.0] 컬럼 레벨 외래키 감지: ${table.name} -> ${targetTable}`);
            
            edges.push({
              id: `e-${table.name}-${targetTable}-${col.name}`,
              source: table.name,
              target: targetTable,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#0969da', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#0969da' }
            });
          }
        }
      });
    });

    console.log("[SqlErdViewer v1.0] 노드/엣지 계산 완료");
    return { initialNodes: nodes, initialEdges: edges };
  }, [parsedTables]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // 상위 컴포넌트에서 파싱된 테이블이 변경될 경우 상태를 동기화합니다.
  useEffect(() => {
    console.log("[SqlErdViewer v1.0] SQL 데이터 변경 감지, 뷰어 업데이트");
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const flowWrapperRef = useRef(null);

  const handleDownloadImage = useCallback(() => {
    if (flowWrapperRef.current === null) return;
    
    console.log("[SqlErdViewer v1.1] 고해상도 ERD 이미지 다운로드 시작");
    
    // 현재 화면에 보이는 상태 그대로 픽셀 비율(해상도)만 4배로 증폭하여 캡처합니다.
    toPng(flowWrapperRef.current, {
      backgroundColor: '#f6f8fa',
      pixelRatio: 4, 
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'erd-diagram.png';
        link.href = dataUrl;
        link.click();
        console.log("[SqlErdViewer v1.1] 고해상도 ERD 이미지 다운로드 완료");
      })
      .catch((err) => {
        console.error("[SqlErdViewer v1.1] 이미지 캡처 실패:", err);
      });
  }, []);

  return (
    <div 
      ref={flowWrapperRef}
      style={{ width: '100%', height: 'calc(100vh - 150px)', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f6f8fa' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#d0d7de" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => '#1d3557'}
          maskColor="rgba(246, 248, 250, 0.7)"
          style={{ border: '1px solid #d0d7de', borderRadius: '4px', backgroundColor: '#ffffff' }}
        />
        <Panel position="top-right">
          <button 
            onClick={handleDownloadImage}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', backgroundColor: '#ffffff',
              border: '1px solid #d0d7de', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: '#24292f', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <Download size={16} color="#0969da" />
            고해상도 캡처
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default SqlErdViewer;