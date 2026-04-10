import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, ...props }: any) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const sellersResponse = [
  { id: "1", name: "Depósito do Zé", category: "Cervejas", rating: 4.9, time: "15-25 min", fee: "Frete zero" },
  { id: "2", name: "Conveniência 24h", category: "Bebidas Variadas", rating: 4.5, time: "20-35 min", fee: "R$ 4,90" },
  { id: "3", name: "Distribuidora Imperial", category: "Destilados", rating: 4.7, time: "30-50 min", fee: "R$ 6,90" },
  { id: "4", name: "Gelo e Carvão Express", category: "Essenciais", rating: 4.8, time: "10-20 min", fee: "R$ 3,00" },
];

function mockFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sellersResponse,
    }),
  );
}

function mockGeolocationSuccess(latitude: number, longitude: number) {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback) =>
        success({
          coords: {
            latitude,
            longitude,
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition),
      ),
    },
  });
}

function mockGeolocationFailure() {
  Object.defineProperty(global.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((_success: PositionCallback, error?: PositionErrorCallback) =>
        error?.({ code: 1, message: "denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError),
      ),
    },
  });
}

describe("Home page nearby sellers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockFetch();
  });

  it("busca depósitos próximos usando a localização atual na inicialização", async () => {
    mockGeolocationSuccess(-22.8854, -42.022);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Depósito do Zé")).toBeInTheDocument();
    });

    expect(screen.getByText(/Buscando em sua localizacao atual/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum depósito encontrado/i)).not.toBeInTheDocument();
  });

  it("abre o modal quando não consegue obter a localização", async () => {
    mockGeolocationFailure();

    render(<Home />);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Nao foi possivel descobrir sua localizacao/i)).toBeInTheDocument();
  });

  it("permite informar manualmente a cidade e mostra estado vazio quando não encontra depósitos", async () => {
    mockGeolocationFailure();

    render(<Home />);

    const input = await screen.findByPlaceholderText(/Digite sua cidade/i);
    fireEvent.change(input, { target: { value: "Sao Paulo, SP" } });
    fireEvent.click(screen.getByRole("button", { name: /Buscar depositos/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nenhum depósito foi encontrado para Sao Paulo, SP/i)).toBeInTheDocument();
    });
  });

  it("permite trocar a localização pelo ícone ao lado do título", async () => {
    mockGeolocationSuccess(-22.8854, -42.022);

    render(<Home />);

    await screen.findByText("Depósito do Zé");
    fireEvent.click(screen.getByRole("button", { name: /Alterar localização/i }));

    const input = await screen.findByPlaceholderText(/Digite sua cidade/i);
    fireEvent.change(input, { target: { value: "Rio de Janeiro, RJ" } });
    fireEvent.click(screen.getByRole("button", { name: "Rio de Janeiro, RJ" }));

    await waitFor(() => {
      expect(screen.getByText("Distribuidora Imperial")).toBeInTheDocument();
    });

    expect(screen.getByText(/Buscando em Rio de Janeiro, RJ/i)).toBeInTheDocument();
  });
});
