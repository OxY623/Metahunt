import { getArchetypeRelation } from "../entities/user/lib/archetypes";

describe("getArchetypeRelation", () => {
  it("возвращает neutral при пустых значениях", () => {
    // Если нет источника или цели, ожидаем neutral.
    expect(getArchetypeRelation(null, "FOXY")).toBe("neutral");
    expect(getArchetypeRelation("OXY", null)).toBe("neutral");
    expect(getArchetypeRelation(undefined, undefined)).toBe("neutral");
  });

  it("корректно определяет контру и торговлю", () => {
    // FOXY контрит OXY, а OWL торгует со всеми.
    expect(getArchetypeRelation("FOXY", "OXY")).toBe("counter");
    expect(getArchetypeRelation("OWL", "BEAR")).toBe("trade");
  });

  it("возвращает ally для одного архетипа", () => {
    // Союз с самим собой всегда ally.
    expect(getArchetypeRelation("BEAR", "BEAR")).toBe("ally");
  });
});
