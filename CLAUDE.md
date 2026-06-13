# 行きたい場所リストアプリ — CLAUDE.md

## プロジェクト概要

スマホメインで使う、行きたい場所をサクッと登録・管理するWebアプリ。
Google Places APIで住所・座標を自動入力し、マップビュー・リストビューで閲覧できる。
家族や知人との共有リンク機能つき。

---

## 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | Next.js 15 + TypeScript |
| スタイリング | Tailwind CSS v4 |
| データベース | Firebase Firestore |
| 認証 | Firebase Auth（任意、共有リンク方式も検討） |
| ホスティング | Vercel |
| 地図表示 | Google Maps JavaScript API |
| 場所検索 | Google Places API（Autocomplete / Place Details） |
| PWA | next-pwa（ホーム画面追加対応） |

既存のアルコールトラッカー（Next.js 15 + Supabase + Vercel）と同スタック基調。
FirebaseはFirestoreの共有モデルが共有リンク実装に向いているため採用。

---

## ディレクトリ構成（予定）

```
/
├── app/
│   ├── page.tsx              # リストビュー（デフォルト）
│   ├── map/page.tsx          # マップビュー
│   ├── add/page.tsx          # 場所登録画面
│   ├── spot/[id]/page.tsx    # 詳細画面
│   └── layout.tsx
├── components/
│   ├── SpotCard.tsx          # リスト用カード
│   ├── SpotMap.tsx           # マップ表示コンポーネント
│   ├── PlaceAutocomplete.tsx # Places APIオートコンプリート入力
│   ├── FilterBar.tsx         # 絞り込みUI
│   └── BottomNav.tsx         # スマホ用ボトムナビゲーション
├── lib/
│   ├── firebase.ts           # Firebase初期化
│   ├── firestore.ts          # Firestoreのread/write関数
│   └── places.ts             # Places API呼び出し関数
├── types/
│   └── spot.ts               # Spot型定義
├── hooks/
│   ├── useSpots.ts           # スポット一覧取得hook
│   └── useSpot.ts            # スポット1件取得hook
└── CLAUDE.md
```

---

## データモデル

### Spot（Firestoreコレクション: `spots`）

```typescript
type Spot = {
  id: string;                  // Firestoreドキュメントid
  name: string;                // 場所名
  address: string;             // 住所（Places APIから自動取得）
  lat: number;                 // 緯度（Places APIから自動取得）
  lng: number;                 // 経度（Places APIから自動取得）
  placeId: string;             // Google Place ID（Maps連携のキー）
  category: SpotCategory;      // カテゴリ
  memo: string;                // メモ（なぜ行きたいか等）
  priority: 1 | 2 | 3;        // 優先度（★1〜★3）
  status: 'unvisited' | 'visited'; // 未訪問 / 訪問済み
  createdAt: Timestamp;        // 登録日時（自動付与）
  listId: string;              // 共有リストID
};

type SpotCategory =
  | 'restaurant'   // 飲食店
  | 'cafe'         // カフェ・喫茶
  | 'camping'      // キャンプ場・アウトドア
  | 'sightseeing'  // 観光・おでかけスポット
  | 'other';       // その他
```

### List（Firestoreコレクション: `lists`）

```typescript
type SpotList = {
  id: string;       // リストID（共有URLに使用）
  name: string;     // リスト名
  createdAt: Timestamp;
};
```

共有はURLにlistIdを含めることで実現。
`/list/[listId]` でアクセスすると、そのリストのスポットを閲覧・編集できる。

---

## 画面構成

### 1. リストビュー（`/`）
- スポットをカード形式で一覧表示
- タブ：「未訪問」「訪問済み」切り替え
- 絞り込み：カテゴリ・優先度
- テキスト検索（場所名・住所・メモ）
- 優先度順・登録日順ソート
- 右下のFABボタンで登録画面へ

### 2. マップビュー（`/map`）
- 登録済みスポットをピンで表示
- カテゴリ別にピンの色を変える
- ピンタップでスポットカードをポップアップ表示
- 「Mapsで開く」ボタン（`https://maps.google.com/?q=place_id:{placeId}`）

### 3. 登録画面（`/add`）
- 場所名を入力するとPlaces APIオートコンプリートが候補を表示
- 候補を選択すると、住所・緯度経度・placeIdが自動入力される
- カテゴリ・メモ・優先度を手動入力
- 保存でFirestoreに書き込み

### 4. 詳細画面（`/spot/[id]`）
- 場所名・住所・カテゴリ・メモ・優先度を表示
- 地図ミニプレビュー（Google Static Maps API）
- 「Mapsで開く」ボタン
- 「訪問済みにする」ボタン
- 編集・削除

---

## 重要な設計方針

### Google Place IDを必ず保存する
住所文字列だけでなく、Place IDを保存することでMaps連携・重複チェック・将来的な情報更新が安定する。
`https://maps.google.com/?q=place_id:{placeId}` でそのままMapsアプリが開く。

### スマホファーストのUI
- ボトムナビゲーション（リスト・マップ・追加）
- タップターゲットは最低44px
- 登録フローは1画面で完結させる（モーダルでなくページ遷移）

### 共有リンク方式
初期実装ではFirebase Authは使わず、listIdをURLに含めた共有リンク方式で実装する。
`/list/[listId]` にアクセスした人は誰でも閲覧・編集可能。
将来的にAuth導入でオーナー管理を追加する。

### 環境変数

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## MVPスコープ（初回リリース）

- [x] 場所登録（Places APIオートコンプリート）
- [x] リストビュー（絞り込み・検索・ソート）
- [x] マップビュー（カテゴリ別ピン）
- [x] 未訪問 / 訪問済み管理
- [x] 詳細画面（Mapsで開くボタン）
- [x] 共有リンク（listId方式）

## v2以降に持ち越す機能

- 写真添付
- 訪問日・感想の記録
- カスタムカテゴリ追加UI
- 複数スポットをまとめてルート提案
- Firebase Auth によるオーナー管理

---

## 開発の進め方

1. ~~`npx create-next-app@latest` でプロジェクト作成~~ ✅ 完了
2. Firebase・Google Maps APIのキーを取得して `.env.local` に設定
3. ~~Places APIオートコンプリートの動作確認（`PlaceAutocomplete.tsx`）~~ ✅ 完了
4. Firestoreのread/write関数を実装（`lib/firestore.ts`）
5. リストビューとマップビューを実装
6. 共有リンク機能を実装
7. Vercelにデプロイ

---

## テスト

```bash
npm test         # ビジネスロジックのテスト（lib/）
```

- `lib/categoryMapper.ts` — place types → SpotCategory マッピング（カバレッジ 100%）
- `lib/places.ts` — Places API ラッパー（カバレッジ ~98%）
- 外部 API（Google Maps）は `__mocks__/@googlemaps/js-api-loader.ts` でモック化

---

## PlaceAutocomplete の機能

`components/PlaceAutocomplete.tsx` は以下の機能を持つ：

| 機能 | 詳細 |
|---|---|
| 候補表示 | 入力から 300ms debounce で Places Autocomplete API を呼び出し |
| アイコン＋住所 | 候補行にカテゴリ絵文字と secondary_text（住所）を表示 |
| 現在地バイアス | Geolocation API で取得した座標を locationBias（半径 50km）に設定 |
| カテゴリ自動推定 | 選択した Place の types から SpotCategory を推定して onSelect で返す |
| 履歴表示 | localStorage に最大 5 件保存し、空フォーカス時にサジェスト |
| クリアボタン | 入力中は ✕ ボタンで一発リセット |
