"use client";

import React, { useState } from "react";
import {
  CircleHelp,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send,
  X,
  CheckCircle2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function HelpSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("bug");
  const [reportText, setReportText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Support Requests Modal
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const faqs = [
    {
      q: "Bagaimana cara membuat spot pancing menjadi rahasia (privat)?",
      a: "Saat membuat postingan tangkapan atau menandai spot di peta, aktifkan tombol 'Sembunyikan Koordinat Akurat' atau pilih visibilitas 'Hanya Pengikut yang Disetujui'.",
    },
    {
      q: "Bagaimana cara mendapatkan lencana Nelayan/Angler Terverifikasi?",
      a: "Lencana diberikan kepada anggota komunitas yang aktif membagikan laporan tangkapan asli, menjunjung tinggi etika Catch & Release, dan mematuhi aturan konservasi perairan.",
    },
    {
      q: "Apa yang harus saya lakukan jika melihat postingan racun/setrum ikan?",
      a: "Klik ikon titik tiga (...) di sudut postingan tersebut, lalu pilih 'Laporkan Kiriman' > 'Pelanggaran Penangkapan Ilegal'. Tim moderator kami akan menindaklanjutinya dalam 1x24 jam.",
    },
    {
      q: "Bagaimana cara mengganti nomor handphone atau email akun?",
      a: "Buka Pengaturan Lainnya > Keamanan Akun atau edit informasi profil Anda melalui tab Edit Profil di halaman profil utama.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setIsReportModalOpen(false);
      setReportText("");
      showToast("Laporan berhasil dikirim! Tim kami akan meninjaunya.");
    }, 1000);
  };

  const handleClearCache = () => {
    showToast("Cache aplikasi dan thumbnail berhasil dibersihkan.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Help Center */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Cari topik bantuan, tutorial, atau panduan spot..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-2xl border-slate-200/80 bg-white pl-11 pr-4 text-xs sm:text-sm shadow-sm placeholder:text-slate-400"
        />
      </div>

      {/* Main Help Options */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* Report a Problem */}
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Laporkan Masalah</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Kirim masukan jika ada fitur aplikasi yang rusak atau error
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Support Requests */}
        <button
          type="button"
          onClick={() => setIsRequestsModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CircleHelp size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Permintaan Dukungan</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Lihat riwayat tiket laporan dan status investigasi moderator
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Privacy & Safety Help */}
        <div className="flex w-full items-center justify-between p-5 text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ShieldCheck size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Pusat Keamanan Komunitas</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Panduan keamanan data lokasi memancing dan perlindungan privasi
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">Aktif</span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Pertanyaan Umum (FAQ)
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {filteredFaqs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Tidak menemukan hasil untuk "{searchQuery}". Coba kata kunci lain.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div key={idx} className="transition-colors hover:bg-slate-50/60">
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-medium text-slate-800"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 ${
                    expandedFaq === idx ? "rotate-180 text-slate-700" : ""
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-500 leading-relaxed bg-slate-50/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* App Info & Cache */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Tentang Fishing Community</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Versi 1.4.2-beta · Dibuat untuk para pecinta mancing 🎣
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="rounded-full border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Trash2 size={14} className="mr-1.5 text-slate-500" />
            Bersihkan Cache
          </Button>
        </div>
      </div>

      {/* ================= MODAL: REPORT A PROBLEM ================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Laporkan Masalah</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Jenis Masalah</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "bug", label: "Bug / Error Tampilan" },
                    { id: "upload", label: "Gagal Unggah Media" },
                    { id: "gps", label: "Masalah Peta & GPS" },
                    { id: "account", label: "Akun & Keamanan" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setReportCategory(cat.id)}
                      className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                        reportCategory === cat.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Rincian Masalah</label>
                <Textarea
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Jelaskan secara singkat apa yang terjadi dan langkah-langkah untuk memperbaikinya..."
                  className="mt-1 rounded-2xl border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 rounded-full border-slate-200 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 rounded-full bg-slate-900 text-xs text-white hover:bg-slate-800"
                >
                  {isSubmittingReport ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <Send size={14} className="mr-1.5" /> Kirim Laporan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUPPORT REQUESTS ================= */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CircleHelp size={20} className="text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Permintaan Dukungan</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRequestsModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Tidak Ada Laporan Aktif
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                Anda tidak memiliki tiket dukungan atau laporan terbuka saat ini. Jika Anda menemukan bug,
                silakan gunakan tombol Laporkan Masalah.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsRequestsModalOpen(false)}
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
