"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/apiPublic";
import { updateSettings } from "@/lib/apiAdmin";
import type { SiteSettings } from "@/lib/types";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { toast } from "@/lib/toast";
import { fetchJson } from "@/lib/http";

export default function SettingsAdminPage() {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);

  const [admins, setAdmins] = useState<any[]>([]);
  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");
  const [aRole, setARole] = useState<"admin" | "editor">("admin");
  const [busyAdmin, setBusyAdmin] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => setData(s as any))
      .catch((e) => toast.error("Gagal memuat settings", { description: e?.message }));

    // optional: only admin can load this successfully
    fetchJson<{ items: any[] }>("/api/admin/admins", { method: "GET" })
      .then((d) => setAdmins(d.items || []))
      .catch(() => setAdmins([]));
  }, []);

  if (!data) return <div className="text-sm text-muted">Loading settings…</div>;

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-2xl font-semibold">Site Settings</div>
        <p className="mt-2 text-sm text-muted">Semua konten utama website bisa diubah dari sini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <label className="text-sm font-semibold">Organization name</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.org_name}
            onChange={(e) => setData({ ...data, org_name: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Tagline</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.tagline ?? ""}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">Hero title</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.hero_title ?? ""}
            onChange={(e) => setData({ ...data, hero_title: e.target.value })}
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">Hero subtitle</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
            value={data.hero_subtitle ?? ""}
            onChange={(e) => setData({ ...data, hero_subtitle: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Donation CTA label</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.donation_cta_label ?? ""}
            onChange={(e) => setData({ ...data, donation_cta_label: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Donation link</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.donation_link ?? ""}
            onChange={(e) => setData({ ...data, donation_link: e.target.value })}
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">About (short)</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
            value={data.about_short ?? ""}
            onChange={(e) => setData({ ...data, about_short: e.target.value })}
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">About (long) - markdown</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[180px]"
            value={data.about_long ?? ""}
            onChange={(e) => setData({ ...data, about_long: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Vision</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
            value={data.vision ?? ""}
            onChange={(e) => setData({ ...data, vision: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Mission (one per line)</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
            value={(data.mission_items ?? []).join("\n")}
            onChange={(e) =>
              setData({
                ...data,
                mission_items: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">Values (comma separated)</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={(data.values_items ?? []).join(", ")}
            onChange={(e) =>
              setData({
                ...data,
                values_items: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div className="grid gap-3 md:col-span-2">
          <label className="text-sm font-semibold">Address</label>
          <textarea
            className="rounded-xl border border-black/10 px-3 py-2 text-sm min-h-[90px]"
            value={data.address ?? ""}
            onChange={(e) => setData({ ...data, address: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Phone</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.phone ?? ""}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-semibold">Email</label>
          <input
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
            value={data.email ?? ""}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ImagePicker
          label="Hero image"
          value={data.hero_image_url}
          folder="hero"
          onChange={(url) => setData({ ...data, hero_image_url: url })}
        />
        <ImagePicker
          label="Logo (optional)"
          value={data.logo_url}
          folder="logo"
          onChange={(url) => setData({ ...data, logo_url: url })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await updateSettings({
                org_name: data.org_name,
                tagline: data.tagline,
                hero_title: data.hero_title,
                hero_subtitle: data.hero_subtitle,
                donation_cta_label: data.donation_cta_label,
                donation_link: data.donation_link,
                about_short: data.about_short,
                about_long: data.about_long,
                vision: data.vision,
                mission_items: data.mission_items,
                values_items: data.values_items,
                address: data.address,
                phone: data.phone,
                email: data.email,
                hero_image_url: data.hero_image_url,
                logo_url: data.logo_url,
              } as any);
              toast.success("Saved");
            } catch (e: any) {
              toast.error("Save failed", { description: e?.message || "Unknown error" });
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <a className="btn btn-ghost" href="/" target="_blank" rel="noreferrer">
          Preview site
        </a>
      </div>

      {/* Add Admin Accounts */}
      <div className="card p-6">
        <div className="text-lg font-semibold">Tambah Admin / Editor</div>
        <p className="mt-2 text-sm text-muted">
          Buat akun admin baru untuk mengelola konten. (Hanya role <b>admin</b> yang bisa menambah akun.)
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Nama</label>
            <input
              className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={aName}
              onChange={(e) => setAName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Email</label>
            <input
              className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={aEmail}
              onChange={(e) => setAEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Password</label>
            <input
              className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              type="password"
              value={aPassword}
              onChange={(e) => setAPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Role</label>
            <select
              className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              value={aRole}
              onChange={(e) => setARole(e.target.value as any)}
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            disabled={busyAdmin}
            onClick={async () => {
              setBusyAdmin(true);
              try {
                await fetchJson("/api/admin/admins", {
                  method: "POST",
                  body: JSON.stringify({ name: aName, email: aEmail, password: aPassword, role: aRole }),
                });
                toast.success("Akun berhasil dibuat");
                setAName("");
                setAEmail("");
                setAPassword("");
                const d = await fetchJson<{ items: any[] }>("/api/admin/admins", { method: "GET" });
                setAdmins(d.items || []);
              } catch (e: any) {
                toast.error("Gagal membuat akun", { description: e?.message || "Unknown error" });
              } finally {
                setBusyAdmin(false);
              }
            }}
          >
            {busyAdmin ? "Membuat…" : "Buat Akun"}
          </button>
        </div>

        {admins.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-semibold">Admin yang terdaftar</div>
            <div className="mt-2 grid gap-2">
              {admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{a.name || "—"}</div>
                    <div className="text-muted truncate">{a.email}</div>
                  </div>
                  <div className="shrink-0 rounded-lg bg-black/5 px-2 py-1 text-xs font-semibold">{a.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
