// src/components/tree/TreeNodeItem.jsx v1.0
/*
 * 파일 설명: 폴더 트리 작성기의 개별 노드(행)를 렌더링하는 UI 컴포넌트입니다.
 * 텍스트 입력 후 Tab 키 입력 시 제어 버튼들을 건너뛰고 다음 입력창으로 넘어가도록 모든 버튼에 tabIndex={-1} 속성을 적용했습니다.
 * 연결 위치: src/components/tree/FolderTreeModal.jsx 내부
 */
import React from 'react';
import { Folder, FileText, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';

function TreeNodeItem({ 
  node, 
  idx, 
  totalCount, 
  onTypeToggle, 
  onNameChange, 
  onDepthDecrease, 
  onDepthIncrease, 
  onMoveUp, 
  onMoveDown, 
  onAddBelow, 
  onRemove 
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: `${node.depth * 20}px`, transition: 'margin 0.2s ease' }}>
      
      {/* 아이콘 및 타입 토글 버튼 - tabIndex={-1} 적용으로 탭 포커스 제외 */}
      <button 
        onClick={() => onTypeToggle(node.id)}
        tabIndex={-1}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: node.isFolder ? '#0969da' : '#57606a' }}
        title="클릭하여 폴더/파일 전환"
      >
        {node.isFolder ? <Folder size={16} fill="#0969da" stroke="#0969da" fillOpacity="0.2" /> : <FileText size={16} />}
      </button>

      {/* 노드 이름 입력 칸 - 유일하게 탭 포커스를 받는 영역 */}
      <input 
        type="text" 
        value={node.name}
        onChange={(e) => onNameChange(node.id, e.target.value)}
        style={{ flex: 1, padding: '6px 10px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
      />

      {/* 제어 버튼 그룹 - 모든 버튼에 tabIndex={-1} 적용 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f6f8fa', borderRadius: '6px', padding: '2px' }}>
        <button tabIndex={-1} onClick={() => onDepthDecrease(idx)} disabled={node.depth === 0} style={{ background: 'none', border: 'none', cursor: node.depth === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: node.depth === 0 ? '#d0d7de' : '#57606a' }}><ChevronLeft size={14} /></button>
        <button tabIndex={-1} onClick={() => onDepthIncrease(idx)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === 0 ? '#d0d7de' : '#57606a' }}><ChevronRight size={14} /></button>
        <div style={{ width: '1px', height: '12px', backgroundColor: '#d0d7de', margin: '0 4px' }} />
        <button tabIndex={-1} onClick={() => onMoveUp(idx)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === 0 ? '#d0d7de' : '#57606a' }}><ArrowUp size={14} /></button>
        <button tabIndex={-1} onClick={() => onMoveDown(idx)} disabled={idx === totalCount - 1} style={{ background: 'none', border: 'none', cursor: idx === totalCount - 1 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === totalCount - 1 ? '#d0d7de' : '#57606a' }}><ArrowDown size={14} /></button>
        <div style={{ width: '1px', height: '12px', backgroundColor: '#d0d7de', margin: '0 4px' }} />
        <button tabIndex={-1} onClick={() => onAddBelow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#0969da' }}><Plus size={14} /></button>
        <button tabIndex={-1} onClick={() => onRemove(node.id)} disabled={totalCount <= 1} style={{ background: 'none', border: 'none', cursor: totalCount <= 1 ? 'not-allowed' : 'pointer', padding: '4px', color: totalCount <= 1 ? '#d0d7de' : '#cf222e' }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default TreeNodeItem;