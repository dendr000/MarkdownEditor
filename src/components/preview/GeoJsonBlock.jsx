// src/components/preview/GeoJsonBlock.jsx v1.0
/*
 * 파일 설명: GeoJSON 및 TopoJSON 데이터를 파싱하여 Leaflet 기반의 대화형 지도로 렌더링하는 컴포넌트입니다.
 * 연결 위치: src/components/Preview.jsx 내부 CodeBlock 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import * as topojson from 'topojson-client';
import 'leaflet/dist/leaflet.css';

const GeoJsonBlock = ({ dataString, isTopoJson }) => {
  console.log(`[GeoJsonBlock v1.0] ${isTopoJson ? 'TopoJSON' : 'GeoJSON'} 데이터 렌더링 시작`);
  const [geoData, setGeoData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      console.log("[GeoJsonBlock v1.0] 맵 데이터 파싱 시도");
      let parsed = JSON.parse(dataString);
      
      if (isTopoJson) {
        console.log("[GeoJsonBlock v1.0] TopoJSON 규격 감지. Leaflet 렌더링을 위해 GeoJSON 포맷으로 변환을 시도합니다.");
        const objectKeys = Object.keys(parsed.objects);
        if (objectKeys.length > 0) {
          parsed = topojson.feature(parsed, parsed.objects[objectKeys[0]]);
        }
      }
      
      console.log("[GeoJsonBlock v1.0] 맵 데이터 파싱 및 가공 성공");
      setGeoData(parsed);
      setError(false);
    } catch (e) {
      console.error("[GeoJsonBlock v1.0] 데이터 구문 분석 에러 발생:", e);
      setError(true);
    }
  }, [dataString, isTopoJson]);

  if (error) {
    return <div style={{ color: '#cf222e', padding: '12px', backgroundColor: '#ffebe9', border: '1px solid rgba(207,34,46,0.2)', borderRadius: '6px', fontSize: '13px' }}>맵 데이터 구문 분석 오류가 발생했습니다. 포맷을 확인해 주세요.</div>;
  }

  if (!geoData) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#57606a' }}>맵 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ height: '400px', width: '100%', margin: '16px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d0d7de' }}>
      <MapContainer center={[35, -90]} zoom={3} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON data={geoData} />
      </MapContainer>
    </div>
  );
};

export default GeoJsonBlock;