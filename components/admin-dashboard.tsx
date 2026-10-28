"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import type { AdminRecord, AdminResource } from "@/lib/types";

type FieldKind = "text" | "textarea" | "number" | "email" | "tel" | "url" | "select" | "checkbox" | "image";
type FieldDefinition = { key: string; label: string; kind?: FieldKind; required?: boolean; hint?: string; options?: string[] };
type ResourceDefinition = { table: AdminResource; title: string; singular: string; fields: FieldDefinition[]; single?: boolean };

const resources: ResourceDefinition[] = [
  {
    table: "homepage_settings", title: "Homepage", singular: "Homepage settings", single: true,
    fields: [
      { key: "store_name", label: "Store name", required: true },
      { key: "tagline", label: "Short tagline", required: true },
      { key: "hero_title", label: "Hero headline", required: true },
      { key: "hero_description", label: "Hero description", kind: "textarea", required: true },
      { key: "cta_primary", label: "Primary button label", required: true },
      { key: "cta_secondary", label: "Secondary button label", required: true },
      { key: "currency_code", label: "Price currency", kind: "select", required: true, options: ["INR", "USD", "EUR", "GBP"] },
      { key: "enable_promotions", label: "Show promotional messages", kind: "checkbox" },
    ],
  },
  {
    table: "products", title: "Products", singular: "Product",
    fields: [
      { key: "name", label: "Product name", required: true },
      { key: "brand", label: "Brand" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price", kind: "number", required: true },
      { key: "condition", label: "Condition" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "image_url", label: "Product image", kind: "image" },
      { key: "featured", label: "Feature this product", kind: "checkbox" },
    ],
  },
  {
    table: "repair_services", title: "Repair services", singular: "Repair service",
    fields: [
      { key: "name", label: "Service name", required: true },
      { key: "price", label: "Starting price", kind: "number", required: true, hint: "Leave 0 to show no price." },
      { key: "duration", label: "Typical duration" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "icon", label: "Icon name or short label" },
      { key: "image_url", label: "Service image", kind: "image" },
      { key: "featured", label: "Feature this service", kind: "checkbox" },
    ],
  },
  {
    table: "members", title: "Team members", singular: "Team member",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "role", label: "Role", required: true },
      { key: "bio", label: "Short bio", kind: "textarea" },
      { key: "image_url", label: "Profile image", kind: "image" },
      { key: "featured", label: "Feature this team member", kind: "checkbox" },
    ],
  },
  {
    table: "contact_details", title: "Contact details", singular: "Contact details", single: true,
    fields: [
      { key: "phone", label: "Phone", kind: "tel" },
      { key: "email", label: "Email", kind: "email" },
      { key: "whatsapp", label: "WhatsApp number", kind: "tel" },
      { key: "address", label: "Address", kind: "textarea" },
      { key: "opening_hours", label: "Opening hours", kind: "textarea" },
      { key: "map_url", label: "Map link", kind: "url" },
      { key: "instagram_url", label: "Instagram link", kind: "url" },
      { key: "facebook_url", label: "Facebook link", kind: "url" },
    ],
  },
  {
    table: "privacy_policies", title: "Privacy policy", singular: "Privacy policy", single: true,
    fields: [
      { key: "title", label: "Page title", required: true },
      { key: "content", label: "Policy text", kind: "textarea", required: true },
    ],
  },
  {
    table: "terms", title: "Terms & conditions", singular: "Terms & conditions", single: true,
    fields: [
      { key: "title", label: "Page title", required: true },
      { key: "content", label: "Terms text", kind: "textarea", required: true },
    ],
  },
];

type FormValues = Record<string, string | number | boolean | null>;

export default function AdminDashboard({
  initialRows,
  initialError,
}: {
  initialRows: AdminRecord[];
  initialError: string;
}) {
  const router = useRouter();
  const [activeTable, setActiveTable] = useState<AdminResource>("products");
  const [rows, setRows] = useState<AdminRecord[]>(initialRows);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const selected = resources.find((resource) => resource.table === activeTable) ?? resources[1];

  const loadRows = useCallback(async (resource: ResourceDefinition) => {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/content?table=${encodeURIComponent(resource.table)}`);
    const result = await response.json() as { data?: AdminRecord[]; error?: string };
    if (!response.ok) {
      setError(`Could not load ${resource.title.toLowerCase()}: ${result.error ?? "Request failed."}`);
      setRows([]);
    } else {
      setRows(result.data ?? []);
    }
    setLoading(false);
  }, []);

  function startNew() {
    setEditing(null);
    setValues(Object.fromEntries(selected.fields.map((field) => [field.key, field.kind === "checkbox" ? false : field.kind === "number" ? 0 : field.kind === "select" ? field.options?.[0] ?? "" : ""])));
    setImageFile(null);
    setNotice("");
    setError("");
  }

  function startEdit(row: AdminRecord) {
    setEditing(row);
    setValues(Object.fromEntries(selected.fields.map((field) => [
      field.key,
      (row as Record<string, string | number | boolean | null>)[field.key] ??
        (field.kind === "checkbox" ? false : field.kind === "select" ? field.options?.[0] ?? "" : field.kind === "number" ? 0 : ""),
    ])));
    setImageFile(null);
    setNotice("");
    setError("");
  }

  async function signOut() {
    const response = await fetch("/api/admin/logout", { method: "POST" });
    if (!response.ok) {
      setError("Could not end the admin session. Please try again.");
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload: Record<string, string | number | boolean | null> = { ...values };
    if (activeTable === "homepage_settings" && !payload.currency_code) {
      payload.currency_code = "INR";
    }

    if (imageFile) {
      const formData = new FormData();
      formData.set("file", imageFile);
      formData.set("table", activeTable);
      const uploadResponse = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadResult = await uploadResponse.json() as { imageUrl?: string; error?: string };
      if (!uploadResponse.ok || !uploadResult.imageUrl) {
        setError(`Image upload failed: ${uploadResult.error ?? "Request failed."}`);
        setSaving(false);
        return;
      }
      payload.image_url = uploadResult.imageUrl;
    }

    const response = await fetch("/api/admin/content", {
      method: editing?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: activeTable, id: editing?.id, values: payload }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(`Could not save ${selected.singular.toLowerCase()}: ${result.error ?? "Request failed."}`);
      setSaving(false);
      return;
    }

    setNotice(`${selected.singular} saved.`);
    setEditing(null);
    setImageFile(null);
    setSaving(false);
    await loadRows(selected);
  }

  async function remove(row: AdminRecord) {
    if (!row.id || !window.confirm(`Delete this ${selected.singular.toLowerCase()}? This cannot be undone.`)) return;
    setError("");
    const response = await fetch(`/api/admin/content?table=${encodeURIComponent(activeTable)}&id=${encodeURIComponent(row.id)}`, { method: "DELETE" });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(`Could not delete ${selected.singular.toLowerCase()}: ${result.error ?? "Request failed."}`);
      return;
    }
    if (editing?.id === row.id) setEditing(null);
    setNotice(`${selected.singular} deleted.`);
    await loadRows(selected);
  }

  function changeResource(resource: ResourceDefinition) {
    setActiveTable(resource.table);
    setEditing(null);
    setValues({});
    setImageFile(null);
    setNotice("");
    setError("");
    void loadRows(resource);
  }

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-topbar clay-card">
          <Link className="brand" href="/">
            <Image className="brand-logo" src="/logo.png" alt="" width={43} height={43} /><span><strong>Mobile Gallary</strong><small>Store admin</small></span>
          </Link>
          <div className="admin-user"><span>PIN-secured session</span><button className="button button-soft" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
        </header>

        <div className="admin-heading">
          <div><p className="section-label">YOUR STORE, YOUR WAY</p><h1>Dashboard</h1><p>Update your storefront without touching code.</p></div>
          <Link className="button button-dark" href="/" target="_blank">View storefront ↗</Link>
        </div>

        <nav className="admin-tabs" aria-label="Manage store content">
          {resources.map((resource) => (
            <button key={resource.table} className={resource.table === activeTable ? "admin-tab active" : "admin-tab"} onClick={() => changeResource(resource)}>
              {resource.title}
            </button>
          ))}
        </nav>

        <section className="admin-workspace clay-card">
          <div className="workspace-header">
            <div><p className="section-label">CONTENT MANAGEMENT</p><h2>{selected.title}</h2></div>
            {!selected.single && <button className="button button-dark" onClick={startNew}><Plus size={16} /> Add {selected.singular.toLowerCase()}</button>}
          </div>
          {notice && <p className="notice notice-success" role="status">{notice}</p>}
          {error && <p className="notice notice-error" role="alert">{error}</p>}

          <div className={selected.single ? "admin-columns single" : "admin-columns"}>
            <div className="record-list">
              {loading ? <p className="empty-admin">Loading…</p> : rows.length === 0 ? (
                <div className="empty-admin">
                  <p>No {selected.title.toLowerCase()} yet.</p>
                  {selected.single && <button className="button button-dark" onClick={startNew}>Create {selected.singular.toLowerCase()}</button>}
                </div>
              ) : rows.map((row) => (
                <article className={`record-row ${editing?.id === row.id ? "selected" : ""}`} key={row.id ?? JSON.stringify(row)}>
                  <div className="record-text">
                    <strong>{String((row as Record<string, unknown>).name ?? (row as Record<string, unknown>).store_name ?? (row as Record<string, unknown>).title ?? selected.singular)}</strong>
                    <span>{String((row as Record<string, unknown>).role ?? (row as Record<string, unknown>).brand ?? (row as Record<string, unknown>).tagline ?? "")}</span>
                  </div>
                  <div className="record-actions">
                    <button className="text-button" onClick={() => startEdit(row)}>Edit</button>
                    <button className="icon-button" aria-label={`Delete ${selected.singular}`} onClick={() => void remove(row)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>

            {editing !== null || rows.length === 0 || !selected.single ? (
              <form className="editor-form" onSubmit={submit}>
                <div className="editor-title"><h3>{editing ? `Edit ${selected.singular.toLowerCase()}` : `New ${selected.singular.toLowerCase()}`}</h3>{editing && <button type="button" className="icon-button" onClick={() => setEditing(null)} aria-label="Close editor"><X size={17} /></button>}</div>
                <div className="editor-fields">
                  {selected.fields.map((field) => (
                    <label className={`field ${field.kind === "textarea" ? "field-wide" : ""}`} key={field.key}>
                      <span>{field.label}{field.required && <em> *</em>}</span>
                      {field.kind === "textarea" ? (
                        <textarea required={field.required} value={String(values[field.key] ?? "")} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))} rows={5} />
                      ) : field.kind === "checkbox" ? (
                        <input className="checkbox-input" type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.checked }))} />
                      ) : field.kind === "select" ? (
                        <select required={field.required} value={String(values[field.key] ?? "")} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))}>
                          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : field.kind === "image" ? (
                        <span className="upload-field">
                          <span><ImagePlus size={17} /> {imageFile?.name ?? (values[field.key] ? "Replace current image" : "Choose image")}</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} />
                          {field.hint && <small>{field.hint}</small>}
                          {values[field.key] && (
                            <button
                              className="remove-image"
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setValues((old) => ({ ...old, [field.key]: "" }));
                                setImageFile(null);
                              }}
                            >
                              Remove current image
                            </button>
                          )}
                        </span>
                      ) : (
                        <input
                          required={field.required}
                          type={field.kind === "number" || field.kind === "email" || field.kind === "tel" || field.kind === "url" ? field.kind : "text"}
                          min={field.kind === "number" ? 0 : undefined}
                          step={field.kind === "number" ? "0.01" : undefined}
                          value={String(values[field.key] ?? "")}
                          onChange={(event) => setValues((old) => ({ ...old, [field.key]: field.kind === "number" ? Number(event.target.value) : event.target.value }))}
                        />
                      )}
                      {field.hint && field.kind !== "image" && <small>{field.hint}</small>}
                    </label>
                  ))}
                </div>
                <div className="editor-actions">
                  {editing?.id && <button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Cancel</button>}
                  <button type="submit" className="button button-dark" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save changes"}</button>
                </div>
              </form>
            ) : null}
          </div>
        </section>
        <p className="admin-footer-note">Content and images are saved to your Supabase project.</p>
      </div>
    </main>
  );
}
