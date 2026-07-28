// src/components/explorer/NodeActions.jsx v1.0
/*
 * 파일 위치: src/components/explorer/NodeActions.jsx
 * 연결 위치: src/components/explorer/ExplorerTreeNode.jsx 내부 우측에 렌더링
 * 기능 요약: 탐색기 개별 노드의 파일/폴더 추가, 이름 변경, 삭제 기능을 수행하는 아이콘 버튼 그룹을 렌더링합니다.
 */
import React, { useState } from 'react';
import { FilePlus, FolderPlus, Trash2, Edit2, Copy, Check } from 'lucide-react';

function NodeActions({ isFolder, onAdd, onRename, onDelete, relativePath, absolutePath }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    // SHIFT 클릭 시 절대 경로 복사, 일반 클릭 시 상대 경로 복사 (상대 경로가 없으면 절대 경로 폴백)
    const textToCopy = e.shiftKey ? absolutePath : (relativePath || absolutePath);
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log(`[NodeActions v1.1] 경로 복사 완료: ${textToCopy}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
      {isFolder && (
        <>
          <FilePlus 
            size={14} 
            color="#2da44e" 
            onClick={(e) => { e.stopPropagation(); onAdd(false); }} 
            title="파일 추가" 
          />
          <FolderPlus 
            size={14} 
            color="#0969da" 
            onClick={(e) => { e.stopPropagation(); onAdd(true); }} 
            title="폴더 추가" 
          />
        </>
      )}
      <Edit2 
        size={14} 
        color="var(--text-muted, #57606a)" 
        onClick={(e) => { e.stopPropagation(); onRename(); }} 
        title="이름 변경" 
      />
      {(relativePath || absolutePath) && (
        <div 
          onClick={handleCopy} 
          title="클릭: 상대 경로 복사 / SHIFT+클릭: 절대 경로 복사"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {isCopied ? (
            <Check size={14} color="#2da44e" />
          ) : (
            <Copy size={14} color="var(--text-muted, #57606a)" />
          )}
        </div>
      )}
      <Trash2 
        size={14} 
        color="#cf222e" 
        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
        title="삭제" 
      />
    </div>
  );
}

export default NodeActions;