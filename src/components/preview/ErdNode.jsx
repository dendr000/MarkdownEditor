// src/components/preview/ErdNode.jsx v1.0
/*
 * 파일 위치: src/components/preview/ErdNode.jsx
 * 파일 설명: React Flow에서 ERD(Entity-Relationship Diagram)의 개별 테이블을 시각적으로 렌더링하는 커스텀 노드 컴포넌트입니다.
 * 연결 위치: src/components/preview/SqlErdViewer.jsx
 * 기능: dbdiagram.io 스타일의 다크 블루 헤더와 화이트 바디를 적용하여 테이블 명칭과 컬럼(PK, FK 포함) 목록을 출력합니다.
 */
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Key } from 'lucide-react';

function ErdNode({ data }) {
  console.log(`[ErdNode v1.0] ERD 노드 렌더링 시작 - 테이블명: ${data.label}`);

  return (
    <div style={{ 
      minWidth: '220px', 
      backgroundColor: '#ffffff', 
      border: '1px solid #d0d7de', 
      borderRadius: '6px', 
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontFamily: 'monospace'
    }}>
      {/* 
        테이블 명칭이 표시되는 헤더 영역입니다. 
        사용자 요청 사진과 유사한 다크 블루 색상 테마를 적용했습니다. 
      */}
      <div style={{ 
        backgroundColor: '#1d3557', 
        color: '#ffffff', 
        padding: '10px 12px', 
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{data.label}</span>
      </div>

      {/* 테이블의 컬럼 목록이 렌더링되는 바디 영역입니다. */}
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
        {data.columns.map((col, idx) => {
          console.log(`[ErdNode v1.0] 컬럼 렌더링 - ${col.name || '제약조건'}`);
          
          // 제약 조건일 경우 별도의 하이라이트 스타일을 적용합니다.
          if (col.isConstraint) {
            return (
              <div key={idx} style={{ 
                padding: '4px 12px', 
                backgroundColor: '#fff8c5', 
                color: '#9a6700',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Key size={12} />
                <span>{col.text}</span>
              </div>
            );
          }

          // 일반 컬럼일 경우 이름과 데이터 타입을 양쪽 정렬하여 출력합니다.
          return (
            <div key={idx} style={{ 
              padding: '4px 12px', 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#24292f',
              borderBottom: idx < data.columns.length - 1 ? '1px solid #f0f2f4' : 'none'
            }}>
              <span style={{ fontWeight: '600' }}>{col.name}</span>
              <span style={{ color: '#0969da', marginLeft: '12px' }}>{col.type}</span>
            </div>
          );
        })}
      </div>

      {/* 
        관계선(Edge)이 연결될 수 있는 좌우 핸들입니다. 
        시각적 방해를 최소화하기 위해 투명도를 조절했습니다. 
      */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#555', width: '6px', height: '6px' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#555', width: '6px', height: '6px' }} 
      />
    </div>
  );
}

export default ErdNode;