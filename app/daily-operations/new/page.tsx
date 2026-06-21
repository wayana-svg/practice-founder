import { redirect } from "next/navigation";

export default function NewDailyOperationsPage() {
  redirect("/daily-operations?add=1");
}