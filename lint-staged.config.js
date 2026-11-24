export default {
  "frontend/**/*": () => [
    "pnpm run frontend:format:check",
    "pnpm run frontend:lint",
    "pnpm run frontend:build:check",
  ],
  "backend/**/*": () => [
    "pnpm run backend:format:check",
    "pnpm run backend:lint",
    "pnpm run backend:build:check",
  ],
};
