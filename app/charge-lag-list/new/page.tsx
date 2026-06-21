import { redirect } from "next/navigation";

export default function NewChargeLagRecordPage() {
  redirect("/charge-lag-list?add=1");
}