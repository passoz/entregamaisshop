import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SellerSettingsPage from "@/app/vendedor/settings/page";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

describe("SellerSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads seller delivery areas and saves updates", async () => {
    apiFetchMock.mockResolvedValueOnce({
      id: "1",
      name: "Depósito do Zé",
      fee_label: "A partir de R$ 0,00",
      delivery_areas: [{ id: "area-1", label: "Cabo Frio", fee: 0 }],
    });
    apiFetchMock.mockResolvedValueOnce([]);

    render(<SellerSettingsPage />);

    expect(await screen.findByDisplayValue("Cabo Frio")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("Cabo Frio"), { target: { value: "Buzios" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar fretes/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/api/v1/vendedor/delivery-areas",
        expect.objectContaining({ method: "PUT" }),
      );
    });
  });
});
