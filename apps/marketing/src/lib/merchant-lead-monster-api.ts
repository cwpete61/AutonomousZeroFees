export function merchantLeadMonsterEnabled() {
  return (
    process.env.NEXT_PUBLIC_MERCHANT_LEAD_MONSTER_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_MLM_ENABLED === "true"
  );
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:40000";
}

export async function createCalculatorSession(payload: any) {
  const res = await fetch(
    `${baseUrl()}/merchant-lead-monster/calculator/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getCalculatorSession(id: string) {
  const res = await fetch(
    `${baseUrl()}/merchant-lead-monster/calculator/sessions/${id}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function createAppointment(payload: any) {
  const res = await fetch(`${baseUrl()}/merchant-lead-monster/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
