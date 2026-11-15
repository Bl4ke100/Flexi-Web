"use client";

import { useEffect, useState } from "react";
import { adminRequest, type AdminAccount } from "@/lib/admin-client";
import { PERMISSIONS, type Permission } from "@/lib/content-schema";
import { TextField, primaryClass, secondaryClass } from "./AdminEditors";
import SearchField from "../SearchField";
import { matchesSearch } from "@/lib/search";

export const permissionLabels: Record<Permission, string> = {
  settings: "Website content & contact", fleet: "Vehicles & rates", deals: "Deals & banners", gallery: "Gallery & uploads",
};
function PermissionPicker({ value, onChange }: { value: string[]; onChange: (value: Permission[]) => void }) {
  return <div className="grid sm:grid-cols-2 gap-3">{PERMISSIONS.map(permission =>
    <label key={permission} className="flex items-center gap-3 text-sm p-3 rounded-lg border border-white/10"><input type="checkbox" className="accent-[#FF5500]" checked={value.includes(permission)} onChange={event => onChange(event.target.checked ? [...value as Permission[], permission] : value.filter(item => item !== permission) as Permission[])} />{permissionLabels[permission]}</label>)}</div>;
}
export default function TeamAdmin() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [query, setQuery] = useState("");
  const visibleAccounts = accounts.filter(account => matchesSearch(query, account.email, account.role.replaceAll("_", " "), account.active ? "active" : "disabled", ...account.permissions.map(permission => permissionLabels[permission as Permission])));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() { setAccounts(await adminRequest<AdminAccount[]>("/api/admin/accounts")); }
  useEffect(() => { refresh().catch(error => setMessage(error.message)); }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save access."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-9">
    <p className="text-neutral-400 text-sm leading-relaxed">Only the super admin can create administrators or change access. Permissions are enforced by the server and database. Disabling an admin blocks subsequent protected requests, including requests from an existing session.</p>
    {message && <p role="status" className="p-4 border border-white/15 rounded-lg text-sm">{message}</p>}
    <form className="p-5 sm:p-7 border border-white/10 rounded-xl space-y-5" onSubmit={event => { event.preventDefault(); void run(async () => {
      await adminRequest("/api/admin/accounts", { method: "POST", body: JSON.stringify({ email, password, permissions }) });
      setEmail(""); setPassword(""); setPermissions([]); setMessage("Administrator created. Share the initial password privately; they can change it after signing in.");
    }); }}>
      <h3 className="font-semibold text-lg">Add administrator</h3>
      <div className="grid sm:grid-cols-2 gap-5"><TextField label="Email" type="email" value={email} onChange={setEmail} /><TextField label="Initial password (at least 12 characters)" type="password" value={password} onChange={setPassword} /></div>
      <PermissionPicker value={permissions} onChange={setPermissions} />
      <button disabled={busy || password.length < 12} className={primaryClass}>Create administrator</button>
    </form>
    <SearchField label="Search administrators" value={query} onChange={setQuery} placeholder="Search email, role, status, or permission" />
    {!visibleAccounts.length && <p role="status" className="text-sm text-neutral-400">No administrators match your search.</p>}
    <div className="space-y-4">{visibleAccounts.map(account => <div key={account.id} className="p-5 sm:p-7 rounded-xl border border-white/10 space-y-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold break-all">{account.email}</h3><p className="text-xs text-neutral-500 mt-2">{account.role === "super_admin" ? "Super admin · full access" : "Administrator"}</p></div><span className={`text-xs ${account.active ? "text-[#FF5500]" : "text-neutral-500"}`}>{account.active ? "Active" : "Access disabled"}</span></div>
      {account.role === "admin" && <>
        <PermissionPicker value={account.permissions} onChange={next => setAccounts(prev => prev.map(item => item.id === account.id ? { ...item, permissions: next } : item))} />
        <div className="flex flex-wrap justify-between gap-5 items-center"><label className="text-sm flex gap-3 items-center"><input type="checkbox" className="accent-[#FF5500]" checked={account.active} onChange={event => setAccounts(prev => prev.map(item => item.id === account.id ? { ...item, active: event.target.checked } : item))} />Allow admin access</label>
          <button type="button" disabled={busy} className={secondaryClass} onClick={() => void run(async () => { await adminRequest("/api/admin/accounts", { method: "PATCH", body: JSON.stringify({ id: account.id, permissions: account.permissions, active: account.active }) }); setMessage("Access updated."); })}>Save access</button></div>
      </>}
    </div>)}</div>
  </div>;
}
