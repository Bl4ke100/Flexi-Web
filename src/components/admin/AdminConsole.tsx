"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ExternalLink, LogOut, ShieldCheck, LockKeyhole, Save, Settings, Car, Image, Users, UserRound } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { adminRequest, type AdminAccount } from "@/lib/admin-client";
import { DEFAULT_CONTENT, type PublicContent } from "@/data/siteContent";
import { type Permission, settingsSchema, fleetSchema, dealsSchema } from "@/lib/content-schema";
import { SettingsEditor, DealsEditor, TextField, inputClass, primaryClass, secondaryClass } from "./AdminEditors";
import FleetEditor from "./FleetEditor";
import GalleryAdmin from "./GalleryAdmin";
import TeamAdmin, { permissionLabels } from "./TeamAdmin";

type Tab = Permission | "team" | "account";
const icons = { settings: Settings, fleet: Car, deals: Image, gallery: Image, team: Users, account: UserRound };

export default function AdminConsole() {
  const client = getSupabaseBrowser();
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingImageUploads, setPendingImageUploads] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [tab, setTab] = useState<Tab>("account");
  const [content, setContent] = useState<PublicContent>(DEFAULT_CONTENT);
  const [contentReady, setContentReady] = useState(false);
  const [dirtySections, setDirtySections] = useState<string[]>([]);
  const dirty = dirtySections.length > 0;
  const markDirty = (key: string) => setDirtySections(previous => [...new Set([...previous, key])]);

  useEffect(() => {
    if (!client) { setChecking(false); return; }
    const resetRequested = new URLSearchParams(window.location.search).get("reset") === "1";
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session && resetRequested) setRecovery(true);
      setChecking(false);
    });
    const { data } = client.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (!next) { setAccount(null); setContentReady(false); }
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setChecking(true);
    adminRequest<AdminAccount>("/api/admin/me").then(async verified => {
      const response = await fetch("/api/content", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load website content. Check the database setup before editing.");
      const loaded: PublicContent = await response.json();
      if (!loaded.connected) throw new Error("Complete the Supabase database setup before editing.");
      if (cancelled) return;
      setAccount(verified); setContent(loaded); setContentReady(true); setDirtySections([]);
      setTab(verified.role === "super_admin" ? "settings" : (verified.permissions[0] as Tab || "account"));
    }).catch(error => { if (!cancelled) { setMessage(error.message); setAccount(null); } })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [session?.user.id, client]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to complete the action."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    await client?.auth.signOut(); setSession(null); setAccount(null); setPassword(""); setCurrentPassword(""); setNewPassword("");
  }
  async function saveSection(key: "settings" | "fleet" | "deals", data: PublicContent[typeof key]) {
    const schema = { settings: settingsSchema, fleet: fleetSchema, deals: dealsSchema }[key];
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new Error(parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).slice(0, 3).join(" "));
    await adminRequest("/api/admin/content", { method: "PUT", body: JSON.stringify({ key, data: parsed.data }) });
    // Keep drafts in other sections until each has been saved.
    setDirtySections(previous => previous.filter(section => section !== key));
    setMessage("Saved. Refresh the website to see the published changes.");
  }
  async function save() {
    if (tab !== "settings" && tab !== "deals") return;
    if (pendingImageUploads) throw new Error("Wait for image uploads to finish before saving.");
    await saveSection(tab, content[tab]);
  }
  async function publishFleet(fleet: PublicContent["fleet"]) {
    setBusy(true); setMessage("");
    try {
      await saveSection("fleet", fleet);
      setContent(previous => ({ ...previous, fleet }));
    } finally { setBusy(false); }
  }
  const can = (permission: Permission) => account?.role === "super_admin" || account?.permissions.includes(permission);
  const tabs: Tab[] = (["settings", "fleet", "deals", "gallery"] as Permission[]).filter(can);
  if (account?.role === "super_admin") tabs.push("team");
  tabs.push("account");
  const labels: Record<Tab, string> = { ...permissionLabels, team: "Administrators", account: "Your account" };

  if (!account || recovery) return (
    <main className="min-h-screen bg-[#050505] grid lg:grid-cols-2 text-white">
      <section className="hidden lg:flex flex-col justify-between p-16 border-r border-white/10 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,85,0,0.09),_transparent_65%)]">
        <a href="/" className="font-display font-extrabold tracking-tight text-xl">FLEXI <span className="text-[#FF5500]">RENTAL</span></a>
        <div className="max-w-lg"><p className="font-mono text-xs tracking-[0.2em] uppercase text-[#FF5500] mb-5">Website management</p><h1 className="font-display font-bold text-6xl leading-[1.05] tracking-tight">Keep your website<br />ready for the<br /><span className="text-[#FF5500]">next journey.</span></h1><p className="text-neutral-400 mt-8 leading-relaxed">Manage vehicles, publish offers, review customer photos, and give your team the access they need.</p></div>
        <p className="text-xs text-neutral-600">FLEXI RENTAL · ADMINISTRATION</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12 py-16"><div className="w-full max-w-md space-y-7">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Back to website</a>
        <div className="w-12 h-12 rounded-xl border border-[#FF5500]/30 bg-[#FF5500]/10 flex items-center justify-center"><LockKeyhole className="w-5 h-5 text-[#FF5500]" /></div>
        <div><h2 className="font-display font-bold text-3xl">{recovery ? "Set a new password" : "Welcome back"}</h2><p className="text-neutral-400 text-sm mt-3">{recovery ? "Choose a password with at least 12 characters." : "Sign in with your admin email and password."}</p></div>
        {!client && <div className="p-5 rounded-xl border border-[#FF5500]/30 bg-[#FF5500]/5 text-sm text-neutral-300 leading-relaxed"><strong className="text-white block mb-2">Supabase setup required</strong>The management panel is ready to connect. Follow SUPABASE_SETUP.md in the project, add the environment variables, and restart the website. Admin access stays disabled until it is connected.</div>}
        {message && <p role="status" className="text-sm p-4 border border-white/15 rounded-lg text-neutral-300">{message}</p>}
        {checking ? <p role="status" className="text-sm text-neutral-400">Checking your access...</p> : recovery ?
          <form className="space-y-5" onSubmit={event => { event.preventDefault(); void run(async () => {
            if (!client || newPassword.length < 12) throw new Error("Choose a password with at least 12 characters.");
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) throw new Error("Unable to reset the password. Request a new reset link and try again.");
            await signOut(); setRecovery(false); setMessage("Password updated. Sign in with your new password.");
          }); }}><TextField label="New password" type="password" value={newPassword} onChange={setNewPassword} /><button disabled={busy || newPassword.length < 12} className={`${primaryClass} w-full`}>Update password</button></form> :
          <form className="space-y-5" onSubmit={event => { event.preventDefault(); void run(async () => {
            if (!client) throw new Error("Connect Supabase before signing in.");
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw new Error("Unable to sign in. Check your details or try again later.");
            setPassword("");
          }); }}>
            <label className="block space-y-2"><span className="text-sm text-neutral-400">Email</span><input autoComplete="username" type="email" required value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></label>
            <label className="block space-y-2"><span className="text-sm text-neutral-400">Password</span><input autoComplete="current-password" type="password" required value={password} onChange={event => setPassword(event.target.value)} className={inputClass} /></label>
            <button disabled={!client || busy} className={`${primaryClass} w-full`}>{busy ? "Signing in..." : "Sign in"}</button>
            <button type="button" disabled={!client || busy} className="text-sm text-neutral-400 hover:text-[#FF5500] disabled:opacity-40" onClick={() => void run(async () => {
              if (!client || !email.trim()) throw new Error("Enter your admin email first.");
              const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin?reset=1` });
              if (error) throw new Error("Unable to request a reset link. Please try again later.");
              setMessage("If that email has an account, a reset link will arrive shortly.");
            })}>Forgot your password?</button>
            {session && <button type="button" className="block text-sm text-neutral-400" onClick={() => void signOut()}>Sign out of the current session</button>}
          </form>}
        <p className="text-xs text-neutral-600 leading-relaxed">Access is restricted to approved administrators. There is no public admin registration.</p>
      </div></section>
    </main>
  );

  return <main className="min-h-screen bg-[#070707] text-white">
    <header className="border-b border-white/10 px-5 sm:px-9 py-5 flex flex-wrap justify-between gap-5 items-center">
      <div className="flex gap-3 items-center"><ShieldCheck className="text-[#FF5500] w-7 h-7" /><div><a href="/" className="font-semibold">Flexi Rental</a><p className="text-xs text-neutral-500 mt-1">Website management</p></div></div>
      <div className="flex gap-3 items-center"><a href="/" target="_blank" rel="noopener noreferrer" className={secondaryClass}><ExternalLink className="w-4 h-4" />View website</a><button type="button" className={secondaryClass} onClick={() => { if (!dirty || window.confirm("Leave with unsaved changes?")) void signOut(); }}><LogOut className="w-4 h-4" />Sign out</button></div>
    </header>
    <div className="max-w-[1500px] mx-auto lg:grid lg:grid-cols-[260px_1fr] min-h-[calc(100vh-90px)]">
      <aside className="p-5 sm:p-7 lg:border-r border-b lg:border-b-0 border-white/10">
        <p className="text-xs uppercase tracking-[0.16em] text-[#FF5500] mb-3">{account.role === "super_admin" ? "Super admin" : "Administrator"}</p><p className="text-xs text-neutral-500 break-all mb-7">{account.email}</p>
        <nav aria-label="Admin sections" className="flex lg:flex-col flex-wrap gap-2">{tabs.map(item => { const Icon = icons[item]; return <button key={item} type="button" onClick={() => { setTab(item); setMessage(""); }} className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-lg text-sm transition-colors ${tab === item ? "bg-[#FF5500]/10 text-[#FF5500]" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}><Icon className="w-4 h-4 shrink-0" />{labels[item]}</button>; })}</nav>
      </aside>
      <section className="p-5 sm:p-9 lg:p-12 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-9"><div><h1 className="font-display font-bold text-3xl tracking-tight">{labels[tab]}</h1><p className="text-sm text-neutral-500 mt-2">{tab === "fleet" ? "Manage the vehicles shown on your website." : ["settings", "deals"].includes(tab) ? "Edit your content below, then save to publish." : "Manage your website with the access assigned to you."}</p></div>
          {["settings", "deals"].includes(tab) && <button type="button" disabled={busy || !!pendingImageUploads || !contentReady} className={primaryClass} onClick={() => void run(save)}><Save className="w-4 h-4" />{pendingImageUploads ? "Uploading images..." : busy ? "Saving..." : "Save changes"}</button>}
        </div>
        {message && <p role="status" className="p-4 mb-7 rounded-lg border border-white/15 text-sm">{message}</p>}
        <div className="border border-white/10 bg-[#0D0D0D] rounded-2xl p-5 sm:p-7 lg:p-8">
          {tab === "settings" && <SettingsEditor settings={content.settings} onBusyChange={uploading => setPendingImageUploads(count => Math.max(0, count + (uploading ? 1 : -1)))} onChange={update => { setContent(current => ({ ...current, settings: typeof update === "function" ? update(current.settings) : update })); markDirty("settings"); }} />}
          {tab === "fleet" && <FleetEditor fleet={content.fleet} onSave={publishFleet} />}
          {tab === "deals" && <DealsEditor deals={content.deals} onChange={deals => { setContent({ ...content, deals }); markDirty("deals"); }} />}
          {tab === "gallery" && <GalleryAdmin />}
          {tab === "team" && account.role === "super_admin" && <TeamAdmin />}
          {tab === "account" && <form className="max-w-lg space-y-5" onSubmit={event => { event.preventDefault(); void run(async () => {
            if (!client || newPassword.length < 12) throw new Error("Choose a password with at least 12 characters.");
            const { error: verifyError } = await client.auth.signInWithPassword({ email: account.email, password: currentPassword });
            if (verifyError) throw new Error("Your current password is incorrect.");
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) throw new Error("Unable to change the password. Check the password requirements and try again.");
            setCurrentPassword(""); setNewPassword(""); setMessage("Your password has been changed.");
          }); }}><p className="text-sm text-neutral-400">Change your own password. Use at least 12 characters and keep it private.</p><TextField label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} /><TextField label="New password" type="password" value={newPassword} onChange={setNewPassword} /><button disabled={busy || newPassword.length < 12} className={primaryClass}>Update password</button></form>}
        </div>
      </section>
    </div>
  </main>;
}
