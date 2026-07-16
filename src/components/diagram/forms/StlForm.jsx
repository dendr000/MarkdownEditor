// src/components/diagram/forms/StlForm.jsx v1.0
/*
 * 파일 설명: 3D 모델(STL) 상자(Box) 크기 변수 조절용 GUI 입력 폼 컴포넌트입니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';

function StlForm({ boxWidth, setBoxWidth, boxHeight, setBoxHeight, boxDepth, setBoxDepth }) {
  console.log("StlForm 컴포넌트 렌더링");
  return (
    <div className="gui-form-group">
      <span className="sub-title-label">상자(Box) 크기 매개변수 설정</span>
      <div className="gui-stl-controls-wrapper" style={{ marginTop: '12px' }}>
        <div className="stl-range-row">
          <label className="range-label">가로 (Width): {boxWidth.toFixed(1)}</label>
          <input 
            type="range" 
            min="0.2" 
            max="4.0" 
            step="0.1" 
            value={boxWidth} 
            onChange={(e) => { console.log("STL 가로 폭 조절:", e.target.value); setBoxWidth(parseFloat(e.target.value)); }} 
          />
        </div>
        <div className="stl-range-row" style={{ marginTop: '12px' }}>
          <label className="range-label">세로 (Height): {boxHeight.toFixed(1)}</label>
          <input 
            type="range" 
            min="0.2" 
            max="4.0" 
            step="0.1" 
            value={boxHeight} 
            onChange={(e) => { console.log("STL 세로 높이 조절:", e.target.value); setBoxHeight(parseFloat(e.target.value)); }} 
          />
        </div>
        <div className="stl-range-row" style={{ marginTop: '12px' }}>
          <label className="range-label">깊이 (Depth): {boxDepth.toFixed(1)}</label>
          <input 
            type="range" 
            min="0.2" 
            max="4.0" 
            step="0.1" 
            value={boxDepth} 
            onChange={(e) => { console.log("STL 깊이 조절:", e.target.value); setBoxDepth(parseFloat(e.target.value)); }} 
          />
        </div>
      </div>
    </div>
  );
}

export default StlForm;