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

    expect(screen.getByRole("link", { name: "Sobre Nós" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Fale Conosco" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/terms");
    expect(screen.getAllByRole("link", { name: "Privacidade" })[0]).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Sitemap" })).toHaveAttribute("href", "/sitemap");
    expect(screen.getByRole("link", { name: "App Store" })).toHaveAttribute("href", "/app");
    expect(screen.getByRole("link", { name: "Google Play" })).toHaveAttribute("href", "/app");
  });
});
