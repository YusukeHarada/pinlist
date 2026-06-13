import { extractCity } from "@/lib/cityExtractor";

describe("extractCity", () => {
  it("都道府県+市を抽出できる", () => {
    expect(extractCity("日本、〒273-8530 千葉県船橋市浜町２丁目１−１")).toBe("船橋市");
  });

  it("都道府県+区を抽出できる", () => {
    expect(extractCity("日本、〒150-0002 東京都渋谷区道玄坂")).toBe("渋谷区");
  });

  it("都道府県+郡+町を抽出できる", () => {
    expect(extractCity("北海道河東郡音更町")).toBe("河東郡");
  });

  it("都道府県が含まれない住所は空文字を返す", () => {
    expect(extractCity("船橋市浜町２丁目")).toBe("");
  });

  it("空文字は空文字を返す", () => {
    expect(extractCity("")).toBe("");
  });
});
