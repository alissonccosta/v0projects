import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sem `globals: true`, o cleanup automático da Testing Library não é
// registrado — fazemos isso explicitamente.
afterEach(() => {
  cleanup();
});
