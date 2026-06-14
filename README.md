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
| `lib/cityExtractor.ts` | 住所から市区町村を抽出 |
| `hooks/useSpots.ts` | スポット一覧取得フック |
| `types/spot.ts` | Spot / SpotCategory 型定義 |

## モバイル対応メモ

### iOS Safari 対応（重要）

| 対応 | 理由 |
|---|---|
| `layout.tsx` で `viewport` を明示的にエクスポート | Next.js 15 の要件。未設定だと iOS Safari がデフォルトの 980px ビューポートで描画する |
| `<input>` / `<select>` / `<textarea>` の `font-size` を 16px 以上に統一 | 14px 未満だとフォーカス時にオートズームし、フォーカスを外しても戻らない |
| `viewportFit: "cover"` は設定しない | `env(safe-area-inset-*)` の padding を入れない限り有害。notch 周辺のレイアウトが崩れる |
| `globals.css` に `html, body { overscroll-behavior-x: none }` | iOS Safari がビジュアルビューポートを横方向にドリフトさせるのを防止 |
| `globals.css` に `body { overflow-x: clip }` | 横方向のはみ出しをクリップ（`overflow-x: hidden` だとピンチズームが壊れる） |
| フィルターチップは `flex-wrap` + `px-2 gap-1.5` で1行に収める | `overflow-x-auto` による横スクロールがページのズームに見える誤認を防ぐ |

### SpotCard のレイアウト

```
[カテゴリアイコン] 場所名
                   都道府県+市区町村  ★★☆
```

- 住所は `shortenAddress()` で都道府県＋市区町村のみに短縮（番地は不要）
- 優先度★は2行目の右に配置（1行目を場所名だけにしてスッキリさせる）
- `<Link>` には `block w-full` を付けてブロック要素として幅を確定させる

