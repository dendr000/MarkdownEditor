// src/utils/editor/sqlDclGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlDclGenerator.js
 * 파일 설명: DCL 권한 매트릭스의 사용자, 권한 종류, 체크 상태(Matrix) 데이터를 취합하여
 * 실행 가능한 GRANT / REVOKE 스크립트 문자열로 컴파일하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DclMatrixPanel.jsx
 */

export const generateDclQuery = (users, permissions, matrix, targetObject) => {
  console.log("[sqlDclGenerator v1.0] DCL 쿼리 컴파일 시작", { userCount: users.length, targetObject });

  if (!users || users.length === 0) {
    console.log("[sqlDclGenerator v1.0] 등록된 사용자가 없어 기본 안내 구문을 반환합니다.");
    return "-- 권한을 부여할 사용자 계정을 추가하세요.";
  }

  let sql = `-- 데이터베이스 권한 제어(DCL) 스크립트\n-- 대상 객체: ${targetObject}\n\n`;

  users.forEach((user) => {
    const grantedPermissions = [];
    
    // 각 사용자에 대해 매트릭스를 순회하며 체크된(true) 권한만 수집합니다.
    permissions.forEach((perm) => {
      if (matrix[user] && matrix[user][perm]) {
        grantedPermissions.push(perm);
      }
    });

    if (grantedPermissions.length > 0) {
      // 모든 권한이 선택된 경우 ALL PRIVILEGES로 축약 표현
      if (grantedPermissions.length === permissions.length) {
        sql += `GRANT ALL PRIVILEGES ON ${targetObject} TO ${user};\n`;
        console.log(`[sqlDclGenerator v1.0] ${user} 계정에 ALL PRIVILEGES 부여 생성`);
      } else {
        sql += `GRANT ${grantedPermissions.join(', ')} ON ${targetObject} TO ${user};\n`;
        console.log(`[sqlDclGenerator v1.0] ${user} 계정에 특정 권한(${grantedPermissions.join(', ')}) 부여 생성`);
      }
    } else {
      // 부여된 권한이 하나도 없을 경우 REVOKE 명시 또는 주석 처리
      sql += `-- ${user} 계정에 부여된 권한이 없습니다. (또는 REVOKE ALL)\n`;
      sql += `REVOKE ALL PRIVILEGES ON ${targetObject} FROM ${user};\n`;
      console.log(`[sqlDclGenerator v1.0] ${user} 계정 권한 없음 (REVOKE ALL 적용)`);
    }
    sql += `\n`;
  });

  sql += `FLUSH PRIVILEGES;`;
  console.log("[sqlDclGenerator v1.0] DCL 쿼리 컴파일 완료");
  return sql.trim();
};