// src/components/diagram/forms/PieChartForm.jsx v1.0
/*
 * 파일 설명: 원형 차트(Pie Chart) 전용 GUI 입력 폼 컴포넌트입니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

function PieChartForm({ pieTitle, setPieTitle, pieItems, handleAddPieItem, handleRemovePieItem, handleUpdatePieItem }) {
  console.log("PieChartForm 컴포넌트 렌더링");
  return (
    <div className="gui-form-group">
      <label className="gui-label">차트 제목</label>
      <input 
        type="text" 
        className="gui-input-text" 
        value={pieTitle} 
        onChange={(e) => { console.log("원형 차트 제목 변경:", e.target.value); setPieTitle(e.target.value); }} 
      />
      
      <div className="fields-header-row" style={{ marginTop: '16px' }}>
        <span className="sub-title-label">데이터 레이블 및 수치</span>
        <button className="add-row-action-btn" onClick={handleAddPieItem}>
          <Plus size={12} /> 추가
        </button>
      </div>

      <div className="gui-items-list">
        {pieItems.map((item) => (
          <div key={item.id} className="gui-item-row">
            <input 
              type="text" 
              className="gui-input-text inline-input" 
              value={item.label} 
              placeholder="라벨"
              onChange={(e) => handleUpdatePieItem(item.id, 'label', e.target.value)} 
            />
            <span className="input-separator">:</span>
            <input 
              type="number" 
              className="gui-input-text inline-input number-input" 
              value={item.value} 
              placeholder="수치"
              onChange={(e) => handleUpdatePieItem(item.id, 'value', e.target.value)} 
            />
            <button 
              className="gui-delete-row-btn"
              onClick={() => handleRemovePieItem(item.id)}
              disabled={pieItems.length <= 1}
              title="항목 삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieChartForm;