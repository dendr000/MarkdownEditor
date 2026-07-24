// src/components/Header.jsx v2.2
/*
 * 파일 설명: 앱 상단의 헤더 컴포넌트입니다.
 * (v2.2 수정사항): 설정(톱니바퀴) 메뉴가 추가되었으며, 향후 다양한 옵션(스크롤 동기화 등)을 켜고 끌 수 있는 드롭다운 UI가 적용되었습니다.
 */
import { useState } from 'react';
import { PanelLeft, Columns, PanelRight, FolderTree, Settings } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import './Header.css';

function Header({ markdown, viewMode, setViewMode, isExplorerOpen, setIsExplorerOpen, selectedFile, isSyncScroll, setIsSyncScroll }) {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // [신규] 설정 메뉴 토글 상태

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
      
      {/* 우측: 복사 버튼 및 설정 드롭다운 */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* [신규] 설정 메뉴 그룹 */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setIsSettingsOpen(false)}>
          <button 
            className={`view-btn ${isSettingsOpen ? 'active' : ''}`} 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            title="에디터 설정"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Settings size={16} />
          </button>
          
          {isSettingsOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(140,149,159,0.2)',
              padding: '8px 12px',
              zIndex: 1000,
              minWidth: '200px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#24292f', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isSyncScroll} 
                  onChange={(e) => setIsSyncScroll(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                양면 스크롤 동기화
              </label>
              {/* 향후 추가 기능(폰트 크기, 테마 등)을 이 아래에 덧붙일 수 있습니다 */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;