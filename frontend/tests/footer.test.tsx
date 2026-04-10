import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer links", () => {
  it("renders internal footer links with real routes", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Sobre Nós" })).toHaveAttribute("href", "/institucional/sobre-nos");
    expect(screen.getByRole("link", { name: "Fale Conosco" })).toHaveAttribute("href", "/ajuda/fale-conosco");
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/ajuda/termos-de-uso");
    expect(screen.getAllByRole("link", { name: "Privacidade" })[0]).toHaveAttribute("href", "/ajuda/privacidade");
  });
});
