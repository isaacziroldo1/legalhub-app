import { env } from "@/env";
import { createApp } from "@/app";

async function main() {
  const app = createApp();

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
