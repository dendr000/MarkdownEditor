// src/components/editor/toolbar/ToolbarGroups.jsx v1.1
/*
 * 파일 설명: 툴바의 버튼 그룹들을 정의한 컴포넌트 묶음입니다.
 * (v1.1) FormatGroup에 수식(LaTeX)을 삽입할 수 있는 버튼(Sigma)이 추가되었습니다.
 */
import { useRef, useEffect } from 'react';
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, 
  CheckSquare, Code, Table, FileCode2, Quote, List, ListOrdered, 
  Link, Image as ImageIcon, MessageSquareWarning, FileDiff, Baseline, ListCollapse,
  Terminal, Minus, Keyboard, Underline, Superscript, Subscript, MessageSquareDashed, Bookmark, Slash,
  Sigma // 수식 버튼용 아이콘 추가
} from 'lucide-react';
import PortalDropdown from './PortalDropdown';

export const HeadingGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => handleFormat('# ')} title="제목 1 (H1)"><Heading1 size={18} /></button>
    <button onClick={() => handleFormat('## ')} title="제목 2 (H2)"><Heading2 size={18} /></button>
    <button onClick={() => handleFormat('### ')} title="제목 3 (H3)"><Heading3 size={18} /></button>
  </div>
);

export const FormatGroup = ({ handleFormat, onOpenMathModal }) => (
  <div className="toolbar-group">
    <button onClick={() => handleFormat('**', '**')} title="굵게"><Bold size={18} /></button>
    <button onClick={() => handleFormat('*', '*')} title="기울임"><Italic size={18} /></button>
    <button onClick={() => handleFormat('~~', '~~')} title="취소선"><Strikethrough size={18} /></button>
    <button onClick={() => handleFormat('<ins>', '</ins>', false)} title="밑줄"><Underline size={18} /></button>
    <button onClick={() => handleFormat('<sup>', '</sup>', false)} title="위첨자"><Superscript size={18} /></button>
    <button onClick={() => handleFormat('<sub>', '</sub>', false)} title="아래첨자"><Subscript size={18} /></button>
    <button onClick={() => handleFormat('`', '`')} title="인라인 코드"><Terminal size={18} /></button>
    <button onClick={() => { console.log("수식 모달 호출"); onOpenMathModal(); }} title="수식 (LaTeX) 작성기"><Sigma size={18} /></button>
  </div>
);

export const ListGroup = ({ handleFormat }) => (
  <div className="toolbar-group">
    <button onClick={() => handleFormat('> ')} title="인용구"><Quote size={18} /></button>
    <button onClick={() => handleFormat('- ')} title="글머리 목록"><List size={18} /></button>
    <button onClick={() => handleFormat('1. ')} title="번호 매기기"><ListOrdered size={18} /></button>
    <button onClick={() => handleFormat('- [ ] ')} title="할 일 목록"><CheckSquare size={18} /></button>
    <button onClick={() => handleFormat('\n---\n\n', '', false)} title="구분선"><Minus size={18} /></button>
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

export const GithubGroup = ({ handleFormat, openDropdown, setOpenDropdown, onOpenDetailsModal }) => {
  const alertRef = useRef(null);
  const diffRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      console.log("드롭다운 외부 클릭 감지 이벤트 발생");
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
    console.log("Details(접기) 모달 호출");
    onOpenDetailsModal();
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
        <button className="dropdown-item details-template" onClick={() => {
          console.log("주석 삽입 호출");
          handleFormat('<!-- ', ' -->', false);
          setOpenDropdown(null);
        }}>
          <MessageSquareDashed size={14} style={{ marginRight: '6px', display: 'inline' }}/> HTML 주석 (숨김)
        </button>
        <button className="dropdown-item details-template" onClick={() => {
          console.log("앵커 삽입 호출");
          handleFormat('<a name="', '"></a>', false);
          setOpenDropdown(null);
        }}>
          <Bookmark size={14} style={{ marginRight: '6px', display: 'inline' }}/> 사용자 지정 앵커
        </button>
        <button className="dropdown-item details-template" onClick={() => {
          console.log("이스케이프 삽입 호출");
          handleFormat('\\', '', false);
          setOpenDropdown(null);
        }}>
          <Slash size={14} style={{ marginRight: '6px', display: 'inline' }}/> 서식 무시 (Escape)
        </button>
      </PortalDropdown>
    </div>
  );
};