"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    product: {
      _id: string;
      title: string;
      slug: string;
      thumbnail?: string;
      files: Array<{ _id: string; name: string; size: number; type: string; url: string }>;
    };
    quantity: number;
    price: number;
  }>;
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiFetch<{ order: Order }>(`/orders/${id}`, { method: "GET" });
        if (!mounted) return;
        setOrder(res.order);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load order");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const downloadFile = async (productId: string, fileId: string) => {
    try {
      setDownloading(fileId);
      const res = await apiFetch<{ file: { url: string; name: string } }>(`/upload/${productId}/download/${fileId}`, {
        method: "GET",
      });
      window.open(res.file.url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/orders" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Order Details</h1>
        </div>

        {isLoading ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading order...</span>
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : !order ? null : (
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-white font-bold text-xl">{order.orderNumber}</div>
                  <div className="text-white/40 text-sm mt-1">{new Date(order.createdAt).toLocaleString("en-NG")}</div>
                  <div className="text-white/50 text-sm mt-2">
                    Payment: <span className="text-white">{order.paymentStatus}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-sm">Total</div>
                  <div className="text-white font-bold text-2xl">{formatNaira(order.totalAmount)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.product._id} className="bg-[#0a0a0a] border border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 bg-white/5 border border-white/10 overflow-hidden shrink-0">
                      {item.product.thumbnail ? (
                        <Image src={item.product.thumbnail} alt={item.product.title} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product.slug}`} className="text-white font-bold hover:underline">
                        {item.product.title}
                      </Link>
                      <div className="text-white/50 text-sm mt-1">Qty: {item.quantity}</div>
                      <div className="text-white/50 text-sm">Item price: {formatNaira(item.price)}</div>

                      <div className="mt-4">
                        <div className="text-white/60 text-sm font-medium mb-3">Downloads</div>
                        {item.product.files?.length ? (
                          <div className="grid gap-2">
                            {item.product.files.map((file) => (
                              <button
                                key={file._id}
                                onClick={() => downloadFile(item.product._id, file._id)}
                                disabled={downloading === file._id}
                                className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 px-4 py-3 hover:bg-white hover:text-black transition-colors"
                              >
                                <div className="min-w-0 text-left">
                                  <div className="font-semibold truncate">{file.name}</div>
                                  <div className="text-xs opacity-70">{Math.round((file.size || 0) / 1024)} KB</div>
                                </div>
                                {downloading === file._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-white/40 text-sm">No files attached to this product.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
