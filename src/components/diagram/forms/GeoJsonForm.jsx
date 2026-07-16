// src/components/diagram/forms/GeoJsonForm.jsx v1.0
/*
 * 파일 설명: 대화형 지도(GeoJSON) 전용 GUI 입력 폼 컴포넌트입니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

function GeoJsonForm({ geoFeatures, handleAddGeoFeature, handleRemoveGeoFeature, handleUpdateGeoFeature }) {
  console.log("GeoJsonForm 컴포넌트 렌더링");
  return (
    <div className="gui-form-group">
      <div className="fields-header-row">
        <span className="sub-title-label">지도 마커 포인트</span>
        <button className="add-row-action-btn" onClick={handleAddGeoFeature}>
          <Plus size={12} /> 추가
        </button>
      </div>

      <div className="gui-items-list">
        {geoFeatures.map((f) => (
          <div key={f.id} className="gui-geo-card">
            <div className="geo-card-row">
              <input 
                type="text" 
                className="gui-input-text inline-input" 
                value={f.name} 
                placeholder="장소 명칭"
                onChange={(e) => handleUpdateGeoFeature(f.id, 'name', e.target.value)} 
              />
              <button 
                className="gui-delete-row-btn"
                onClick={() => handleRemoveGeoFeature(f.id)}
                disabled={geoFeatures.length <= 1}
                title="마커 삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="geo-card-row coord-row">
              <input 
                type="number" 
                step="0.0001"
                className="gui-input-text inline-input number-input" 
                value={f.lat} 
                placeholder="위도(Lat)"
                onChange={(e) => handleUpdateGeoFeature(f.id, 'lat', e.target.value)} 
              />
              <input 
                type="number" 
                step="0.0001"
                className="gui-input-text inline-input number-input" 
                value={f.lng} 
                placeholder="경도(Lng)"
                onChange={(e) => handleUpdateGeoFeature(f.id, 'lng', e.target.value)} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GeoJsonForm;