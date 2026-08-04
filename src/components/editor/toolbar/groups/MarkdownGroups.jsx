/*
 * 파일 위치: src/components/editor/toolbar/groups/MarkdownGroups.jsx
 * 기능 요약: 마크다운 에디터의 기본 서식(제목, 텍스트 포맷, 목록, 미디어 삽입)을 담당하는 툴바 버튼 그룹들을 모아둔 컴포넌트입니다.
 */
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, 
  CheckSquare, Code, Quote, List, ListOrdered, 
  Link, Image as ImageIcon, Baseline, Minus, Terminal, 
  Underline, Superscript, Subscript, Sigma 
} from 'lucide-react';

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