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
import { Download, RotateCcw, Upload, FileJson } from 'lucide-react';
import 'reactflow/dist/style.css';
import ErdNode from './ErdNode';

// React Flow에 커스텀 노드를 등록하기 위한 객체입니다.
const nodeTypes = {
  erdNode: ErdNode,
};

function SqlErdViewer({ parsedTables }) {
  console.log("[SqlErdViewer v1.3] ERD 다이어그램 변환 및 렌더링 시작 (JSON 파일 포터블 기능 포함)");

  const { initialNodes, initialEdges } = useMemo(() => {
    console.log("[SqlErdViewer v1.2] 파싱된 테이블 데이터를 기반으로 노드 및 엣지 계산 시작");
    
    const nodes = [];
    const edges = [];
    
    // 단순 그리드 배치를 위한 x, y 좌표 추적 변수입니다.
    let currentX = 50;
    let currentY = 50;
    const X_SPACING = 350;
    const Y_SPACING = 300;
    const MAX_COLUMNS = 3; // 한 줄에 배치할 최대 테이블 개수

    // 브라우저 로컬 스토리지에서 기존에 저장된 노드 위치 데이터를 불러옵니다.
    const savedPositions = JSON.parse(localStorage.getItem('erd-node-positions') || '{}');

    parsedTables.forEach((table, index) => {
      console.log(`[SqlErdViewer v1.2] 테이블 노드 생성 중: ${table.name}`);
      
      // 저장된 위치가 존재하면 그 위치를 사용하고, 없으면 새로 계산한 그리드 좌표를 사용합니다.
      const position = savedPositions[table.name] || { x: currentX, y: currentY };

      // 1. 노드(테이블) 생성
      nodes.push({
        id: table.name,
        type: 'erdNode', // 등록된 커스텀 노드 타입 지정
        position: position,
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
            console.log(`[SqlErdViewer v1.2] 테이블 레벨 외래키 감지: ${table.name} -> ${targetTable}`);
            
            edges.push({
              id: `e-${table.name}-${targetTable}-${index}`,
              source: table.name,
              target: targetTable,
              type: 'smoothstep', // 부드러운 꺾은선 스타일 적용
              animated: true, // dbdiagram처럼 화살표 애니메이션 효과를 활성화합니다.
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
            console.log(`[SqlErdViewer v1.2] 컬럼 레벨 외래키 감지: ${table.name} -> ${targetTable}`);
            
            edges.push({
              id: `e-${table.name}-${targetTable}-${col.name}`,
              source: table.name,
              target: targetTable,
              type: 'smoothstep',
              animated: true, // dbdiagram처럼 화살표 애니메이션 효과를 활성화합니다.
              style: { stroke: '#0969da', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#0969da' }
            });
          }
        }
      });
    });

    console.log("[SqlErdViewer v1.2] 노드/엣지 계산 완료");
    return { initialNodes: nodes, initialEdges: edges };
  }, [parsedTables]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // 상위 컴포넌트에서 파싱된 테이블이 변경될 경우 상태를 동기화합니다.
  useEffect(() => {
    console.log("[SqlErdViewer v1.2] SQL 데이터 변경 감지, 뷰어 업데이트");
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  // 노드 드래그가 끝날 때마다 위치를 로컬 스토리지에 자동 저장하는 함수입니다.
  const onNodeDragStop = useCallback((event, node) => {
    console.log(`[SqlErdViewer v1.2] 노드 드래그 종료, 위치 저장: ${node.id}`);
    const savedPositions = JSON.parse(localStorage.getItem('erd-node-positions') || '{}');
    savedPositions[node.id] = node.position;
    localStorage.setItem('erd-node-positions', JSON.stringify(savedPositions));
  }, []);

  // 노드 위치를 초기 상태(그리드 배열)로 되돌리고 로컬 스토리지를 비우는 함수입니다.
  const handleResetPositions = useCallback(() => {
    console.log("[SqlErdViewer v1.2] 노드 위치 초기화 버튼 클릭");
    localStorage.removeItem('erd-node-positions');
    
    let currentX = 50;
    let currentY = 50;
    const X_SPACING = 350;
    const Y_SPACING = 300;
    const MAX_COLUMNS = 3;
    
    setNodes((nds) => nds.map((node, index) => {
      const newPos = { x: currentX, y: currentY };
      if ((index + 1) % MAX_COLUMNS === 0) {
        currentX = 50;
        currentY += Y_SPACING;
      } else {
        currentX += X_SPACING;
      }
      return { ...node, position: newPos };
    }));
  }, [setNodes]);

  const flowWrapperRef = useRef(null);

  const handleDownloadImage = useCallback(() => {
    if (flowWrapperRef.current === null) return;
    
    console.log("[SqlErdViewer v1.2] 고해상도 ERD 이미지 다운로드 시작");
    
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
        console.log("[SqlErdViewer v1.3] 고해상도 ERD 이미지 다운로드 완료");
      })
      .catch((err) => {
        console.error("[SqlErdViewer v1.3] 이미지 캡처 실패:", err);
      });
  }, []);

  const fileInputRef = useRef(null);

  // 현재 노드들의 좌표를 JSON 파일로 추출하여 다운로드합니다.
  const handleExportCoords = useCallback(() => {
    console.log("[SqlErdViewer v1.3] 좌표 데이터 JSON 내보내기 시작");
    const currentPositions = {};
    nodes.forEach(node => {
      currentPositions[node.id] = node.position;
    });
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPositions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "erd_coords.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [nodes]);

  // JSON 파일을 읽어들여 노드 좌표를 갱신하고 로컬 스토리지에 동기화합니다.
  const handleImportCoords = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("[SqlErdViewer v1.3] 좌표 데이터 JSON 불러오기 시작");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPositions = JSON.parse(e.target.result);
        
        setNodes((nds) => nds.map(node => {
          if (importedPositions[node.id]) {
            return { ...node, position: importedPositions[node.id] };
          }
          return node;
        }));
        
        // 불러온 데이터를 브라우저 로컬 스토리지에도 덮어씌워 영구 유지되게 합니다.
        localStorage.setItem('erd-node-positions', JSON.stringify(importedPositions));
      } catch (error) {
        console.error("[SqlErdViewer v1.3] JSON 파싱 에러:", error);
        alert("유효하지 않은 좌표 파일입니다.");
      }
      
      // 동일한 파일을 다시 선택할 수 있도록 input 초기화
      event.target.value = null;
    };
    reader.readAsText(file);
  }, [setNodes]);

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
        onNodeDragStop={onNodeDragStop}
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
        <Panel position="top-right" style={{ display: 'flex', gap: '8px' }}>
          {/* 파일 불러오기를 위한 숨겨진 input */}
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportCoords} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="저장된 좌표 JSON 파일 불러오기"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', backgroundColor: '#ffffff',
              border: '1px solid #d0d7de', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: '#24292f', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <Upload size={16} color="#9a6700" />
            가져오기
          </button>
          <button 
            onClick={handleExportCoords}
            title="현재 위치를 JSON 파일로 저장"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', backgroundColor: '#ffffff',
              border: '1px solid #d0d7de', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: '#24292f', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <FileJson size={16} color="#2da44e" />
            좌표 저장
          </button>
          <div style={{ width: '1px', backgroundColor: '#d0d7de', margin: '0 4px' }} />
          <button 
            onClick={handleResetPositions}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', backgroundColor: '#ffffff',
              border: '1px solid #d0d7de', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: '#cf222e', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <RotateCcw size={16} color="#cf222e" />
            위치 초기화
          </button>
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