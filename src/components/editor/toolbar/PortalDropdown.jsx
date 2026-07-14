// src/components/editor/toolbar/PortalDropdown.jsx v1.0
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function PortalDropdown({ triggerRef, isOpen, onClose, children }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    // 툴바 버튼의 화면상 절대 좌표를 계산하여 드롭다운 위치 결정
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({ position: 'fixed', top: rect.bottom + 8, left: rect.left, zIndex: 9999 });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  // document.body에 직접 부착하여 overflow: auto에 의한 묻힘(잘림) 원천 방지
  return createPortal(
    <div className="dropdown-menu-portal" style={style}>
      {children}
    </div>,
    document.body
  );
}