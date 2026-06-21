import { redirect } from "next/navigation";

export default function WeeklyClaimsSummaryPage() {
  redirect("/weekly-claims-summary-list?add=1");
}
