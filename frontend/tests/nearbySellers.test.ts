import { describe, expect, it } from "vitest";
import {
  calculateDistanceKm,
  findCityOption,
  findNearbySellers,
  getCitySuggestions,
} from "@/lib/nearbySellers";

describe("nearby sellers helpers", () => {
  it("normalizes the city search input for autocomplete", () => {
    const suggestions = getCitySuggestions("cabo frio");
    expect(suggestions[0]?.label).toBe("Cabo Frio, RJ");
  });

  it("finds city options by exact label", () => {
    expect(findCityOption("Cabo Frio, RJ")?.state).toBe("RJ");
  });

  it("calculates distances greater than zero for distinct coordinates", () => {
    expect(calculateDistanceKm(-22.8854, -42.022, -22.9068, -43.1729)).toBeGreaterThan(0);
  });

  it("returns only sellers within the maximum radius sorted by distance", () => {
    const sellers = [
      { id: "1", name: "Depósito do Zé" },
      { id: "2", name: "Conveniência 24h" },
      { id: "3", name: "Distribuidora Imperial" },
    ];

    const result = findNearbySellers(sellers, { lat: -22.8854, lng: -42.022 }, 80);

    expect(result.map((seller) => seller.id)).toEqual(["1", "2"]);
  });
});
