import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StorePage from "@/app/store/[id]/page";

const apiFetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}));

vi.mock("@/components/product/ProductCard", () => ({
  ProductCard: ({ product }: any) => <div>{product.name}</div>,
}));

describe("StorePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders rating and freight information from the backend", async () => {
    apiFetchMock
      .mockResolvedValueOnce({
        id: "1",
        name: "Depósito do Zé",
        rating: 5,
        review_count: 0,
        fee_label: "A partir de R$ 0,00",
        delivery_areas: [{ id: "area-1", label: "Cabo Frio", fee: 0, fee_label: "R$ 0,00" }],
      })
      .mockResolvedValueOnce([
        { id: "prod-1", name: "Vinho Tinto Seco", price: 29.9, category: "Vinhos", seller_id: "1" },
      ]);

    render(<StorePage />);

    expect(await screen.findByText("Depósito do Zé")).toBeInTheDocument();
    expect(screen.getByText("A partir de R$ 0,00")).toBeInTheDocument();
    expect(screen.getByText(/Media atual 5.0 com 0 avaliacoes/i)).toBeInTheDocument();
  });

  it("submits a customer review and reloads the store summary", async () => {
    apiFetchMock
      .mockResolvedValueOnce({
        id: "1",
        name: "Depósito do Zé",
        rating: 5,
        review_count: 0,
        fee_label: "A partir de R$ 0,00",
        delivery_areas: [],
      })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ id: "review-1" })
      .mockResolvedValueOnce({
        id: "1",
        name: "Depósito do Zé",
        rating: 4.8,
        review_count: 1,
        fee_label: "A partir de R$ 0,00",
        delivery_areas: [],
      });

    render(<StorePage />);

    await screen.findByText("Depósito do Zé");
    fireEvent.click(screen.getByRole("button", { name: /Selecionar nota 4/i }));
    fireEvent.change(screen.getByPlaceholderText(/Conte rapidamente/i), { target: { value: "Chegou gelado" } });
    fireEvent.click(screen.getByRole("button", { name: /Enviar avaliacao/i }));

    await waitFor(() => {
      expect(screen.getByText(/Avaliacao enviada com sucesso/i)).toBeInTheDocument();
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/v1/sellers/1/reviews", expect.objectContaining({ method: "POST" }));
    expect(screen.getByText(/Media atual 4.8 com 1 avaliacoes/i)).toBeInTheDocument();
  });
});
