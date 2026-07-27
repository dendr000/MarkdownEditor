// src/components/Header.jsx v4.0
/*
 * 파일 위치: src/components/Header.jsx
 * 연결 위치: src/App.jsx 내부에서 최상단 네비게이션 바로 렌더링됨
 * 기능 요약: 앱 상단의 헤더 컴포넌트로, 뷰 모드 제어, 스크롤 설정, 복사 기능 및 브레드크럼(경로) 네비게이션을 제공합니다.
 * (v4.0 수정사항): 설정 팝업의 텍스트 줄바꿈 현상을 방지하기 위해 minWidth 확장 및 whiteSpace: nowrap 속성을 적용했습니다.
 */
import React, { useState } from 'react';
import { PanelLeft, Columns, PanelRight, Settings, Server, Database } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import './Header.css';

function Header({ markdown, viewMode, setViewMode, isExplorerOpen, setIsExplorerOpen, selectedFile, isSyncScroll, setIsSyncScroll, isExplorerAutoClose, setIsExplorerAutoClose, onBreadcrumbClick, storageMode, onStorageModeChange }) {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCopy = async () => {
    console.log("[Header v4.0] 전체 복사 호출");
    if (await copyToClipboard(markdown)) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <header className="header">
      <div className="header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" style={{ marginLeft: '0' }}>
          <rect x="15" y="15" width="70" height="70" rx="12" fill="#ffffff" stroke="#d0d7de" strokeWidth="6" />
          <rect x="15" y="15" width="25" height="70" rx="12" fill="#24292f" />
          <circle cx="27" cy="30" r="4" fill="#ffffff" />
          <circle cx="27" cy="50" r="4" fill="#ffffff" />
          <circle cx="27" cy="70" r="4" fill="#ffffff" />
          <path d="M 50 35 L 60 45 L 75 30" stroke="#0969da" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="50" y1="60" x2="75" y2="60" stroke="#8c959f" strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="70" x2="65" y2="70" stroke="#8c959f" strokeWidth="6" strokeLinecap="round" />
        </svg>
        {selectedFile && (
          <div className="header-file-path" style={{ display: 'flex', alignItems: 'center' }}>
            {selectedFile.split('/').map((part, idx, arr) => {
              const path = arr.slice(0, idx + 1).join('/'); const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={path}>
                  <span onClick={() => { console.log(`[Header v4.0] 이동: ${path}`); if (onBreadcrumbClick) onBreadcrumbClick(path); }} style={{ cursor: 'pointer', color: isLast ? '#ffffff' : '#8c959f', fontWeight: isLast ? '600' : 'normal', transition: 'color 0.2s' }} onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#58a6ff'; }} onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = isLast ? '#ffffff' : '#8c959f'; }} title={`'${path}' 위치로 이동`}>{part}</span>
                  {!isLast && <span style={{ margin: '0 4px', color: '#8c959f', userSelect: 'none' }}>/</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      <div className="header-center">
        <div className="view-mode-group">
          <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => { console.log("[Header v4.0] 뷰: preview"); setViewMode('preview'); }} title="실시간 뷰어 단독 보기"><PanelLeft size={16} /></button>
          <button className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => { console.log("[Header v4.0] 뷰: split"); setViewMode('split'); }} title="양면 분할 보기"><Columns size={16} /></button>
          <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => { console.log("[Header v4.0] 뷰: editor"); setViewMode('editor'); }} title="에디터 단독 보기"><PanelRight size={16} /></button>
        </div>
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onStorageModeChange && (
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#161b22', borderRadius: '6px', padding: '3px', border: '1px solid #30363d', marginRight: '4px' }}>
            <button onClick={() => onStorageModeChange('SERVER')} style={{ padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: storageMode === 'SERVER' ? '#2da44e' : 'transparent', color: storageMode === 'SERVER' ? '#ffffff' : '#8c959f', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} title="로컬 PC 연동 모드"><Server size={15} /></button>
            <button onClick={() => onStorageModeChange('BROWSER')} style={{ padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: storageMode === 'BROWSER' ? '#0969da' : 'transparent', color: storageMode === 'BROWSER' ? '#ffffff' : '#8c959f', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} title="브라우저 DB 모드"><Database size={15} /></button>
          </div>
        )}
        <button className="copy-btn" onClick={handleCopy} title="전체 마크다운 복사">
          {copied ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
        </button>
        <div style={{ position: 'relative' }} onMouseLeave={() => { if (isSettingsOpen) { console.log("[Header v4.0] 마우스 아웃: 설정 닫힘"); setIsSettingsOpen(false); } }}>
          <button className={`view-btn ${isSettingsOpen ? 'active' : ''}`} onClick={() => { console.log(`[Header v4.0] 설정 토글`); setIsSettingsOpen(!isSettingsOpen); }} title="에디터 환경 설정" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={16} /></button>
          {isSettingsOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '4px', zIndex: 1000, minWidth: '220px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', boxShadow: '0 8px 24px rgba(140,149,159,0.2)', padding: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#24292f', cursor: 'pointer', marginBottom: '12px', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={isSyncScroll} onChange={(e) => { console.log(`[Header v4.0] 스크롤 동기화 변경: ${e.target.checked}`); setIsSyncScroll(e.target.checked); }} style={{ cursor: 'pointer' }} />
                  양면 스크롤 동기화
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#24292f', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={isExplorerAutoClose} onChange={(e) => { console.log(`[Header v4.0] 외부 클릭 탐색기 자동 닫기 변경: ${e.target.checked}`); setIsExplorerAutoClose(e.target.checked); }} style={{ cursor: 'pointer' }} />
                  외부 클릭 시 탐색기 자동 닫기
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default Header;