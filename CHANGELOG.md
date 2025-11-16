## [1.0.3](https://github.com/KubrickCode/baedal/compare/v1.0.2...v1.0.3) (2025-11-16)

### 🔧 Internal Fixes

- fix release to main sync by using --no-edit instead of --ff-only ([d7e6332](https://github.com/KubrickCode/baedal/commit/d7e63327b6ed2a64056947031355bf2068807ea9))

## [1.0.2](https://github.com/KubrickCode/baedal/compare/v1.0.1...v1.0.2) (2025-11-16)

### 🔧 Internal Fixes

- Fixed an issue where the package.json version was not updated even after release. ([319de11](https://github.com/KubrickCode/baedal/commit/319de1107fa97ba490f1d4c0198eeb5e50164ff2))

## [1.0.1](https://github.com/KubrickCode/baedal/compare/v1.0.0...v1.0.1) (2025-11-16)

### 📚 Documentation

- Add command execution principles to CLAUDE.md ([ca45098](https://github.com/KubrickCode/baedal/commit/ca450989306692910a78dbbb81f572feaf7ba6a1))
- add ifix type and improve distinction guide in commit message generator ([2b45d64](https://github.com/KubrickCode/baedal/commit/2b45d645e015c5f8be8c474da55c9ee262fc5ac9))
- Added Conventional Commits specifications to the commit command. ([647c351](https://github.com/KubrickCode/baedal/commit/647c3516884517a4815bc397906695d12092d4ee))
- AI-related documentation and settings replaced ([5bdb079](https://github.com/KubrickCode/baedal/commit/5bdb079b907249baad3dc9dd5ded060bb0fc9bd6))
- update CLAUDE.md ([4d72c09](https://github.com/KubrickCode/baedal/commit/4d72c09312213448023a66e0e8180d16f0f7173e))
- Update CLAUDE.md ([ba5acfe](https://github.com/KubrickCode/baedal/commit/ba5acfe953e8975f4e12b4defdd94f566716db61))

### 💄 Styles

- modify breaking formatted doc ([c6b837a](https://github.com/KubrickCode/baedal/commit/c6b837a7c5427690732228dc2e832dce1d5b53a2))

### 🔨 Chore

- add dual language document generation to workflow commands ([8303cb1](https://github.com/KubrickCode/baedal/commit/8303cb1c34cbbada43432b8e6684824652fe1b2c))
- add mcp json ([62ce9ac](https://github.com/KubrickCode/baedal/commit/62ce9ac61fb30732b74fe6342618612f4850f227))
- Added CLAUDE skills to fix dependency versions and related principles ([9e00593](https://github.com/KubrickCode/baedal/commit/9e005938b64f614f51b9aa48a7f776e52efce60a))
- Change the dependabot commit message conventions ([61f5266](https://github.com/KubrickCode/baedal/commit/61f52661a40242fc84cf4b9135250913e87f165e))
- Change the Discord webhook url environment variable name ([b9305eb](https://github.com/KubrickCode/baedal/commit/b9305ebea977b93094543bc8cccece930395dc19))
- Fix formatting inconsistency between save and lint execution ([7429665](https://github.com/KubrickCode/baedal/commit/74296652e6c11580be4040eba4cd133ed9ae5d3e))
- Fixed an error that occurred when a PR author attempted to add themselves as a reviewer. ([22d8942](https://github.com/KubrickCode/baedal/commit/22d89426588812ea2cfca0e7eaf2e207176a8db7))
- Fixed Claude Code re-login issue when rebuilding DevContainer. ([883c250](https://github.com/KubrickCode/baedal/commit/883c2502761e17a14628b3170c9c7a4ead9947ae))
- implement semantic-release automation for version management and releases ([16f3a63](https://github.com/KubrickCode/baedal/commit/16f3a6360ad1d656e644a46fcd99a87f9791520c))
- implement semantic-release automation for version management and releases ([d4a7fc2](https://github.com/KubrickCode/baedal/commit/d4a7fc2dbd55eb61ce7664ae6f9d90b59e07a8a9))
- Improved the issue of delayed pre-commit lint error detection, resulting in rework. ([7028a80](https://github.com/KubrickCode/baedal/commit/7028a8093e3312cd09c3266e7a805d4dcff41b97))
- Migrating the package manager from yarn to pnpm ([2a88ef5](https://github.com/KubrickCode/baedal/commit/2a88ef5dcab42659c69c53b67d980d4149ce82ef))
- Modify workflow-specific documents to not be uploaded to git ([56858ec](https://github.com/KubrickCode/baedal/commit/56858ec0a811afead48e48dfbf985b667f68e950))
- Remove incorrectly formatted documents ([36d3933](https://github.com/KubrickCode/baedal/commit/36d3933b116ff696890564056347e9e52129baef))
- Remove unnecessary vscode extensions ([07db26b](https://github.com/KubrickCode/baedal/commit/07db26b135018357f553623af832b0421dedead1))
- Set the git action button terminal name ([b3098cb](https://github.com/KubrickCode/baedal/commit/b3098cb79c0718590781a917aa6cfede508222d6))
- Setting global environment variables ([1103218](https://github.com/KubrickCode/baedal/commit/11032181eaa54bd31f3f146de478c26aef714529))
- Sync prompts from the ai-config-toolkit repository ([e4ccfa6](https://github.com/KubrickCode/baedal/commit/e4ccfa675d6084019a02fae504e38e69d24ba2e8))
- Synchronizing code from the ai-config-toolkit repository ([6910c94](https://github.com/KubrickCode/baedal/commit/6910c9426bbb16a49c210fb7e0cfab1c777671d7))
- update claude code terminal name ([22a3a37](https://github.com/KubrickCode/baedal/commit/22a3a37f2c78a19e7e8262cf22805b93f8f62d6d))
- update gitignore ([0432b06](https://github.com/KubrickCode/baedal/commit/0432b06d10da971f10a6d726039a7fe6231c9575))

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
