// src/utils/treeGenerator.js v1.0
/*
 * 파일 설명: 폴더 트리 배열 데이터를 마크다운/텍스트 구조의 연결선 기호(├──, └──, │)로 변환하는 알고리즘 모듈입니다.
 * 연결 위치: src/components/tree/FolderTreeModal.jsx 에서 import 하여 사용
 */

export const generateTreeString = (currentNodes) => {
  console.log("[treeGenerator v1.0] 폴더 트리 문자열 변환 알고리즘 가동");
  let result = '';

  for (let i = 0; i < currentNodes.length; i++) {
    const node = currentNodes[i];
    
    // 최상위 루트 노드는 기호 없이 이름만 출력
    if (node.depth === 0) {
      result += node.name + '\n';
      continue;
    }

    let prefix = '';
    
    // 1. 현재 노드의 깊이 이전까지의 들여쓰기 공백 및 부모 형제 연결선(│) 연산
    for (let j = 1; j < node.depth; j++) {
      let hasSibling = false;
      // 현재 깊이(j)와 동일한 깊이를 가진 형제 노드가 아래에 존재하는지 스캔
      for (let k = i + 1; k < currentNodes.length; k++) {
        if (currentNodes[k].depth === j) {
          hasSibling = true;
          break;
        }
        // 부모 레벨로 돌아가면 탐색 중단
        if (currentNodes[k].depth < j) {
          break;
        }
      }
      prefix += hasSibling ? '│   ' : '    ';
    }

    // 2. 현재 노드가 해당 깊이의 마지막 노드인지(└──) 중간 노드인지(├──) 판별
    let isLast = true;
    for (let k = i + 1; k < currentNodes.length; k++) {
      if (currentNodes[k].depth === node.depth) {
        isLast = false;
        break;
      }
      if (currentNodes[k].depth < node.depth) {
        break;
      }
    }
    
    prefix += isLast ? '└── ' : '├── ';
    result += prefix + node.name + '\n';
  }

  console.log("[treeGenerator v1.0] 문자열 변환 완료");
  return result.trimEnd();
};