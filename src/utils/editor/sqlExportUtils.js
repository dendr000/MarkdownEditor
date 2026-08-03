// src/utils/editor/sqlExportUtils.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlExportUtils.js
 * 파일 설명: DDL 쿼리 빌더의 그리드 상태 데이터를 외부 포맷(Java JPA Entity, DBML)으로 
 * 변환하여 출력하는(Export) 유틸리티 함수들의 모음입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 */

// Snake_case를 CamelCase로 변환하는 내부 헬퍼 (변수명 용)
const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
// Snake_case를 PascalCase로 변환하는 내부 헬퍼 (클래스명 용)
const toPascalCase = (str) => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

// SQL 타입을 Java 데이터 타입으로 매핑
const mapSqlToJavaType = (sqlType) => {
  const type = sqlType.toUpperCase();
  if (type.includes('VARCHAR') || type.includes('CHAR') || type.includes('TEXT')) return 'String';
  if (type.includes('BIGINT')) return 'Long';
  if (type.includes('INT') || type.includes('TINYINT')) return 'Integer';
  if (type.includes('DECIMAL') || type.includes('NUMERIC')) return 'BigDecimal';
  if (type.includes('DOUBLE')) return 'Double';
  if (type.includes('FLOAT')) return 'Float';
  if (type.includes('BOOLEAN')) return 'Boolean';
  if (type.includes('DATETIME') || type.includes('TIMESTAMP')) return 'LocalDateTime';
  if (type.includes('DATE')) return 'LocalDate';
  return 'Object';
};

/**
 * 1. Java Spring Boot JPA @Entity 클래스 코드 생성기
 */
export const generateJpaEntity = (tableName, columns) => {
  console.log("[sqlExportUtils v1.0] JPA Entity 변환 시작");
  const className = toPascalCase(tableName);
  
  let code = `import jakarta.persistence.*;\nimport lombok.Getter;\nimport lombok.Setter;\nimport lombok.NoArgsConstructor;\n`;
  code += `import java.time.LocalDateTime;\nimport java.time.LocalDate;\nimport java.math.BigDecimal;\n\n`;
  code += `@Entity\n@Table(name = "${tableName}")\n@Getter\n@Setter\n@NoArgsConstructor\n`;
  code += `public class ${className} {\n`;

  columns.forEach((col) => {
    if (!col.name) return;
    
    code += `\n`;
    if (col.comment) code += `    // ${col.comment}\n`;
    if (col.pk) code += `    @Id\n`;
    if (col.ai) code += `    @GeneratedValue(strategy = GenerationType.IDENTITY)\n`;
    
    const fieldName = toCamelCase(col.name);
    const javaType = mapSqlToJavaType(col.type);
    
    // @Column 속성 조립
    const colAttrs = [`name = "${col.name}"`];
    if (col.nn && !col.pk) colAttrs.push(`nullable = false`);
    if (col.uq) colAttrs.push(`unique = true`);
    if (col.length) colAttrs.push(`length = ${col.length.split(',')[0]}`);
    
    code += `    @Column(${colAttrs.join(', ')})\n`;
    code += `    private ${javaType} ${fieldName};\n`;
  });

  code += `}\n`;
  return code;
};

/**
 * 2. DBML(Database Markup Language) 명세서 코드 생성기
 */
export const generateDbml = (tableName, columns) => {
  console.log("[sqlExportUtils v1.0] DBML 변환 시작");
  let dbml = `Table ${tableName} {\n`;

  columns.forEach((col) => {
    if (!col.name) return;
    
    let typeDesc = col.type.toLowerCase();
    if (col.length) typeDesc += `(${col.length})`;
    
    let line = `  ${col.name} ${typeDesc}`;
    
    const settings = [];
    if (col.pk) settings.push('pk');
    if (col.ai) settings.push('increment');
    if (col.uq) settings.push('unique');
    if (col.nn) settings.push('not null');
    if (col.comment) settings.push(`note: '${col.comment}'`);
    
    if (settings.length > 0) {
      line += ` [${settings.join(', ')}]`;
    }
    
    dbml += line + `\n`;
  });

  dbml += `}\n`;
  return dbml;
};