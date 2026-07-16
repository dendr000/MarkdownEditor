// src/components/editor/toolbar/ToolbarGroups.jsx v1.0
import { useRef, useState, useEffect } from 'react';
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, 
  CheckSquare, Code, Table, FileCode2, Quote, List, ListOrdered, 
  Link, Image as ImageIcon, MessageSquareWarning, FileDiff, Baseline, ListCollapse,
  Terminal, Minus, Keyboard
} from 'lucide-react';
import PortalDropdown from './PortalDropdown';

export const HeadingGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => handleFormat('# ')} title="제목 1 (H1)"><Heading1 size={18} /></button>
    <button onClick={() => handleFormat('## ')} title="제목 2 (H2)"><Heading2 size={18} /></button>
    <button onClick={() => handleFormat('### ')} title="제목 3 (H3)"><Heading3 size={18} /></button>
  </div>
);

export const FormatGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => { console.log("굵게 버튼 클릭"); handleFormat('**', '**'); }} title="굵게"><Bold size={18} /></button>
    <button onClick={() => { console.log("기울임 버튼 클릭"); handleFormat('*', '*'); }} title="기울임"><Italic size={18} /></button>
    <button onClick={() => { console.log("취소선 버튼 클릭"); handleFormat('~~', '~~'); }} title="취소선"><Strikethrough size={18} /></button>
    <button onClick={() => { console.log("인라인 코드 버튼 클릭"); handleFormat('`', '`'); }} title="인라인 코드"><Terminal size={18} /></button>
  </div>
);

export const ListGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => { console.log("인용구 버튼 클릭"); handleFormat('> '); }} title="인용구"><Quote size={18} /></button>
    <button onClick={() => { console.log("글머리 목록 버튼 클릭"); handleFormat('- '); }} title="글머리 목록"><List size={18} /></button>
    <button onClick={() => { console.log("번호 매기기 버튼 클릭"); handleFormat('1. '); }} title="번호 매기기"><ListOrdered size={18} /></button>
    <button onClick={() => { console.log("할 일 목록 버튼 클릭"); handleFormat('- [ ] '); }} title="할 일 목록"><CheckSquare size={18} /></button>
    <button onClick={() => { console.log("구분선 버튼 클릭"); handleFormat('\n---\n\n', '', false); }} title="구분선"><Minus size={18} /></button>
  </div>
);

export const MediaGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => handleFormat('[', '](url)')} title="링크"><Link size={18} /></button>
    <button onClick={() => handleFormat('![alt](', ')')} title="이미지"><ImageIcon size={18} /></button>
    <button onClick={() => handleFormat('\n```\n', '\n```\n')} title="코드 블록"><Code size={18} /></button>
    <button onClick={() => handleFormat('[^1]', '')} title="각주"><Baseline size={18} /></button>
  </div>
);

export const GithubGroup = ({ handleFormat, openDropdown, setOpenDropdown }) => {
  const alertRef = useRef(null);
  const diffRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기 로직 수정 (포털 내부 클릭 예외 처리)
  useEffect(() => {
    const handleClick = (e) => {
      console.log("드롭다운 외부 클릭 감지 이벤트 발생");
      // 포털 드롭다운 메뉴 내부를 클릭한 경우 드롭다운이 닫히지 않도록 예외 처리
      if (e.target.closest('.dropdown-menu-portal')) {
        console.log("클릭 요소가 드롭다운 내부이므로 닫기 동작을 무시합니다.");
        return;
      }
      
      if (alertRef.current && !alertRef.current.contains(e.target) && openDropdown === 'alert') setOpenDropdown(null);
      if (diffRef.current && !diffRef.current.contains(e.target) && openDropdown === 'diff') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown, setOpenDropdown]);

  const insertAlert = (type) => {
    console.log(`Alert 삽입 호출 - 타입: ${type}`);
    handleFormat(`> [!${type}]\n> `, '\n', true);
    setOpenDropdown(null);
  };

  const insertDetails = () => {
    console.log("Details(접기) 삽입 호출");
    handleFormat("\n<details>\n<summary>클릭하여 펼치기</summary>\n\n여기에 숨겨진 내용을 작성합니다.\n\n</details>\n", '', false);
    setOpenDropdown(null);
  };

  return (
    <div className="toolbar-group">
      <button ref={alertRef} onClick={() => setOpenDropdown(openDropdown === 'alert' ? null : 'alert')} className={openDropdown === 'alert' ? 'active-btn' : ''} title="GitHub Alerts 삽입">
        <MessageSquareWarning size={18} />
      </button>
      <PortalDropdown triggerRef={alertRef} isOpen={openDropdown === 'alert'} onClose={() => setOpenDropdown(null)}>
        <button className="dropdown-item alert-note" onClick={() => insertAlert('NOTE')}>블루 (NOTE)</button>
        <button className="dropdown-item alert-tip" onClick={() => insertAlert('TIP')}>그린 (TIP)</button>
        <button className="dropdown-item alert-important" onClick={() => insertAlert('IMPORTANT')}>퍼플 (IMPORTANT)</button>
        <button className="dropdown-item alert-warning" onClick={() => insertAlert('WARNING')}>오렌지 (WARNING)</button>
        <button className="dropdown-item alert-caution" onClick={() => insertAlert('CAUTION')}>레드 (CAUTION)</button>
      </PortalDropdown>

      <button ref={diffRef} onClick={() => setOpenDropdown(openDropdown === 'diff' ? null : 'diff')} className={openDropdown === 'diff' ? 'active-btn' : ''} title="GitHub 확장 문법 삽입">
        <FileDiff size={18} />
      </button>
      <PortalDropdown triggerRef={diffRef} isOpen={openDropdown === 'diff'} onClose={() => setOpenDropdown(null)}>
        <button className="dropdown-item diff-template" onClick={() => {
          console.log("Diff 스니펫 삽입 호출");
          handleFormat("\n```diff\n+ 추가된 줄 (초록색)\n- 삭제된 줄 (빨간색)\n! 변경된 줄 (강조)\n@@ -1,3 +1,4 @@\n```\n", '', false);
          setOpenDropdown(null);
        }}>Diff 코드 블록 삽입</button>
        <button className="dropdown-item details-template" onClick={insertDetails}>
          <ListCollapse size={14} style={{ marginRight: '6px', display: 'inline' }}/> 접기/펼치기 (Details)
        </button>
        <button className="dropdown-item details-template" onClick={() => {
          console.log("키보드 태그 삽입 호출");
          handleFormat('<kbd>', '</kbd>', false);
          setOpenDropdown(null);
        }}>
          <Keyboard size={14} style={{ marginRight: '6px', display: 'inline' }}/> 키보드 키 (kbd)
        </button>
      </PortalDropdown>
    </div>
  );
};