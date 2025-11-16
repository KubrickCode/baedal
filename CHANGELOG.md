# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.0](https://github.com/KubrickCode/baedal/releases/tag/v1.0.0) - 2024-11-05

### 🚀 What's New in v1.0.0

Major milestone release with push command MVP implementation and comprehensive codebase improvements.

### 새기능

- **push 명령 MVP 구현** - 새로운 push 명령어 추가

### 개선

- typescript-eslint 업데이트
- eslint 업데이트
- ky 업데이트
- @types/node 업데이트
- tar 업데이트
- 기타 다양한 의존성 업데이트

### 버그 수정

- Docker 빌드 실패 해결 (Debian trixie에서 moby-cli 부재 문제)

### 유지보수

- 린트 워크플로우 추가
- 코드 포맷팅 개선
- Prettier 규칙 적용
- Claude Code 린트 훅 추가

### 문서

- README에 기여 섹션 추가

**Full Changelog**: https://github.com/KubrickCode/baedal/compare/v0.1.1...v1.0.0

---

## [v0.1.1](https://github.com/KubrickCode/baedal/releases/tag/v0.1.1) - 2024-10-11

### 🚀 What's New in v0.1.1

Enhanced user experience with interactive overwrite confirmation.

### 새기능

- **대화형 덮어쓰기 확인** - CLI 옵션을 통한 대화형 덮어쓰기 확인 추가

**Full Changelog**: https://github.com/KubrickCode/baedal/compare/v0.1.0...v0.1.1

---

## [v0.1.0](https://github.com/KubrickCode/baedal/releases/tag/v0.1.0) - 2024-10-11

### 🚀 What's New in v0.1.0

Major feature expansion with multi-platform support and authentication capabilities.

### 새기능

- **GitLab 지원** - 최적화된 하위 디렉토리 다운로드 지원
- **Bitbucket 지원** - Bitbucket 저장소 다운로드 추가
- **비공개 저장소 인증** - 인증 토큰을 통한 비공개 저장소 지원
- **파일 제외 기능** - 특정 파일 패턴 제외 옵션 추가

### 개선

- ofetch에서 ky로 마이그레이션
- Commander 통합 개선

### 유지보수

- GitHub Actions 업데이트
- 다양한 의존성 업데이트

**Full Changelog**: https://github.com/KubrickCode/baedal/compare/v0.0.3...v0.1.0

---

## [v0.0.3](https://github.com/KubrickCode/baedal/releases/tag/v0.0.3) - 2024-10-10

### 🚀 What's New in v0.0.3

CLI execution improvements.

### 개선

- **Shebang 추가** - tsup 배너를 통해 CLI 출력에 shebang 추가

**Full Changelog**: https://github.com/KubrickCode/baedal/compare/v0.0.1...v0.0.3

---

## [v0.0.1](https://github.com/KubrickCode/baedal/releases/tag/v0.0.1) - 2024-10-10

### 🚀 What's New in v0.0.1

Initial release of baedal - a GitHub repository downloader CLI tool.

### 새기능

- **초기 릴리즈** - GitHub 저장소 다운로더 CLI MVP 구현
- 기본적인 저장소 다운로드 기능
- 하위 디렉토리 다운로드 지원

**Full Changelog**: https://github.com/KubrickCode/baedal/commits/v0.0.1
