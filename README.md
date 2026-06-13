# pinlist

行きたい場所をサクッと登録・管理する Web アプリ。スマホメインのPWA。

## 技術スタック

- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS v4
- **データベース**: Firebase Firestore
- **ホスティング**: Vercel
- **地図**: Google Maps JavaScript API
- **場所検索**: Google Places API（Autocomplete / Place Details）

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # APIキーを設定
npm run dev
```

### 必要な環境変数（`.env.local`）

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## 開発コマンド

```bash
npm run dev    # 開発サーバー起動
npm test       # テスト実行（カバレッジ付き）
npm run build  # プロダクションビルド
```

## 主要コンポーネント

| ファイル | 概要 |
|---|---|
| `components/PlaceAutocomplete.tsx` | Google Places オートコンプリート入力 |
| `lib/places.ts` | Places API ラッパー |
| `lib/categoryMapper.ts` | place types → SpotCategory マッピング |
| `types/spot.ts` | Spot / SpotCategory 型定義 |
