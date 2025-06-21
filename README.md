# magic-button-wrapper

Tiny, framework‑agnostic React wrapper that swaps your button’s content for a **loading ▸ success ▸ error** icon using nothing but inline styles and three keyframe animations. No CSS files, no context providers, no emotion/styled‑components – just drop it in and ship.

---

## Installation

```bash
npm install magic-button-wrapper
# or
pnpm add magic-button-wrapper
```

---

## Quick start

```tsx
import { MagicButtonWrapper } from "magic-button-wrapper";

export default function Demo() {
  return (
    <MagicButtonWrapper onClickFn={() => fetch("/api")}> {/* async fn */}
      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Save changes
      </button>
    </MagicButtonWrapper>
  );
}
```

🟢 **Idle** → 🟡 **Loading** (spinner) → 🟢 **Success** (check‑mark) → back to idle after 1.5 s.

---

## Props reference

| Prop                | Type                       | Default | Description                                                                                  |
| ------------------- | -------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `children`          | `ReactElement`             | –       | Exactly **one** interactive element (`<button>`, `<a>`, etc.).                               |
| `onClickFn`         | `(e) ⇒ unknown \| Promise` | –       | Runs on click; throw/`reject` to enter **error** state.                                      |
| `onSuccessEffect`   | `(reset) ⇒ void`           | –       | Fires **after** success icon but **before** auto‑reset. Call `reset()` to exit sooner/later. |
| `iconColorOverride` | `string \| null`           | `null`  | Any CSS color; falls back to element’s computed `color`.                                     |
| `iconSizeOverride`  | `number \| string \| null` | `null`  | Pixel value or CSS size; auto‑sizes from padding if `null`.                                  |
| `resetDelay`        | `number \| null`           | `1500`  | Milliseconds before wrapper returns to **idle**. Pass `null` to disable auto‑reset.          |

---

## Usage examples

### 1 · Zero‑config

```tsx
<MagicButtonWrapper onClickFn={() => new Promise(r => setTimeout(r, 600))}>
  <button className="btn-primary">Submit</button>
</MagicButtonWrapper>
```

### 2 · Brand‑colored icons

```tsx
<MagicButtonWrapper iconColorOverride="#16a34a" onClickFn={save}>
  <button className="bg-emerald-600 text-white rounded px-4 py-2">Pay $9.99</button>
</MagicButtonWrapper>
```

### 3 · Larger icon, no auto‑reset

```tsx
<MagicButtonWrapper iconSizeOverride={24} resetDelay={null} onClickFn={upload}>
  <button className="cta-xl">Upload file</button>
</MagicButtonWrapper>
```

When you’re ready to clear the state:

```ts
// inside onSuccessEffect or elsewhere via ref
reset();
```

### 4 · Success confetti

```tsx
import confetti from "canvas-confetti";

<MagicButtonWrapper
  resetDelay={2000}
  onClickFn={() => fetch("/api/pay")}
  onSuccessEffect={reset => {
    confetti();
    setTimeout(reset, 1800);
  }}
>
  <button className="btn-fuchsia">Celebrate</button>
</MagicButtonWrapper>
```

### 5 · Shake on error

```tsx
<MagicButtonWrapper
  onClickFn={async () => {
    await apiCall();
    throw new Error("Oops");
  }}
>
  <button className="btn-danger">Trigger error</button>
</MagicButtonWrapper>
```

---


## Troubleshooting

| Symptom                               | Fix                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| *"Wrapper expects exactly ONE child"* | Ensure you pass **one** element (no fragments).                                               |
| Icons are tiny / huge                 | Pass `iconSizeOverride` or adjust button padding so auto‑size logic picks up the desired box. |
| State never resets                    | Check that you didn’t set `resetDelay={null}` without manually calling `reset()`.             |

---

## License

MIT © 2025
