"use client";

import React, { useState } from "react";
import {
  LockKeyhole,
  AtSign,
  VolumeX,
  EyeOff,
  UserX,
  HeartOff,
  Activity,
  ChevronRight,
  Check,
  Plus,
  X,
  ShieldAlert,
} from "lucide-react";
import { SettingsToggle } from "../components/settings-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PrivacySection() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [mentionSetting, setMentionSetting] = useState<"everyone" | "following" | "none">("everyone");
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  
  const [hideLikesAndShares, setHideLikesAndShares] = useState(false);
  const [activeStatus, setActiveStatus] = useState(true);
  const [filterOffensive, setFilterOffensive] = useState(true);

  // Hidden words
  const [isWordsModalOpen, setIsWordsModalOpen] = useState(false);
  const [customWords, setCustomWords] = useState<string[]>(["toxic", "clickbait", "iklan"]);
  const [newWord, setNewWord] = useState("");

  // Muted accounts
  const [isMutedModalOpen, setIsMutedModalOpen] = useState(false);
  const [mutedUsers, setMutedUsers] = useState([
    { id: "1", name: "Rian Pemancing Malam", username: "rian_strike99", avatar: "🎣" },
    { id: "2", name: "Toko Umpan Express", username: "toko_umpan_iklan", avatar: "🏪" },
  ]);

  // Blocked accounts
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([
    { id: "10", name: "Akun Spam Ikan", username: "ikan_bonus_xyz", avatar: "🚫" },
  ]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWord.trim().toLowerCase();
    if (trimmed && !customWords.includes(trimmed)) {
      setCustomWords([...customWords, trimmed]);
      setNewWord("");
      showToast(`Kata "${trimmed}" ditambahkan ke filter`);
    }
  };

  const handleRemoveWord = (word: string) => {
    setCustomWords(customWords.filter((w) => w !== word));
    showToast(`Kata "${word}" dihapus dari filter`);
  };

  const handleUnmute = (id: string, name: string) => {
    setMutedUsers(mutedUsers.filter((u) => u.id !== id));
    showToast(`${name} telah dibatalkan bisukannya`);
  };

  const handleUnblock = (id: string, name: string) => {
    setBlockedUsers(blockedUsers.filter((u) => u.id !== id));
    showToast(`Blokir terhadap ${name} telah dibuka`);
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

      {/* Main Privacy Group */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Private Profile Toggle */}
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <LockKeyhole size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Profil Privat</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Saat profil Anda privat, hanya pemancing yang Anda setujui yang dapat melihat kiriman,
                spot pancing rahasia, dan foto tangkapan Anda.
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={isPrivate}
            onCheckedChange={(val) => {
              setIsPrivate(val);
              showToast(val ? "Profil sekarang privat" : "Profil sekarang publik");
            }}
            ariaLabel="Toggle profil privat"
          />
        </div>

        <div className="h-px bg-slate-100" />

        {/* Mentions & Tags */}
        <div>
          <button
            type="button"
            onClick={() => setIsMentionOpen(!isMentionOpen)}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <AtSign size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Sebutan (@mentions) & Tanda</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {mentionSetting === "everyone"
                    ? "Semua Orang"
                    : mentionSetting === "following"
                    ? "Hanya Angler yang Anda Ikuti"
                    : "Tidak Seorang Pun"}
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${
                isMentionOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* Mentions Dropdown Options */}
          {isMentionOpen && (
            <div className="border-t border-slate-100 bg-slate-50/60 p-3 space-y-1">
              {[
                { id: "everyone", label: "Semua Orang", desc: "Siapapun dapat menyebut Anda di postingan atau komentar" },
                { id: "following", label: "Hanya yang Diikuti", desc: "Hanya akun yang Anda ikuti yang dapat menyebut Anda" },
                { id: "none", label: "Tidak Seorang Pun", desc: "Tidak ada yang dapat menyebut atau menandai Anda" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setMentionSetting(opt.id as any);
                    setIsMentionOpen(false);
                    showToast(`Pengaturan sebutan diubah ke "${opt.label}"`);
                  }}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-white"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                  {mentionSetting === opt.id && (
                    <Check size={18} className="text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        {/* Muted Accounts */}
        <button
          type="button"
          onClick={() => setIsMutedModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <VolumeX size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Profil yang Dibisukan</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {mutedUsers.length > 0 ? `${mutedUsers.length} akun dibisukan` : "Tidak ada akun yang dibisukan"}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <div className="h-px bg-slate-100" />

        {/* Hidden Words & Comments Filter */}
        <button
          type="button"
          onClick={() => setIsWordsModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <EyeOff size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Kata yang Disembunyikan</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Filter komentar kasar, spam ulasan spot, atau kata kustom ({customWords.length} kata aktif)
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        <div className="h-px bg-slate-100" />

        {/* Blocked Profiles */}
        <button
          type="button"
          onClick={() => setIsBlockedModalOpen(true)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <UserX size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Profil yang Diblokir</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {blockedUsers.length > 0 ? `${blockedUsers.length} akun diblokir` : "Tidak ada akun diblokir"}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Interactions & Display Group */}
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Interaksi & Tampilan Sosial
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Hide Likes & Share counts */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <HeartOff size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Sembunyikan Suka & Bagikan</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Total jumlah suka dan bagikan dari akun lain tidak akan terlihat di feed Anda.
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={hideLikesAndShares}
            onCheckedChange={(val) => {
              setHideLikesAndShares(val);
              showToast(val ? "Jumlah suka disembunyikan" : "Jumlah suka ditampilkan");
            }}
            ariaLabel="Toggle sembunyikan suka dan bagikan"
          />
        </div>

        <div className="h-px bg-slate-100" />

        {/* Active Status */}
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Activity size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Status Aktif (Online)</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Izinkan angler yang Anda ikuti melihat tanda saat Anda aktif di Fishing Community.
              </p>
            </div>
          </div>
          <SettingsToggle
            checked={activeStatus}
            onCheckedChange={(val) => {
              setActiveStatus(val);
              showToast(val ? "Status aktif dinyalakan" : "Status aktif dinonaktifkan");
            }}
            ariaLabel="Toggle status aktif"
          />
        </div>
      </div>

      {/* ================= MODAL: MUTED ACCOUNTS ================= */}
      {isMutedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <VolumeX size={20} className="text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Profil yang Dibisukan</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMutedModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Postingan dan balasan dari akun ini tidak akan muncul di timeline Anda, tetapi mereka tidak tahu bahwa mereka dibisukan.
            </p>

            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
              {mutedUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada akun yang sedang dibisukan.
                </div>
              ) : (
                mutedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-base">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnmute(u.id, u.name)}
                      className="h-8 rounded-full border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Batal Bisukan
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setIsMutedModalOpen(false)}
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BLOCKED ACCOUNTS ================= */}
      {isBlockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <UserX size={20} className="text-red-500" />
                <h3 className="text-base font-bold text-slate-900">Profil yang Diblokir</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBlockedModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Pengguna yang diblokir tidak dapat mencari profil Anda, melihat postingan tangkapan, atau mengirim pesan pribadi.
            </p>

            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
              {blockedUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada pengguna yang diblokir.
                </div>
              ) : (
                blockedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-base">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(u.id, u.name)}
                      className="h-8 rounded-full border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Buka Blokir
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setIsBlockedModalOpen(false)}
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HIDDEN WORDS ================= */}
      {isWordsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <EyeOff size={20} className="text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Kata yang Disembunyikan</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWordsModalOpen(false)}
                className="rounded-full h-8 w-8 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold text-slate-900">Filter Otomatis</p>
                <p className="text-[11px] text-slate-500">Sembunyikan komentar ofensif & spam otomatis</p>
              </div>
              <SettingsToggle
                checked={filterOffensive}
                onCheckedChange={setFilterOffensive}
              />
            </div>

            <form onSubmit={handleAddWord} className="mt-4 flex gap-2">
              <Input
                placeholder="Tambahkan kata terlarang..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 rounded-xl bg-slate-900 px-4 text-xs text-white hover:bg-slate-800"
              >
                <Plus size={16} className="mr-1" /> Tambah
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {customWords.map((word) => (
                <span
                  key={word}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(word)}
                    className="hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setIsWordsModalOpen(false)}
                className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
