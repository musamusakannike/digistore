"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchEnvelope, type Pagination, apiFetch } from "../../lib/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: string;
};

type UsersResponse = { users: User[] };

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");

  const query = useMemo(() => {
    return buildQuery({
      page: String(page),
      limit: "20",
      search,
      role,
      isActive,
    });
  }, [isActive, page, role, search]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetchEnvelope<UsersResponse>(`/admin/users${query}`);
      setItems(res.data.users);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = useCallback(
    async (userId: string, patch: { isActive?: boolean; isSuspended?: boolean; suspensionReason?: string }) => {
    await apiFetch(`/admin/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
    },
    [load],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
    await load();
    },
    [load],
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage buyers and sellers</p>
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

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name or email"
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20 md:col-span-2"
        />
        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
        >
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={isActive}
          onChange={(e) => {
            setPage(1);
            setIsActive(e.target.value);
          }}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
        >
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/50 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Role</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
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
                  No users
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u._id} className="bg-zinc-900/20">
                  <td className="px-3 py-3">
                    <div className="font-medium text-zinc-100">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-zinc-500">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-3 py-3 text-zinc-200">{u.email}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-300">{u.isActive ? "Active" : "Inactive"}</span>
                      {u.isSuspended ? (
                        <span className="text-xs text-red-300">Suspended</span>
                      ) : (
                        <span className="text-xs text-zinc-500">Not suspended</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => void updateStatus(u._id, { isActive: !u.isActive })}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => {
                          if (u.isSuspended) {
                            void updateStatus(u._id, { isSuspended: false });
                          } else {
                            const reason = prompt("Suspension reason (optional)") || undefined;
                            void updateStatus(u._id, { isSuspended: true, suspensionReason: reason });
                          }
                        }}
                      >
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15"
                        onClick={() => void deleteUser(u._id)}
                        disabled={u.role === "admin"}
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

      <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
        <div>
          {pagination ? (
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            disabled={!pagination || pagination.page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
