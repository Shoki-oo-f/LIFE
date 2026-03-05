# Global Rules for Autonomous Architecture
1. **Domain Separation**: 
   - Backend logic MUST be in `/backend` using `Bun` and `Hono`.
   - Frontend logic MUST be in `/frontend` using `Next.js (App Router)`.
2. **NO REST APIs FOR DATA FETCHING**: フロントエンドからのデータ取得に `fetch` 等を使用してはならない。データ同期はローカルファーストDBである `Triplit` を使用すること。
3. **Generative UI Paradigm**: フロントエンドに静的なダッシュボード画面を作ってはならない。`Vercel AI SDK` を用い、ユーザーの要求に応じてReactコンポーネントを動的生成（streamUI）すること。
4. **Self-Healing Requirement**: バックエンドは必ず `bun run --watch src/index.ts` で起動すること（ファイル上書き時の瞬間再起動のため）。
