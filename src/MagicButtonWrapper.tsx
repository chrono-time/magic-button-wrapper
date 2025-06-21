import React, {
  Children,
  cloneElement,
  useCallback,
  useRef,
  useState,
  ReactElement,
  MouseEvent,
} from "react";
import { Loader2, Check, X } from "lucide-react";

/* ------------------------------------------------------------------
   Inject keyframes once per document
   ------------------------------------------------------------------*/
function ensureStyles(): void {
  if (document.getElementById("mbw-css")) return; // already added

  const style = document.createElement("style");
  style.id = "mbw-css";
  style.textContent = `
    @keyframes mbw-spin { to { transform: rotate(360deg); } }
    @keyframes mbw-pop  {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); }
    }
    @keyframes mbw-shake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-3px); }
      40% { transform: translateX(3px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------
   Types & helpers
   ------------------------------------------------------------------*/
export type MagicButtonStatus = "idle" | "loading" | "success" | "error";
// Only these states have icons
type StatusWithIcon = Exclude<MagicButtonStatus, "idle">;

interface DimMeta {
  w: number;
  h: number;
  iconPx: number;
  color: string;
}

// every icon variant returns a React element
type IconSet = Record<StatusWithIcon, ReactElement>;

/* ------------------------------------------------------------------
   Build animated icons (pure CSS)
   ------------------------------------------------------------------*/
function makeIcons(color: string, size: number | string): IconSet {
  ensureStyles();
  const dim = typeof size === "number" ? `${size}px` : size;

  const baseContainer: React.CSSProperties = {
    width: dim,
    height: dim,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
    flexShrink: 0,
  };

  const baseIconProps = { size, color, className: "flex-shrink-0" } as const;

  return {
    loading: (
      <span
        key="loader"
        style={{ ...baseContainer, animation: "mbw-spin 0.9s linear infinite" }}
      >
        <Loader2 {...baseIconProps} />
      </span>
    ),
    success: (
      <span
        key="success"
        style={{
          ...baseContainer,
          animation: "mbw-pop 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        <Check {...baseIconProps} />
      </span>
    ),
    error: (
      <span
        key="error"
        style={{ ...baseContainer, animation: "mbw-shake 0.4s ease" }}
      >
        <X {...baseIconProps} />
      </span>
    ),
  };
}

/* ------------------------------------------------------------------
   Component props
   ------------------------------------------------------------------*/
export interface MagicButtonWrapperProps {
  /** Must be exactly one interactive element (e.g., <button>) */
  children: ReactElement;
  /** Called when the user clicks. Throw to trigger error state. */
  onClickFn?: (e: MouseEvent<HTMLElement>) => unknown | Promise<unknown>;
  /** Fires after success icon but before reset. */
  onSuccessEffect?: (reset: () => void) => void;
  iconColorOverride?: string | null;
  iconSizeOverride?: number | string | null;
  /** ms before component resets */
  resetDelay?: number;
}

/* ------------------------------------------------------------------
   MagicButtonWrapper (Pure CSS)
   ------------------------------------------------------------------*/
export default function MagicButtonWrapper({
  children,
  onClickFn,
  onSuccessEffect,
  iconColorOverride = null,
  iconSizeOverride = null,
  resetDelay = 1500,
}: MagicButtonWrapperProps): ReactElement {
  if (Children.count(children) !== 1) {
    throw new Error("MagicButtonWrapper expects exactly ONE child.");
  }

  const ref = useRef<HTMLElement | null>(null);
  const [dims, setDims] = useState<DimMeta | null>(null);
  const [status, setStatus] = useState<MagicButtonStatus>("idle");

  /* helper exposed to user callback so they can force‑reset sooner */
  const resetIdle = useCallback(() => setStatus("idle"), []);

  /* ------------------------------------------------------------------
     Build icons for current status
     ------------------------------------------------------------------*/
  const iconSize = iconSizeOverride ?? dims?.iconPx ?? 16;
  const icons = makeIcons(iconColorOverride ?? dims?.color ?? "currentColor", iconSize);
  const renderedIcon =
    status === "idle" ? null : icons[status as StatusWithIcon];

  /* ------------------------------------------------------------------
     Click handler – ignore synthetic clicks to stop the loop
     ------------------------------------------------------------------*/
  const handleClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!e.isTrusted) return; // ignore programmatic clicks
      if (status === "loading") return;

      if (ref.current && !dims) {
        const el = ref.current;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const padY = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
        const padX = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
        const icon = Math.min(r.height - padY, r.width - padX);
        setDims({ w: r.width, h: r.height, iconPx: icon, color: s.color || "#000" });
      }

      const clickInit: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        detail: e.detail,
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
      };

      requestAnimationFrame(() => {
        setStatus("loading");

        requestAnimationFrame(() => {
          ref.current?.dispatchEvent(new MouseEvent("click", clickInit));
        });

        (async () => {
          try {
            await onClickFn?.(e);
            setStatus("success");

            if (resetDelay != null) {
              setTimeout(() => {
                if (onSuccessEffect) onSuccessEffect(resetIdle);
                else resetIdle();
              }, resetDelay);
            }
          } catch (err) {
            console.error(err);
            setStatus("error");
            if (resetDelay != null) setTimeout(resetIdle, resetDelay);
          }
        })();
      });
    },
    [status, dims, onClickFn, resetDelay, resetIdle, onSuccessEffect]
  );

  /* ------------------------------------------------------------------
     Preserve dimensions while animating
     ------------------------------------------------------------------*/
  const baseStyle: React.CSSProperties =
    dims && status !== "idle" ? { width: `${dims.w}px`, height: `${dims.h}px` } : {};

  const child = Children.only(children);

  /* idle: render original element */
  if (status === "idle") {
    return cloneElement(child as ReactElement, {
      ref: ref as any,
      onClick: handleClick,
      style: { ...(child.props as any).style },
    } as any);
  }

  /* non-idle: render element with centred icon */
  return cloneElement(
    child as ReactElement,
    {
      ref: ref as any,
      onClick: handleClick,
      style: {
        ...(child.props as any).style,
        ...baseStyle,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      } as React.CSSProperties,
    } as any,
    renderedIcon
  );
}
