"use client";

import React, { useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  Laptop,
  Image,
  Globe,
  Ruler,
  Shield,
  KeyRound,
  Smartphone,
  Check,
  X,
} from "lucide-react";
import { SettingsToggle } from "../components/settings-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MoreSettingsSection() {
  // Notification states
  const [pauseAll, setPauseAll] = useState(false);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);

  // Appearance state
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");

  // Media & Data state
  const [uploadHighestQuality, setUploadHighestQuality] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  // Language & Unit
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Harap isi semua kolom kata sandi");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Kata sandi berhasil diperbarui!");
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

      {/* ================= 1. NOTIFICATIONS ================= */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Pemberitahuan & Notifikasi
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* Pause All */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Bell size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Jeda Semua Notifikasi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Hentikan sementara semua push notifikasi pada perangkat ini
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={pauseAll}
            onCheckedChange={(val) => {
              setPauseAll(val);
              showToast(val ? "Semua notifikasi dijeda" : "Notifikasi kembali aktif");
            }}
          />
        </div>

        {/* Sub notifications (disabled if pause all is on) */}
        {!pauseAll && (
          <>
            <div className="flex items-center justify-between gap-4 px-5 py-4 pl-16">
              <div>
                <p className="text-sm font-medium text-slate-800">Suka & Reaksi Tangkapan</p>
                <p className="text-xs text-slate-400">Saat seseorang menyukai foto ikan Anda</p>
              </div>
              <SettingsToggle
                checked={notifyLikes}
                onCheckedChange={setNotifyLikes}
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 pl-16">
              <div>
                <p className="text-sm font-medium text-slate-800">Komentar & Diskusi Spot</p>
                <p className="text-xs text-slate-400">Saat seseorang menanyakan umpan atau membalas tips</p>
              </div>
              <SettingsToggle
                checked={notifyComments}
                onCheckedChange={setNotifyComments}
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 pl-16">
              <div>
                <p className="text-sm font-medium text-slate-800">Pengikut Baru</p>
                <p className="text-xs text-slate-400">Saat angler lain mulai mengikuti profil Anda</p>
              </div>
              <SettingsToggle
                checked={notifyFollows}
                onCheckedChange={setNotifyFollows}
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 pl-16">
              <div>
                <p className="text-sm font-medium text-slate-800">Pesan & Ajakan Mancing</p>
                <p className="text-xs text-slate-400">Pemberitahuan pesan obrolan langsung</p>
              </div>
              <SettingsToggle
                checked={notifyMessages}
                onCheckedChange={setNotifyMessages}
              />
            </div>
          </>
        )}
      </div>

      {/* ================= 2. APPEARANCE ================= */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Tampilan Antarmuka
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Pilih Tema Aplikasi</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Sesuaikan nuansa tampilan visual layar Anda
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Terang", icon: Sun },
            { id: "dark", label: "Gelap", icon: Moon },
            { id: "system", label: "Sistem", icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = themeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setThemeMode(mode.id as any);
                  showToast(`Tema diubah ke ${mode.label}`);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. MEDIA QUALITY & DATA ================= */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Kualitas Media & Penggunaan Data
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* Upload at highest quality */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Image size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Unggah Kualitas Tertinggi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Selalu unggah foto tangkapan & video dalam resolusi tertinggi (Full HD)
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={uploadHighestQuality}
            onCheckedChange={(val) => {
              setUploadHighestQuality(val);
              showToast(val ? "Kualitas unggahan tertinggi aktif" : "Kualitas unggahan standar");
            }}
          />
        </div>

        {/* Data Saver */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Smartphone size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Penghemat Data Seluler</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Kurangi resolusi video reels saat tidak tersambung ke Wi-Fi
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={dataSaver}
            onCheckedChange={(val) => {
              setDataSaver(val);
              showToast(val ? "Penghemat data aktif" : "Penghemat data nonaktif");
            }}
          />
        </div>
      </div>

      {/* ================= 4. LANGUAGE & MEASUREMENT ================= */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Bahasa & Satuan Komunitas
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* Language */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Globe size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Bahasa Aplikasi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {language === "id" ? "Bahasa Indonesia" : "English (US)"}
              </p>
            </div>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setLanguage("id");
                showToast("Bahasa diatur ke Bahasa Indonesia");
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                language === "id" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                showToast("Language set to English");
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                language === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Measurement Unit */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Ruler size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Satuan Berat & Panjang Tangkapan</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {unitSystem === "metric" ? "Metrik (Kilogram, Centimeter)" : "Imperial (Pound, Inci)"}
              </p>
            </div>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setUnitSystem("metric");
                showToast("Satuan metrik (kg/cm) diterapkan");
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                unitSystem === "metric" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Metrik
            </button>
            <button
              type="button"
              onClick={() => {
                setUnitSystem("imperial");
                showToast("Satuan imperial (lbs/inch) diterapkan");
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                unitSystem === "imperial" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Imperial
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. SECURITY & LOGIN ================= */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Keamanan Akun
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-y divide-slate-100">
        {/* 2FA */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Shield size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Autentikasi Dua Faktor (2FA)</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Lindungi akun memancing Anda dengan verifikasi keamanan tambahan
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={twoFactor}
            onCheckedChange={(val) => {
              setTwoFactor(val);
              showToast(val ? "2FA diaktifkan" : "2FA dinonaktifkan");
            }}
          />
        </div>

        {/* Change Password */}
        <button
          type="button"
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <KeyRound size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Ubah Kata Sandi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Perbarui kata sandi akun untuk menjaga keamanan
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-xs font-medium text-slate-700"
          >
            Ubah
          </Button>
        </button>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound size={20} className="text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Perbarui Kata Sandi</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Kata Sandi Saat Ini</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 rounded-xl border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Kata Sandi Baru</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="mt-1 rounded-xl border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Ulangi Kata Sandi Baru</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="mt-1 rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 rounded-full border-slate-200 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full bg-slate-900 text-xs text-white hover:bg-slate-800"
                >
                  Simpan Kata Sandi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
