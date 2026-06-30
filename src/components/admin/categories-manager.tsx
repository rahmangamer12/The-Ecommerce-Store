"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Database } from "lucide-react";
import type { Category } from "@/types";
import { Input, Textarea, Label } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { CategoryIcon } from "@/components/category-icon";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} from "@/lib/category-actions";

// Icons the storefront knows how to render (see category-icon.tsx).
const ICONS = [
  "Cpu",
  "Headphones",
  "Lamp",
  "Shirt",
  "Watch",
  "Sparkles",
  "Mountain",
  "HeartPulse",
  "Tag",
];

type Cat = Category & { productCount: number };

const EMPTY = { name: "", description: "", image: "", icon: "Tag" };

export function CategoriesManager({
  categories,
  inDb,
}: {
  categories: Cat[];
  inDb: boolean;
}) {
  const router = useRouter();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openAdd() {
    setEditingSlug(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(cat: Cat) {
    setEditingSlug(cat.slug);
    setForm({
      name: cat.name,
      description: cat.description,
      image: cat.image,
      icon: cat.icon || "Tag",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingSlug(null);
    setForm(EMPTY);
  }

  async function handleSeed() {
    setBusy(true);
    try {
      const res = await seedCategories();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Default categories loaded — you can now edit or remove them.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) {
      toast.error("Add an image (upload one or paste a URL).");
      return;
    }
    setBusy(true);
    try {
      const res = editingSlug
        ? await updateCategory({ slug: editingSlug, ...form })
        : await createCategory(form);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editingSlug ? "Category updated" : "Category added", {
        description: form.name,
      });
      closeForm();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(cat: Cat) {
    if (!confirm(`Remove the "${cat.name}" category?`)) return;
    setBusy(true);
    try {
      const res = await deleteCategory(cat.slug);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${cat.name}" removed`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Seed banner — only when the DB has no categories yet */}
      {!inDb && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-gold-strong" />
            <div>
              <p className="text-sm font-semibold">
                Load your categories into the database
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Click once to copy the default categories into your store. After
                that you can add, edit and remove any of them.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            disabled={busy}
            className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
          >
            {busy ? "Loading…" : "Load default categories"}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-gold hover:text-white"
        >
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {/* Add / edit form */}
      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {editingSlug ? "Edit category" : "New category"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Home & Living"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                required
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A short line shown under the category."
              />
            </div>
            <div>
              <Label>Icon</Label>
              <select
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-gold focus-visible:outline-none"
              >
                {ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Preview:</span>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-paper-2 text-gold-strong">
                  <CategoryIcon name={form.icon} className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Image</Label>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                {form.image && (
                  <div className="relative h-20 w-28 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={form.image}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-paper"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <ImageUploader onUploaded={(url) => set("image", url)} />
              </div>
              <Input
                className="mt-3"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="…or paste an image URL"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-gold px-7 py-3 text-sm font-medium text-white shadow-gold transition-colors hover:bg-gold-strong disabled:opacity-60"
            >
              {busy ? "Saving…" : editingSlug ? "Save changes" : "Add category"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full border border-border px-7 py-3 text-sm font-medium hover:border-gold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-2">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CategoryIcon name={cat.icon} className="h-4 w-4 text-gold-strong" />
                <p className="truncate text-sm font-semibold">{cat.name}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                onClick={() => openEdit(cat)}
                disabled={busy}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-gold disabled:opacity-50"
                aria-label={`Edit ${cat.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                disabled={busy}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-danger hover:border-danger hover:bg-danger/10 disabled:opacity-50"
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!inDb && (
        <p className="text-center text-xs text-muted">
          You&apos;re viewing the built-in defaults. Load them into the database
          above to start editing and removing categories.
        </p>
      )}
    </div>
  );
}
