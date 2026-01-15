# K-Food Export Passport AI 배포 작업 목록

## 완료된 작업

### 백엔드 (Cloud Run)
- [x] Docker 이미지 빌드
- [x] Artifact Registry 푸시
- [x] Cloud Run 배포 완료
- **API URL**: https://kfood-api-233469550454.asia-northeast3.run.app

### 프론트엔드 (Vercel)
- [x] 폴더명 변경: `kfood-export-passport-ai-frontend`
- [x] GitHub 레포지토리 생성 및 푸시
- [x] Vercel 배포 완료
- [x] 환경 변수 설정 (`VITE_API_BASE_URL`)
- **GitHub**: https://github.com/kimhj0707/kfood-export-passport-ai-frontend
- **프론트엔드 URL**: https://kfood-export-passport-ai-frontend.vercel.app

---

## 배포 완료!

---

## 프로젝트 구조
```
kfood-export-passport-ai/
├── src/api/          # 백엔드 (FastAPI) - Cloud Run 배포됨
├── [프론트엔드폴더]/ # React + Vite - Vercel 배포 예정
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── Dockerfile        # 백엔드용
```

## 환경 변수 참고
- 프론트엔드 `.env.local` 파일에 API URL 설정 필요
