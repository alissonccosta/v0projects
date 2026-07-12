/** Estado compartilhado das server actions de formulário. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message?: string; data?: Record<string, string> }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const idleState: ActionState = { status: "idle" };
