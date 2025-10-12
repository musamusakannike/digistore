"use client";

import React from "react";
import { useEffect, useState, useMemo } from "react";
import {
  getAdminUsers,
  suspendUser,
  unSuspendUser,
  deleteUser,
} from "@/lib/endpoints";
import type { User, Paginated } from "@/lib/types";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<
    Paginated<User>["pagination"] | null
  >(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useMemo(
    () => async () => {
      try {
        setLoading(true);
        setError(null);
        const { users, pagination } = await getAdminUsers({ 
          search: debouncedSearch, 
          page 
        });
        setUsers(users);
        setPagination(pagination);
      } catch (e) {
        setError((e as Error).message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, page]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (user: User) => {
    try {
      if (user.isActive) {
        await suspendUser(user._id);
      } else {
        await unSuspendUser(user._id);
      }
      await fetchUsers();
    } catch (e) {
      setError((e as Error).message || "Failed to suspend user");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (e) {
        setError((e as Error).message || "Failed to delete user");
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="pt-32 pb-12 px-6">Loading users...</div>;
  }
  
  if (error && users.length === 0) {
    return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;
  }

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all users on the platform.</p>

        <div className="mt-8">
          <div className="flex justify-between items-center">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by name or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {loading && search !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white rounded-2xl shadow">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : user.role === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleSuspend(user)}
                      >
                        {user.isActive ? "Suspend" : "Unsuspend"}
                      </button>
                      <button
                        className="ml-4 text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination?.page || 1} of {pagination?.pages || 1}
            </span>
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= (pagination?.pages || 0)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}