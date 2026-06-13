// 日本の住所から市区町村を抽出する
// 例: "日本、〒273-8530 千葉県船橋市浜町２丁目１−１" → "船橋市"
export function extractCity(address: string): string {
  // 都道府県の後ろにある市区町村を取り出す
  const match = address.match(/[都道府県]([^都道府県]+?[市区町村郡])/);
  return match ? match[1] : "";
}
