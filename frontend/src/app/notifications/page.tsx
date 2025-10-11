"use client";
import { useCallback, useEffect, useState } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotificationApi, deleteAllReadNotifications } from "@/lib/endpoints";
import type { Notification } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      const data = await getNotifications({ page: 1, limit: 50 });
      setItems(data.notifications || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {
      alert((e as Error).message || "Failed to mark as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      alert((e as Error).message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setItems(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      alert((e as Error).message || "Failed to delete notification");
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllReadNotifications();
      setItems(prev => prev.filter(n => !n.read));
    } catch (e) {
      alert((e as Error).message || "Failed to delete read notifications");
    }
  };

  if (loading) return <div className="pt-32 pb-12 px-6">Loading notifications...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <div className="flex gap-2">
          <button onClick={handleMarkAll} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Mark all as read</button>
          <button onClick={handleDeleteAllRead} className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete read</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">No notifications.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow divide-y">
          {items.map((n) => (
            <div key={n._id} className={`flex items-start justify-between gap-4 p-4 ${n.read ? 'bg-white' : 'bg-maroon-50/30'}`}>
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-500">{n.type}</div>
                <div className="font-semibold text-gray-900">{n.title}</div>
                <div className="text-gray-700">{n.message}</div>
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <button onClick={() => handleMarkRead(n._id)} className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Mark read</button>
                )}
                <button onClick={() => handleDelete(n._id)} className="px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
