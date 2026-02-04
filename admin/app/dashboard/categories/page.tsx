"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  productCount?: number;
};

type CategoriesResponse = { categories: Category[] };

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch<CategoriesResponse>("/categories");
      setItems(data.categories);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load categories";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createCategory = async () => {
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await apiFetch("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, icon: icon || undefined }),
      });
      setName("");
      setDescription("");
      setIcon("");
      await load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async (id: string, patch: Partial<Category>) => {
    await apiFetch(`/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await apiFetch(`/categories/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-zinc-400">Create and manage product categories</p>
        </div>
        <button
          onClick={() => void load()}
          className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950/30 p-4">
        <div className="text-sm font-medium">New category</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
          />
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Icon (optional)"
            className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
          />
          <button
            onClick={() => void createCategory()}
            disabled={isSubmitting}
            className="h-10 rounded-lg bg-white text-zinc-950 text-sm font-medium disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="mt-3 min-h-20 w-full rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-white/20"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/50 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Slug</th>
              <th className="px-3 py-2 text-left font-medium">Active</th>
              <th className="px-3 py-2 text-left font-medium">Products</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td className="px-3 py-4 text-zinc-400" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-400" colSpan={5}>
                  No categories
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c._id} className="bg-zinc-900/20">
                  <td className="px-3 py-3">
                    <div className="font-medium text-zinc-100">{c.name}</div>
                    {c.description ? <div className="text-xs text-zinc-500">{c.description}</div> : null}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">{c.slug}</td>
                  <td className="px-3 py-3 text-zinc-300">{c.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-3 text-zinc-300">{c.productCount ?? "-"}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => {
                          const nextName = prompt("Category name", c.name);
                          if (!nextName) return;
                          void updateCategory(c._id, { name: nextName });
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => {
                          const nextDescription = prompt("Category description", c.description || "") ?? undefined;
                          void updateCategory(c._id, { description: nextDescription });
                        }}
                      >
                        Edit description
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => void updateCategory(c._id, { isActive: !c.isActive })}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15"
                        onClick={() => void deleteCategory(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
