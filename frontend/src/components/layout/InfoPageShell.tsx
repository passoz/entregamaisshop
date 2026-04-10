import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InfoPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: InfoPageShellProps) {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-6">
        <Button asChild variant="ghost" className="px-0 text-ze-black hover:bg-transparent hover:text-ze-red">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a home
          </Link>
        </Button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border-4 border-ze-black bg-white shadow-[14px_14px_0px_0px_rgba(34,34,34,1)]">
        <div className="bg-ze-black px-6 py-10 text-white md:px-10 md:py-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-ze-yellow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold text-white/70 md:text-base">
            {description}
          </p>
        </div>

        <div className="space-y-10 px-6 py-8 md:px-10 md:py-10">{children}</div>
      </section>
    </main>
  );
}
