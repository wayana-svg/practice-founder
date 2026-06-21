import { redirect } from "next/navigation";

export default function NewMembershipTrackerPage() {
  redirect("/membership-tracker?add=1");
}