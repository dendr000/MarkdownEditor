// src/components/Header.jsx v2.1
/*
 * 파일 설명: 앱 상단의 헤더 컴포넌트입니다.
 * (v2.1 수정사항): 선택된 파일의 경로 및 이름을 옅은 색상으로 표시하는 UI가 추가되었습니다.
 */
import { useState } from 'react';
import { PanelLeft, Columns, PanelRight, FolderTree } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import './Header.css';

function Header({ markdown, viewMode, setViewMode, isExplorerOpen, setIsExplorerOpen, selectedFile }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="header">
      {/* 좌측: 탐색기 토글, 깃허브 로고 및 파일 경로 */}
      <div className="header-left">
        <button 
          className={`header-icon-btn ${isExplorerOpen ? 'active' : ''}`}
          onClick={() => setIsExplorerOpen(!isExplorerOpen)}
          title="파일 탐색기 열기/닫기"
        >
          <FolderTree size={18} />
        </button>
        <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor" style={{ marginLeft: '8px' }}>
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        
        {/* 현재 열려있는 파일의 경로 표시 영역 */}
        {selectedFile && (
          <span className="header-file-path" title={selectedFile}>
            {selectedFile}
          </span>
        )}
      </div>
      
      {/* 중앙: 뷰 모드 컨트롤 */}
      <div className="header-center">
        <div className="view-mode-group">
          <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => setViewMode('preview')} title="실시간 뷰어 단독 보기">
            <PanelLeft size={16} />
          </button>
          <button className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')} title="양면 분할 보기">
            <Columns size={16} />
          </button>
          <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')} title="에디터 단독 보기">
            <PanelRight size={16} />
          </button>
        </div>
      </div>
      
      {/* 우측: 복사 버튼 */}
      <div className="header-right">
        <button className="copy-btn" onClick={handleCopy} title="전체 복사">
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e6ffed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;