// src/components/explorer/FileExplorer.jsx v1.1
/*
 * 파일 설명: 로컬 백엔드 서버와 통신하여 파일/폴더 트리를 렌더링하는 좌측 탐색기 컴포넌트입니다.
 * (v1.1 수정사항): 레이아웃 고정 형태에서 position: absolute 기반의 서랍(Drawer) 애니메이션 형태로 변경했습니다.
 */
import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileText, FilePlus, FolderPlus, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';
import { fetchTreeData, createFileOrFolder, deleteFileOrFolder, renameTarget } from '../../api/fileApi';

const TreeNode = ({ node, onSelect, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (isFolder) => {
    const name = window.prompt(`새 ${isFolder ? '폴더' : '파일'} 이름을 입력하세요.\n(파일은 .md 또는 .txt 확장자 권장)`);
    if (!name) return;
    const ext = !isFolder && !name.includes('.') ? '.md' : '';
    const newPath = node.path ? `${node.path}/${name}${ext}` : `${name}${ext}`;
    await createFileOrFolder(newPath, isFolder);
    setIsOpen(true);
    onRefresh();
  };

  const handleDelete = async () => {
    if (window.confirm(`'${node.name}'을(를) 정말 삭제하시겠습니까?`)) {
      await deleteFileOrFolder(node.path);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = window.prompt('새 이름을 입력하세요:', node.name);
    if (!newName || newName === node.name) return;
    const basePath = node.path.substring(0, node.path.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;
    await renameTarget(node.path, newPath);
    onRefresh();
  };

  return (
    <div style={{ marginLeft: node.path ? '12px' : '0' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.1s' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e1e4e8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
          onClick={() => node.isFolder ? setIsOpen(!isOpen) : onSelect(node.path)}
        >
          {node.isFolder ? (
            <div style={{ display: 'flex', alignItems: 'center', color: '#57606a' }}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isOpen ? <FolderOpen size={14} color="#0969da" style={{ marginLeft: '4px' }} /> : <Folder size={14} color="#0969da" style={{ marginLeft: '4px' }} />}
            </div>
          ) : (
            <FileText size={14} color="#57606a" style={{ marginLeft: '18px' }} />
          )}
          <span style={{ fontSize: '13px', color: '#24292f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>

        {node.path && (
          <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
            {node.isFolder && (
              <>
                <FilePlus size={14} color="#2da44e" onClick={(e) => { e.stopPropagation(); handleAdd(false); }} title="파일 추가" />
                <FolderPlus size={14} color="#0969da" onClick={(e) => { e.stopPropagation(); handleAdd(true); }} title="폴더 추가" />
              </>
            )}
            <Edit2 size={14} color="#57606a" onClick={(e) => { e.stopPropagation(); handleRename(); }} title="이름 변경" />
            <Trash2 size={14} color="#cf222e" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="삭제" />
          </div>
        )}
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} onSelect={onSelect} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
};

function FileExplorer({ isExplorerOpen, onSelectFile }) {
  const [treeData, setTreeData] = useState({ name: 'root', isFolder: true, children: [], path: '' });

  const loadTree = async () => {
    try {
      const data = await fetchTreeData();
      setTreeData(data);
    } catch (error) {
      console.error('트리 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  return (
    <div 
      style={{ 
        position: 'absolute',
        left: isExplorerOpen ? '0px' : '-260px',
        top: '0', 
        bottom: '0', 
        width: '260px', 
        borderRight: '1px solid #d0d7de', 
        backgroundColor: '#f6f8fa', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isExplorerOpen ? '4px 0 16px rgba(0,0,0,0.1)' : 'none',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: 9999
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#24292f' }}>탐색기 (DB)</span>
        <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
          <FilePlus size={16} color="#2da44e" onClick={() => {
            const name = window.prompt("루트에 생성할 새 파일명 (.md 권장)");
            if (name) { createFileOrFolder(name, false).then(loadTree); }
          }} title="루트 파일 추가" />
          <FolderPlus size={16} color="#0969da" onClick={() => {
            const name = window.prompt("루트에 생성할 새 폴더명");
            if (name) { createFileOrFolder(name, true).then(loadTree); }
          }} title="루트 폴더 추가" />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {treeData.children && treeData.children.map(child => (
          <TreeNode key={child.path} node={child} onSelect={onSelectFile} onRefresh={loadTree} />
        ))}
        {(!treeData.children || treeData.children.length === 0) && (
          <div style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', marginTop: '20px' }}>파일이 없습니다. 추가해주세요.</div>
        )}
      </div>
    </div>
  );
}

export default FileExplorer;