"use client";
import { useEffect, useState } from "react";

export default function OpenMicList({ city="Olympia", state="WA" }:{city?:string;state?:string}) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    const url = `/api/open-mics?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&pageSize=50`;
    fetch(url).then(r=>r.json()).then(j=>setRows(j.data||[]));
  }, [city,state]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r) => (
        <div key={r.id} className="rounded-2xl p-4 shadow">
          <div className="text-lg font-semibold">{r.title}</div>
          <div className="text-sm opacity-80">
            {r.startUtc ? new Date(r.startUtc).toLocaleString() : (r.recurrence||"Recurring")}
          </div>
          <div className="text-sm">{[r.venueName, r.city && `${r.city}, ${r.state||""}`].filter(Boolean).join(" • ")}</div>
          <div className="mt-2 flex gap-3">
            <a href={r.url} target="_blank" className="underline">Page</a>
            {r.signupUrl && <a href={r.signupUrl} target="_blank" className="underline">Signup</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
