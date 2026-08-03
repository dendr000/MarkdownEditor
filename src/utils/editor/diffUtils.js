// src/utils/editor/diffUtils.js v1.0
/*
 * 파일 위치: src/utils/editor/diffUtils.js
 * 파일 설명: 두 문자열을 줄 단위로 비교하여 최장 공통 부분 수열(LCS) 기반의 Diff 결과를 반환하는 유틸리티입니다.
 * 연결 위치: src/components/preview/DiffViewer.jsx
 */

export const computeLineDiff = (oldStr, newStr) => {
  const oldLines = (oldStr || '').split('\n');
  const newLines = (newStr || '').split('\n');

  // DP 매트릭스 초기화
  const dp = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));

  // LCS 길이 계산
  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 역추적(Backtracking)을 통한 Diff 판별
  let i = oldLines.length;
  let j = newLines.length;
  const result = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'unchanged', oldLine: oldLines[i - 1], newLine: newLines[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', oldLine: null, newLine: newLines[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed', oldLine: oldLines[i - 1], newLine: null });
      i--;
    }
  }

  return result;
};