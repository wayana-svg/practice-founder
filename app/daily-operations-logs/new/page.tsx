import { redirect } from "next/navigation";

export default function NewDailyOperationsLogsPage() {
  redirect("/daily-operations?add=1");
}