// src/components/explorer/NodeActions.jsx v1.3
/*
 * 파일 위치: src/components/explorer/NodeActions.jsx
 * 연결 위치: src/components/explorer/ExplorerTreeNode.jsx 내부 우측에 렌더링
 * 기능 요약: 탐색기 개별 노드의 파일/폴더 추가, 이름 변경, 삭제 기능을 수행하는 아이콘 버튼 그룹을 렌더링합니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 */
import React, { useState } from 'react';
import { FilePlus, FolderPlus, Trash2, Edit2, Copy, Check } from 'lucide-react';

function NodeActions({ isFolder, onAdd, onRename, onDelete, relativePath }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = relativePath;
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
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
      {relativePath && (
        <div 
          onClick={handleCopy} 
          title="경로 복사"
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