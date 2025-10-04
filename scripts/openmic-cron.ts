import "dotenv/config";
import cron from "node-cron";
import { runOpenMicIngestion } from "../lib/openmics/ingest";
cron.schedule(process.env.JOB_INTERVAL_CRON ?? "*/10 * * * *", async () => {
  await runOpenMicIngestion();
});
