import { notFound } from "next/navigation";
import { merchantLeadMonsterEnabled } from "../../../lib/merchant-lead-monster-api";
import { BookingForm } from "./BookingForm";

export default function BookPage() {
  if (!merchantLeadMonsterEnabled()) return notFound();

  return (
    <main className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
        }}
      >
        Request an Appointment
      </h1>
      <p
        style={{ color: "var(--text-secondary)", marginTop: 12, maxWidth: 720 }}
      >
        We’ll confirm a time after you submit your request.
      </p>
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <BookingForm />
      </div>
    </main>
  );
}
