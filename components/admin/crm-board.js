"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { STAGES, remarketingMessage } from "@/lib/crm";
import { parseJsonResponse } from "@/lib/api-client";
import CrmDetailPanel from "@/components/admin/crm-detail-panel";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

function Card({ order, onDragStart, onOpen, onQuickStatus, storeName }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      onClick={() => onOpen(order)}
      className="cursor-pointer rounded-2xl bg-white p-3 shadow-sm ring-1 ring-brand-blush-100 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-brand-deep-900 line-clamp-1">
          {order.customerName}
        </p>
        <a
          href={waLink(order.customerPhone, remarketingMessage(storeName, order))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
          title="Escribir por WhatsApp"
        >
          <svg viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-white">
            <path d="M16.004 2.667c-7.363 0-13.337 5.973-13.337 13.336 0 2.353.615 4.646 1.782 6.666l-1.892 6.908 7.077-1.856a13.29 13.29 0 0 0 6.37 1.622h.006c7.362 0 13.336-5.974 13.336-13.34 0-3.563-1.388-6.914-3.908-9.434a13.253 13.253 0 0 0-9.434-3.902Z" />
          </svg>
        </a>
      </div>
      <p className="mt-1 text-xs text-brand-deep-900/50">{timeAgo(order.createdAt)}</p>
      <p className="mt-2 text-sm font-bold text-brand-plum-700">{money(order.total)}</p>
      <p className="text-xs text-brand-deep-900/50">
        {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
      </p>
      {order.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {order.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-pink-200 px-2 py-0.5 text-[10px] font-medium text-brand-deep-900"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <select
        value={order.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onQuickStatus(order.id, e.target.value)}
        className="mt-2 w-full rounded-lg border border-brand-blush-100 bg-brand-blush-50 px-2 py-1 text-xs outline-none"
      >
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CrmBoard({ initialOrders, storeName }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const columns = useMemo(() => {
    const byStage = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    for (const o of orders) {
      (byStage[o.status] || byStage.nuevo).push(o);
    }
    return byStage;
  }, [orders]);

  async function setStatus(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await parseJsonResponse(res);
    } catch {
      // Revert on failure by refetching wouldn't hurt, but keep it simple:
      // a manual refresh will resync if this rare case happens.
    }
  }

  function handleDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDrop(e, stageKey) {
    e.preventDefault();
    setDragOverStage(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) setStatus(id, stageKey);
  }

  const selectedOrder = orders.find((o) => o.id === selected) || null;

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = columns[stage.key] || [];
          const stageTotal = items.reduce((s, o) => s + o.total, 0);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.key);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.key)}
              className={`flex w-72 shrink-0 flex-col rounded-2xl p-3 transition-colors ${
                dragOverStage === stage.key ? "bg-brand-pink-200/40" : "bg-brand-blush-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                  <h3 className="text-sm font-bold text-brand-deep-900">{stage.label}</h3>
                  <span className="rounded-full bg-white px-1.5 text-xs text-brand-deep-900/50">
                    {items.length}
                  </span>
                </div>
              </div>
              {items.length > 0 && (
                <p className="mb-2 px-1 text-xs font-medium text-brand-deep-900/50">
                  {money(stageTotal)}
                </p>
              )}
              <div className="flex flex-col gap-2">
                {items.map((order) => (
                  <Card
                    key={order.id}
                    order={order}
                    storeName={storeName}
                    onDragStart={handleDragStart}
                    onOpen={(o) => setSelected(o.id)}
                    onQuickStatus={setStatus}
                  />
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-brand-deep-900/30">
                    Sin pedidos aquí
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <CrmDetailPanel
          order={selectedOrder}
          storeName={storeName}
          onClose={() => setSelected(null)}
          onUpdate={(updated) =>
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
          }
          onDelete={(id) => {
            setOrders((prev) => prev.filter((o) => o.id !== id));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
