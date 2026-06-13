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

## 主要ファイル

| ファイル | 概要 |
|---|---|
| `app/page.tsx` | リストビュー（デフォルト） |
| `app/add/page.tsx` | 場所登録画面 |
| `app/map/page.tsx` | マップビュー |
| `app/spot/[id]/page.tsx` | 詳細画面（Static Maps プレビュー付き） |
| `app/list/[listId]/page.tsx` | 共有リンク閲覧画面 |
| `components/PlaceAutocomplete.tsx` | Google Places オートコンプリート入力 |
| `components/SpotCard.tsx` | リスト用カード |
| `components/BottomNav.tsx` | スマホ用ボトムナビゲーション |
| `components/ShareButton.tsx` | 共有リンクボタン |
| `lib/firebase.ts` | Firebase 初期化 |
| `lib/firestore.ts` | Firestore read/write 関数 |
| `lib/places.ts` | Places API ラッパー |
| `lib/categoryMapper.ts` | place types → SpotCategory マッピング |
| `hooks/useSpots.ts` | スポット一覧取得フック |
| `types/spot.ts` | Spot / SpotCategory 型定義 |

## Google Cloud で有効化が必要な API

- Places API（New）
- Maps JavaScript API
- Maps Static API（詳細画面の地図プレビューに使用）
