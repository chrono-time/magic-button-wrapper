/* ----------------------------------------------------------------------
   Demo page for magic-button-wrapper (confetti now reliable)
   ----------------------------------------------------------------------*/
import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import { MagicButtonWrapper } from "../../dist/index";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import "./index.css";

/* ------------------------------------------------------------------
   Helper – launch confetti at viewport‑relative coords (0‑1)
   ------------------------------------------------------------------*/
async function launchConfetti(x: number, y: number) {
  const { default: confetti } = await import("canvas-confetti");
  confetti({ particleCount: 100, spread: 70, origin: { x, y } });
}

/* ------------------------------------------------------------------
   Re‑usable UI wrapper for every example
   ------------------------------------------------------------------*/
interface ExampleProps {
  title: string;
  desc: string;
  children: React.ReactNode;
}
function ExampleCard({ title, desc, children }: ExampleProps) {
  return (
    <Card className="w-full max-w-md border border-muted-foreground/20">
      <CardHeader style={{height:'4rem'}}>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground leading-snug mt-1">{desc}</p>
      </CardHeader>
      {/* fixed height so every button lines up */}
      <CardContent className="flex items-center justify-center py-6 h-28">
        {children}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------
   Example 4 – record click position & fire confetti there
   ------------------------------------------------------------------*/
function ConfettiExample() {
  // store the most recent pointer position so we don’t rely on a ref from MagicButtonWrapper
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const handleSuccess = (reset: () => void) => {
    const { x, y } =
      lastPos.current ?? { x: window.innerWidth / 2, y: window.innerHeight * 0.6 };
    launchConfetti(x / window.innerWidth, y / window.innerHeight);
    setTimeout(reset, 1800);
  };

  return (
    <ExampleCard
      title="4. Success effect"
      desc="Fire confetti exactly where the user clicked, wait 2 s, then auto‑reset."
    >
      <MagicButtonWrapper
        resetDelay={2000}
        onClickFn={() => new Promise(r => setTimeout(r, 700))}
        onSuccessEffect={handleSuccess}
      >
        <button
          onPointerDown={e => {
            lastPos.current = { x: e.clientX, y: e.clientY };
          }}
          className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white font-medium shadow-sm hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
        >
          Celebrate
        </button>
      </MagicButtonWrapper>
    </ExampleCard>
  );
}

/* ------------------------------------------------------------------
   Main demo page – each <ExampleCard> showcases one capability
   ------------------------------------------------------------------*/
function Demo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-10 max-w-4xl mx-auto">
      <header className="space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight">magic-button-wrapper • Live Demo</h1>
        <p className="text-base text-muted-foreground">
          Tiny React wrapper that swaps your button content with an animated icon
          for <em>loading ▸ success ▸ error</em>—all in pure CSS.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8 justify-items-center">
        {/* Example 1 --------------------------------------------------- */}
        <ExampleCard
          title="1. Zero-config button"
          desc="Drop-in usage, wrapper figures out color & icon size automatically."
        >
          <MagicButtonWrapper onClickFn={() => new Promise(r => setTimeout(r, 600))}>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Click me!
            </button>
          </MagicButtonWrapper>
        </ExampleCard>

        {/* Example 2 --------------------------------------------------- */}
        <ExampleCard
          title="2. Custom icon color"
          desc="Override the icon color to match brand palette."
        >
          <MagicButtonWrapper
            iconColorOverride="#6EE7B7"
            onClickFn={() => new Promise(r => setTimeout(r, 600))}
          >
            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Pay $9.99
            </button>
          </MagicButtonWrapper>
        </ExampleCard>

        {/* Example 3 --------------------------------------------------- */}
        <ExampleCard
          title="3. Custom icon size"
          desc="Large CTA with 40‑px animated icons."
        >
          <MagicButtonWrapper
            iconSizeOverride={40}
            onClickFn={() => new Promise(r => setTimeout(r, 800))}
          >
            <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-lg font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Big Button
            </button>
          </MagicButtonWrapper>
        </ExampleCard>

        {/* Example 4 --------------------------------------------------- */}
        <ConfettiExample />

        {/* Example 5 --------------------------------------------------- */}
        <ExampleCard
          title="5. Error state demo"
          desc="Throw inside onClickFn to trigger shake/X animation."
        >
          <MagicButtonWrapper
            onClickFn={async () => {
              await new Promise(r => setTimeout(r, 500));
              throw new Error("Simulated failure");
            }}
          >
            <button className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Fail me
            </button>
          </MagicButtonWrapper>
        </ExampleCard>
      </section>

      <footer className="pt-12 text-center text-xs text-muted-foreground" />
    </div>
  );
}

/* ------------------------------------------------------------------
   Mount the demo when this module executes in the browser bundle
   ------------------------------------------------------------------*/
if (typeof document !== "undefined") {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Demo />);
}

export default Demo;
