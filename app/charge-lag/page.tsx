import { redirect } from "next/navigation";

export default function ChargeLagHomePage() {
  redirect("/?table=charge_lag_submissions");
}
