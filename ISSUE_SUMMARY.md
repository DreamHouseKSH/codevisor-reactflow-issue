# 🔗 React Flow 전문가 의뢰용 저장소

## GitHub 저장소
**https://github.com/DreamHouseKSH/codevisor-reactflow-issue**

## 📋 전문가 의뢰 내용

### 문제 요약
React Flow (@xyflow/react v12)에서 노드들이 모두 한 위치에 클러스터링되는 문제가 발생합니다. 엣지는 올바른 위치에 렌더링되지만 노드들은 모두 (0,0) 위치에 뭉쳐있습니다.

### 제공 자료
1. **문제 재현 코드** (`problem-version/`) - 실제 문제가 발생하는 CodeVisor 구현
2. **정상 작동 코드** (`working-version/`) - 동일한 React Flow v12로 정상 작동하는 독립 구현
3. **상세 분석 자료** (`analysis/`) - 콘솔 로그, 시도한 해결책들

### 핵심 차이점
- **데이터**: 두 버전 모두 올바른 position 데이터 보유
- **미니맵**: 문제 버전에서도 올바른 위치 표시 (데이터 무결성 증명)
- **DOM Transform**: 문제 버전은 모든 노드가 `transform: matrix(1,0,0,1,0,0)`

### 전문가 분석 요청 사항
1. React Flow의 position → transform 변환 파이프라인 분석
2. 두 구현 간의 정확한 차이점 식별
3. 최소한의 수정으로 문제 해결 방안 제시

## 🎯 기대 결과
React Flow 전문가의 깊이 있는 분석을 통해 근본 원인을 파악하고, 자연스러운 상호작용을 유지하면서 노드 위치 문제를 해결하는 방법을 찾는 것입니다.

---
**작성일**: 2025-06-23  
**문의**: GitHub Issues 또는 코드 리뷰 요청