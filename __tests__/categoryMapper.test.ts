import { inferCategory } from "@/lib/categoryMapper";

describe("inferCategory", () => {
  it.each([
    [["restaurant", "food"], "restaurant"],
    [["food"], "restaurant"],
    [["bar"], "restaurant"],
    [["bakery"], "restaurant"],
    [["meal_takeaway"], "restaurant"],
    [["meal_delivery", "restaurant"], "restaurant"],
    [["cafe"], "cafe"],
    [["coffee_shop"], "cafe"],
    [["campground"], "camping"],
    [["rv_park"], "camping"],
    [["park"], "camping"],
    [["natural_feature"], "camping"],
    [["tourist_attraction"], "sightseeing"],
    [["museum"], "sightseeing"],
    [["amusement_park"], "sightseeing"],
    [["art_gallery"], "sightseeing"],
    [["aquarium"], "sightseeing"],
    [["zoo"], "sightseeing"],
    [["stadium"], "sightseeing"],
    [["place_of_worship"], "sightseeing"],
    [["landmark"], "sightseeing"],
    [["point_of_interest"], "sightseeing"],
    [["shopping_mall"], "other"],
    [["hospital"], "other"],
    [[], "other"],
  ] as [string[], string][])(
    "types %j → %s",
    (types, expected) => {
      expect(inferCategory(types)).toBe(expected);
    }
  );

  it("最初にマッチしたカテゴリを返す", () => {
    // restaurant が先に登場するので restaurant になる
    expect(inferCategory(["restaurant", "cafe"])).toBe("restaurant");
  });

  it("cafe が restaurant より先に登場する場合は cafe", () => {
    expect(inferCategory(["cafe", "restaurant"])).toBe("cafe");
  });
});
