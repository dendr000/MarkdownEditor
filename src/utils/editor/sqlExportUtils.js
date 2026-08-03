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

/**
 * 3. Java Spring Boot JpaRepository 인터페이스 생성기
 */
export const generateJpaRepository = (tableName, columns) => {
  console.log("[sqlExportUtils v1.1] JpaRepository 변환 시작");
  const className = toPascalCase(tableName);
  
  // PK(기본키)의 데이터 타입을 탐색하여 제네릭 타입으로 지정 (없을 경우 Long 기본값)
  const pkColumn = columns.find(col => col.pk);
  const pkType = pkColumn ? mapSqlToJavaType(pkColumn.type) : 'Long';

  let code = `import org.springframework.data.jpa.repository.JpaRepository;\n`;
  code += `import org.springframework.stereotype.Repository;\n\n`;
  code += `@Repository\n`;
  code += `public interface ${className}Repository extends JpaRepository<${className}, ${pkType}> {\n`;
  code += `    // 추가적인 쿼리 메서드가 필요하다면 여기에 작성하세요.\n`;
  code += `}\n`;
  
  console.log("[sqlExportUtils v1.1] JpaRepository 변환 완료");
  return code;
};

/**
 * 4. Java Spring Boot Service 계층 클래스 생성기
 */
export const generateJpaService = (tableName) => {
  console.log("[sqlExportUtils v1.1] Service 변환 시작");
  const className = toPascalCase(tableName);
  const camelName = toCamelCase(tableName);

  let code = `import lombok.RequiredArgsConstructor;\n`;
  code += `import org.springframework.stereotype.Service;\n`;
  code += `import org.springframework.transaction.annotation.Transactional;\n`;
  code += `import java.util.List;\n\n`;
  
  code += `@Service\n`;
  code += `@RequiredArgsConstructor\n`;
  code += `public class ${className}Service {\n\n`;
  code += `    private final ${className}Repository ${camelName}Repository;\n\n`;
  
  code += `    @Transactional(readOnly = true)\n`;
  code += `    public List<${className}> findAll() {\n`;
  code += `        return ${camelName}Repository.findAll();\n`;
  code += `    }\n\n`;

  code += `    @Transactional(readOnly = true)\n`;
  code += `    public ${className} findById(Long id) {\n`;
  code += `        return ${camelName}Repository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 데이터가 없습니다. id=" + id));\n`;
  code += `    }\n\n`;

  code += `    @Transactional\n`;
  code += `    public ${className} save(${className} entity) {\n`;
  code += `        return ${camelName}Repository.save(entity);\n`;
  code += `    }\n\n`;

  code += `    @Transactional\n`;
  code += `    public void delete(Long id) {\n`;
  code += `        ${className} entity = ${camelName}Repository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 데이터가 없습니다. id=" + id));\n`;
  code += `        ${camelName}Repository.delete(entity);\n`;
  code += `    }\n`;
  code += `}\n`;

  console.log("[sqlExportUtils v1.1] Service 변환 완료");
  return code;
};

/**
 * 5. Java Spring Boot Controller (REST API) 계층 클래스 생성기
 */
export const generateJpaController = (tableName) => {
  console.log("[sqlExportUtils v1.1] Controller 변환 시작");
  const className = toPascalCase(tableName);
  const camelName = toCamelCase(tableName);
  // URL 엔드포인트용 Kebab-case 변환 (예: my_table -> /api/my-tables)
  const kebabName = tableName.replace(/_/g, '-').toLowerCase();

  let code = `import lombok.RequiredArgsConstructor;\n`;
  code += `import org.springframework.http.ResponseEntity;\n`;
  code += `import org.springframework.web.bind.annotation.*;\n`;
  code += `import java.util.List;\n\n`;

  code += `@RestController\n`;
  code += `@RequestMapping("/api/${kebabName}s")\n`;
  code += `@RequiredArgsConstructor\n`;
  code += `public class ${className}Controller {\n\n`;
  code += `    private final ${className}Service ${camelName}Service;\n\n`;

  code += `    @GetMapping\n`;
  code += `    public ResponseEntity<List<${className}>> getAll() {\n`;
  code += `        return ResponseEntity.ok(${camelName}Service.findAll());\n`;
  code += `    }\n\n`;

  code += `    @GetMapping("/{id}")\n`;
  code += `    public ResponseEntity<${className}> getById(@PathVariable Long id) {\n`;
  code += `        return ResponseEntity.ok(${camelName}Service.findById(id));\n`;
  code += `    }\n\n`;

  code += `    @PostMapping\n`;
  code += `    public ResponseEntity<${className}> create(@RequestBody ${className} entity) {\n`;
  code += `        return ResponseEntity.ok(${camelName}Service.save(entity));\n`;
  code += `    }\n\n`;

  code += `    @DeleteMapping("/{id}")\n`;
  code += `    public ResponseEntity<Void> delete(@PathVariable Long id) {\n`;
  code += `        ${camelName}Service.delete(id);\n`;
  code += `        return ResponseEntity.noContent().build();\n`;
  code += `    }\n`;
  code += `}\n`;

  console.log("[sqlExportUtils v1.1] Controller 변환 완료");
  return code;
};