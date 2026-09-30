"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink,
  Fish,
  Info,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountStatusSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Hero Status Card (Meta / Threads Style) */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={32} strokeWidth={2.2} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Good Standing · Kondisi Prima
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                Akun Anda dalam Kondisi Baik
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Terima kasih telah menjaga Fishing Community tetap aman, ramah lingkungan, dan saling
                menghargai sesama pemancing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Diagnostic Checklist */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Status Pemeriksaan Fitur & Konten
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* 1. Removed Content */}
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">Konten yang Dihapus</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  0 Pelanggaran
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                Anda belum memposting kiriman atau spot pancing yang melanggar Panduan Komunitas.
                Konten Anda aman dan tidak ada catatan penalti.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Features You Can't Use */}
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">Fitur yang Dibatasi</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  Akses Penuh
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                Saat ini Anda memiliki akses penuh ke seluruh fitur aplikasi, termasuk berbagi tangkapan,
                membuat event mancing bersama, dan pin koordinat spot GPS.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Recommendation Eligibility */}
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">Kelayakan Rekomendasi</p>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                  Memenuhi Syarat
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                Postingan dan profil Anda memenuhi standar untuk ditampilkan pada tab Jelajahi (Explore),
                rekomendasi spot populer, dan algoritma penemuan angler setempat.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Verified Angler Status */}
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">Lencana Keanggotaan Angler</p>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  Active Angler
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                Akun Anda berstatus anggota aktif. Terus bagikan spot akurat dan etika konservasi untuk
                membuka lencana "Master Angler Verified".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Accordion */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Informasi & Kebijakan
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {[
          {
            title: "Apa yang terjadi jika ada pelanggaran?",
            content:
              "Jika konten Anda melanggar aturan, kami akan menghapusnya dan memberi tahu Anda alasannya. Pelanggaran berulang dapat menyebabkan pembatasan sementara pada fitur membuat spot atau berinteraksi.",
          },
          {
            title: "Pedoman Etika Penangkapan Ikan (Catch & Release)",
            content:
              "Kami mendukung pemancingan yang bertanggung jawab. Dilarang memposting penggunaan alat tangkap ilegal (bom, racun, setrum) atau perusakan terumbu karang.",
          },
          {
            title: "Bagaimana cara mengajukan banding?",
            content:
              "Jika Anda merasa konten Anda dihapus secara keliru oleh sistem otomatis, Anda dapat meminta peninjauan ulang langsung dari detail pelanggaran atau melalui menu Bantuan.",
          },
        ].map((item, idx) => (
          <div key={idx} className="transition-colors hover:bg-slate-50/60">
            <button
              type="button"
              onClick={() => toggleFaq(idx)}
              className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-medium text-slate-800"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${
                  expandedFaq === idx ? "rotate-180 text-slate-700" : ""
                }`}
              />
            </button>
            {expandedFaq === idx && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-500 leading-relaxed bg-slate-50/40">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
