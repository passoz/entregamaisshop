import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

const apiFetchMock = vi.fn();

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

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}));

vi.mock("@/components/modals/LocationModal", () => ({
  LocationModal: ({ isOpen, onClose, onSelect }: any) =>
    isOpen ? (
      <div role="dialog" aria-label="Escolher localização">
        <p>Onde você está?</p>
        <button type="button" onClick={() => onSelect("Sao Paulo, SP")}>
          Sao Paulo, SP
        </button>
        <button type="button" onClick={() => onSelect("Rio de Janeiro, RJ")}>
          Rio de Janeiro, RJ
        </button>
        <button type="button" onClick={() => onSelect("Cabo Frio, RJ")}>
          Cabo Frio, RJ
        </button>
        <button type="button" onClick={onClose}>
          Fechar localização
        </button>
      </div>
    ) : null,
}));

const sellersResponse = [
  { id: "1", name: "Depósito do Zé", category: "Cervejas", rating: 4.9, time: "15-25 min", fee: "Frete zero" },
  { id: "2", name: "Conveniência 24h", category: "Bebidas Variadas", rating: 4.5, time: "20-35 min", fee: "R$ 4,90" },
  { id: "3", name: "Distribuidora Imperial", category: "Destilados", rating: 4.7, time: "30-50 min", fee: "R$ 6,90" },
  { id: "4", name: "Gelo e Carvão Express", category: "Essenciais", rating: 4.8, time: "10-20 min", fee: "R$ 3,00" },
];

function mockFetch() {
  apiFetchMock.mockResolvedValue(sellersResponse);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        ["Centro", "Cabo Frio", "RJ", -22.88, -42.02],
        ["Copacabana", "Rio de Janeiro", "RJ", -22.97, -43.18],
        ["Centro", "Sao Paulo", "SP", -23.55, -46.63],
      ],
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
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });
  });

  it("busca depósitos próximos usando a localização atual na inicialização", async () => {
    mockGeolocationSuccess(-22.8854, -42.022);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Depósito do Zé")).toBeInTheDocument();
    });

    expect(screen.getByText(/Buscando em Centro, Cabo Frio - RJ/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum depósito encontrado/i)).not.toBeInTheDocument();
  });

  it("abre o modal quando não consegue obter a localização", async () => {
    mockGeolocationFailure();

    render(<Home />);

    expect(await screen.findByRole("dialog", { name: /Escolher localização/i })).toBeInTheDocument();
    expect(screen.getByText(/Onde você está\?/i)).toBeInTheDocument();
  });

  it("permite informar manualmente a cidade e mostra estado vazio quando não encontra depósitos", async () => {
    mockGeolocationFailure();

    render(<Home />);

    fireEvent.click(await screen.findByRole("button", { name: "Sao Paulo, SP" }));

    await waitFor(() => {
      expect(screen.getByText(/Nenhum depósito por aqui/i)).toBeInTheDocument();
    });
  });

  it("permite trocar a localização pelo ícone ao lado do título", async () => {
    mockGeolocationSuccess(-22.8854, -42.022);

    render(<Home />);

    await screen.findByText("Depósito do Zé");
    fireEvent.click(screen.getByRole("button", { name: /Alterar localização/i }));
    fireEvent.click(screen.getByRole("button", { name: "Rio de Janeiro, RJ" }));

    await waitFor(() => {
      expect(screen.getByText("Distribuidora Imperial")).toBeInTheDocument();
    });

    expect(screen.getByText(/Buscando em Rio de Janeiro, RJ/i)).toBeInTheDocument();
  });
});
