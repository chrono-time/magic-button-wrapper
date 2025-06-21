# magic-button-wrapper

Tiny, React wrapper that swaps your button’s content for a **loading ▸ success ▸ error** icon using nothing but inline styles and three keyframe animations. No CSS files, no context providers, no emotion/styled‑components – just drop it in and ship.

---

## Installation

```bash
npm install magic-button-wrapper
# or
pnpm add magic-button-wrapper
```

---

## Demo
Visit https://sparkling-empanada-44b925.netlify.app/ to see some buttons in action!

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

### 3 · Larger icon

```tsx
<MagicButtonWrapper iconSizeOverride={24} onClickFn={upload}>
  <button className="cta-xl">Upload file</button>
</MagicButtonWrapper>
```


### 4 · Success confetti

```tsx
import confetti from "canvas-confetti";

<MagicButtonWrapper
  resetDelay={2000}
  onClickFn={() => fetch("/api/pay")}
  onSuccessEffect={reset => {
    confetti();
    //Calling reset() will remove the success state
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

## License

MIT © 2025
