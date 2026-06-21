import { redirect } from "next/navigation";

export default function NewWeeklyFinancialReportPage() {
  redirect("/weekly-financial-reports-list?add=1");
}