"use client";

import React, { useEffect, useState } from "react";
import { loyaltyApi } from "@/lib/api";

type Props = {
  userId: number;
  currentPoints: number;
  currentAvatar: string;
  currentTheme: string;
  onClose: () => void;
  onUpdate: (points: number, avatar: string, theme: string) => void;
};

const CUSTOM_THEME_COST = 100;
const CUSTOM_AVATAR_COST = 100;

export default function LoyaltyShop({
  userId,
  currentPoints,
  currentAvatar,
  currentTheme,
  onClose,
  onUpdate,
}: Props) {
  const [points, setPoints] = useState<number>(currentPoints);
  const [avatar, setAvatar] = useState<string>(currentAvatar);
  const [theme, setTheme] = useState<string>(currentTheme);

  const [avatars, setAvatars] = useState<Record<string, number>>({});
  const [themes, setThemes] = useState<Record<string, number>>({});

  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [selectedTheme, setSelectedTheme] = useState<string>(currentTheme);

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState(false);
  const [loadingCustomTheme, setLoadingCustomTheme] = useState(false);

  // Custom theme colors
  const [customFrom, setCustomFrom] = useState("#4f46e5");
  const [customVia, setCustomVia] = useState("#ec4899");
  const [customTo, setCustomTo] = useState("#22c55e");

  // Custom avatar emoji
  const [loadingCustomAvatar, setLoadingCustomAvatar] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("🥷");

  useEffect(() => {
    loyaltyApi
      .get(userId)
      .then((res) => {
        setPoints(res.data.points);
        setAvatar(res.data.avatar);
        setTheme(res.data.theme);

        setSelectedAvatar(res.data.avatar);
        setSelectedTheme(res.data.theme);

        setAvatars(res.data.available_avatars || {});
        setThemes(res.data.available_themes || {});

        const t: string = res.data.theme || "";
        if (t.startsWith("custom:")) {
          const raw = t.slice("custom:".length);
          const parts = raw.split(",");
          if (parts[0]) setCustomFrom(parts[0]);
          if (parts[1]) setCustomVia(parts[1]);
          if (parts[2]) setCustomTo(parts[2]);
        }
      })
      .catch(() => {});
  }, [userId]);

  // ===== Avatar meta: icon + fancy label =====
  const avatarMeta: Record<string, { icon: string; label: string }> = {
    default: { icon: "🙂", label: "Basic" },
    cat: { icon: "😼", label: "Street Cat" },
    panda: { icon: "🐼", label: "Lazy Panda" },
    dragon: { icon: "🐉", label: "Dragon Lord" },
    fox: { icon: "🦊", label: "Cyber Fox" },
    robot: { icon: "🤖", label: "Neon Robot" },
    unicorn: { icon: "🦄", label: "Unicorn Dream" },
    alien: { icon: "👽", label: "Alien Visitor" },
    ghost: { icon: "👻", label: "Ghost Mode" },
  };

  const EMOJI_CHOICES = [
    "🙂","😊","💩","😈","👻","💀","👽","🤖",
    "🐱","🐶","🐻","🐰","🦊","🐯","🦁","🐸","🐵","🐷",
    "🐺","🦄","🐲","🐉","🐙","🦋","🐝","🐧","🐼",
    "🍀","🌸","🌻","🐣","🌙","⭐","⚡","🔥","❄️","💧",
    "🐛","🦍","🦥","🐢","🦩","🐳","🪼","🐙","🦭","🐊",
  ];

  const handleConfirmCustomAvatar = async () => {
    if (loadingCustomAvatar) return;
    if (!customEmoji) return;
    if (points < CUSTOM_AVATAR_COST) return;

    setLoadingCustomAvatar(true);
    try {
      const res = await loyaltyApi.redeemCustomAvatar(
        userId,
        customEmoji,
        CUSTOM_AVATAR_COST
      );
      setPoints(res.data.points);
      setAvatar(res.data.avatar);
      setSelectedAvatar(res.data.avatar);
      setTheme(res.data.theme || theme);
      onUpdate(res.data.points, res.data.avatar, res.data.theme || theme);
    } catch (e) {
      console.log("redeem custom avatar failed:", e);
    }
    setLoadingCustomAvatar(false);
  };

  const getAvatarCardStyle = (key: string) => {
    if (key === "cat") return "bg-gradient-to-br from-amber-100 to-orange-200";
    if (key === "panda")
      return "bg-gradient-to-br from-slate-100 to-slate-300";
    if (key === "dragon")
      return "bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white";
    if (key === "fox") return "bg-gradient-to-br from-orange-200 to-amber-300";
    if (key === "robot")
      return "bg-gradient-to-br from-slate-800 via-slate-700 to-cyan-500 text-white";
    if (key === "unicorn")
      return "bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200";
    if (key === "alien")
      return "bg-gradient-to-br from-emerald-200 via-lime-200 to-sky-200";
    if (key === "ghost")
      return "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200";
    return "bg-gradient-to-br from-slate-50 to-slate-100";
  };

  // ===== Theme meta: preview & name (cho fixed theme) =====
  const getThemePreviewClass = (key: string) => {
    if (key === "sakura")
      return "bg-gradient-to-br from-pink-100 via-rose-200 to-rose-300";
    if (key === "dark")
      return "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900";
    if (key === "forest")
      return "bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-400";
    if (key === "sunset")
      return "bg-gradient-to-br from-orange-500 via-pink-500 to-red-500";
    if (key === "ocean")
      return "bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-500";
    if (key === "neon")
      return "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400";
    if (key === "terminal")
      return "bg-gradient-to-br from-black via-slate-900 to-emerald-500";
    if (key === "cafe")
      return "bg-gradient-to-br from-amber-700 via-orange-500 to-stone-400";
    if (key === "default")
      return "bg-gradient-to-br from-slate-100 to-slate-200";
    return "bg-gradient-to-br from-slate-100 to-slate-200";
  };

  const getThemeFancyName = (key: string) => {
    if (key === "sakura") return "Sakura Breeze";
    if (key === "forest") return "Forest Spirit";
    if (key === "sunset") return "Sunset Glow";
    if (key === "ocean") return "Ocean Chill";
    if (key === "neon") return "Neon Cyber";
    if (key === "default") return "Classic";
    return key;
  };

  const handleConfirmAvatar = async () => {
    if (loadingAvatar) return;
    if (!selectedAvatar || selectedAvatar === avatar) return;

    const cost = avatars[selectedAvatar] ?? 0;
    if (cost <= 0) return;
    if (points < cost) return;

    setLoadingAvatar(true);
    try {
      const res = await loyaltyApi.redeemAvatar(userId, selectedAvatar);
      setPoints(res.data.points);
      setAvatar(res.data.avatar);
      setSelectedAvatar(res.data.avatar);
      setTheme(res.data.theme || theme);
      onUpdate(res.data.points, res.data.avatar, res.data.theme || theme);
    } catch (e) {
      console.log("redeem avatar failed:", e);
    }
    setLoadingAvatar(false);
  };

  const handleConfirmTheme = async () => {
    if (loadingTheme) return;
    if (!selectedTheme || selectedTheme === theme) return;

    const cost = themes[selectedTheme] ?? 0;
    if (cost <= 0) return;
    if (points < cost) return;

    setLoadingTheme(true);
    try {
      const res = await loyaltyApi.redeemTheme(userId, selectedTheme);
      setPoints(res.data.points);
      setTheme(res.data.theme);
      setSelectedTheme(res.data.theme);
      setAvatar(res.data.avatar || avatar);
      onUpdate(res.data.points, res.data.avatar || avatar, res.data.theme);
    } catch (e) {
      console.log("redeem theme failed:", e);
    }
    setLoadingTheme(false);
  };

  const handleConfirmCustomTheme = async () => {
    if (loadingCustomTheme) return;
    if (points < CUSTOM_THEME_COST) return;

    setLoadingCustomTheme(true);
    try {
      const res = await loyaltyApi.redeemCustomTheme(
        userId,
        customFrom,
        customVia,
        customTo,
        CUSTOM_THEME_COST
      );
      setPoints(res.data.points);
      setTheme(res.data.theme);
      setSelectedTheme(res.data.theme);
      setAvatar(res.data.avatar || avatar);
      onUpdate(res.data.points, res.data.avatar || avatar, res.data.theme);
    } catch (e) {
      console.log("redeem custom theme failed:", e);
    }
    setLoadingCustomTheme(false);
  };

  const selectedAvatarCost = avatars[selectedAvatar] ?? 0;
  const selectedThemeCost = themes[selectedTheme] ?? 0;

  const selectedAvatarMeta =
    avatarMeta[selectedAvatar] || avatarMeta["default"];

  const customPreviewStyle = {
    backgroundImage: `linear-gradient(to bottom right, ${customFrom}, ${customVia}, ${customTo})`,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="m-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-white/10 dark:border-neutral-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              🎁 Loyalty Shop
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tích điểm từ flashcard để nâng cấp profile của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Points */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Your bPoint
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {points}
            </div>
          </div>
          <div className="text-xs text-gray-400 text-right">
            Chọn avatar / theme để xem trước. <br />
            Chỉ khi bấm nút đổi mới trừ điểm.
          </div>
        </div>

        {/* 2 CỘT: Trái = Avatar, Phải = Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* LEFT: Avatar + custom emoji */}
          <div className="space-y-6">
            {/* Avatar Shop */}
            <div>
              <div className="font-semibold mb-2 flex items-center justify-between">
                <span>Avatar</span>
                <span className="text-[11px] text-gray-400">
                  Icon sẽ hiển thị trên thẻ user
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(avatars).map(([key, cost]) => {
                  const isSelected = selectedAvatar === key;
                  const notEnough = points < cost;
                  const meta = avatarMeta[key] || {
                    icon: "🙂",
                    label: key,
                  };

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedAvatar(key)}
                      className={`relative border rounded-xl p-2 flex flex-col items-center justify-between h-24 text-xs
                        ${getAvatarCardStyle(key)}
                        ${
                          isSelected
                            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900"
                            : "border-gray-200/70 dark:border-neutral-700"
                        }
                        ${notEnough ? "opacity-60" : ""}`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow">
                          Chọn
                        </span>
                      )}
                      <div className="text-2xl mb-1">{meta.icon}</div>
                      <div className="font-semibold leading-tight">
                        {meta.label}
                      </div>
                      <div className="text-[10px] text-gray-700 dark:text-gray-200">
                        {cost} bp
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom emoji avatar */}
            <div className="border rounded-2xl border-dashed border-purple-300 dark:border-purple-700 p-4 bg-purple-50/60 dark:bg-purple-900/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    😜 Custom emoji avatar
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Chọn emoji bất kỳ để làm avatar, không bị giới hạn bởi danh
                    sách có sẵn.
                  </div>
                </div>
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Cost: {CUSTOM_AVATAR_COST} bp
                </div>
              </div>

              <div className="flex items-start gap-4 mb-3">
                {/* Emoji grid */}
                <div className="flex-1">
                  <div className="text-[11px] text-gray-500 mb-1">Emoji</div>
                  <div className="mt-1 max-h-32 overflow-y-auto bg-white dark:bg-neutral-900 border border-purple-100 dark:border-purple-700 rounded-xl p-2">
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                      {EMOJI_CHOICES.map((e) => {
                        const isSelected = customEmoji === e;
                        return (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setCustomEmoji(e)}
                            className={
                              "h-8 w-8 flex items-center justify-center rounded-lg text-xl transition " +
                              (isSelected
                                ? "bg-purple-600 text-white shadow-md scale-110"
                                : "bg-transparent hover:bg-purple-100 dark:hover:bg-purple-900/60")
                            }
                          >
                            {e}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Kéo để xem thêm emoji.
                  </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-gray-500">Preview</span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow">
                    {customEmoji}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmCustomAvatar}
                disabled={loadingCustomAvatar || points < CUSTOM_AVATAR_COST}
                className={`px-4 py-2 rounded text-xs font-semibold ${
                  loadingCustomAvatar || points < CUSTOM_AVATAR_COST
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {loadingCustomAvatar ? "Đang đổi..." : "Đổi avatar custom"}
              </button>

              {points < CUSTOM_AVATAR_COST && (
                <div className="mt-1 text-[11px] text-red-500">
                  Không đủ điểm để đổi custom avatar (cần {CUSTOM_AVATAR_COST} bp).
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Theme + custom theme */}
          <div className="space-y-6">
            {/* Theme Shop */}
            <div>
              <div className="font-semibold mb-2 flex items-center justify-between">
                <span>Theme</span>
                <span className="text-[11px] text-gray-400">
                  Nền thẻ user trên homepage
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(themes).map(([key, cost]) => {
                  const isSelected = selectedTheme === key;
                  const notEnough = points < cost;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTheme(key)}
                      className={`relative border rounded-xl p-2 flex flex-col items-start gap-2 h-24
                        ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/60"
                            : "border-gray-200 dark:border-neutral-700"
                        }
                        ${notEnough ? "opacity-60" : ""}`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 bg-emerald-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow">
                          Chọn
                        </span>
                      )}
                      <div
                        className={
                          "w-full h-8 rounded-md " + getThemePreviewClass(key)
                        }
                      ></div>
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                        {getThemeFancyName(key)}
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-300">
                        {key} • {cost} bp
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Theme - Color Picker */}
            <div className="border rounded-2xl border-dashed border-emerald-300 dark:border-emerald-700 p-4 bg-emerald-50/60 dark:bg-emerald-900/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    🎨 Custom theme (Color picker)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Tự mix 3 màu gradient riêng, lưu lại như skin cá nhân.
                  </div>
                </div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Cost: {CUSTOM_THEME_COST} bp
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-gray-500">From</span>
                  <input
                    type="color"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400">
                    {customFrom.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-gray-500">Via</span>
                  <input
                    type="color"
                    value={customVia}
                    onChange={(e) => setCustomVia(e.target.value)}
                    className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400">
                    {customVia.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-gray-500">To</span>
                  <input
                    type="color"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400">
                    {customTo.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[11px] text-gray-500 mb-1">
                    Preview
                  </div>
                  <div
                    className="w-full h-10 rounded-xl border shadow-inner"
                    style={customPreviewStyle}
                  ></div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmCustomTheme}
                  disabled={loadingCustomTheme || points < CUSTOM_THEME_COST}
                  className={`px-4 py-2 rounded text-xs font-semibold whitespace-nowrap ${
                    loadingCustomTheme || points < CUSTOM_THEME_COST
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {loadingCustomTheme ? "Đang đổi..." : "Đổi theme custom"}
                </button>
              </div>

              {points < CUSTOM_THEME_COST && (
                <div className="mt-1 text-[11px] text-red-500">
                  Không đủ điểm để tạo custom theme (cần {CUSTOM_THEME_COST} bp).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview & Confirm cho avatar + fixed theme */}
        <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="font-semibold mb-3">Preview</div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
            {/* Avatar preview */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Avatar sẽ dùng</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-2xl text-white shadow">
                  {selectedAvatarMeta.icon}
                </div>
                <div className="text-[11px] text-gray-500">
                  Cost: {selectedAvatarCost} bp
                  {selectedAvatarCost > 0 && points >= selectedAvatarCost && (
                    <span> → còn {points - selectedAvatarCost} bp</span>
                  )}
                  {selectedAvatarCost > 0 && points < selectedAvatarCost && (
                    <span className="text-red-500 ml-1">(không đủ điểm)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Theme preview */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                Theme (fixed) sẽ dùng
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={
                    "w-16 h-10 rounded-xl border shadow-inner " +
                    getThemePreviewClass(selectedTheme)
                  }
                ></div>
                <div className="text-[11px] text-gray-500">
                  Cost: {selectedThemeCost} bp
                  {selectedThemeCost > 0 && points >= selectedThemeCost && (
                    <span> → còn {points - selectedThemeCost} bp</span>
                  )}
                  {selectedThemeCost > 0 && points < selectedThemeCost && (
                    <span className="text-red-500 ml-1">(không đủ điểm)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Confirm buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleConfirmAvatar}
              disabled={
                loadingAvatar ||
                selectedAvatar === avatar ||
                selectedAvatarCost <= 0 ||
                points < selectedAvatarCost
              }
              className={`px-3 py-1 rounded text-xs ${
                loadingAvatar ||
                selectedAvatar === avatar ||
                selectedAvatarCost <= 0 ||
                points < selectedAvatarCost
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loadingAvatar ? "Đang đổi..." : "Đổi avatar"}
            </button>

            <button
              type="button"
              onClick={handleConfirmTheme}
              disabled={
                loadingTheme ||
                selectedTheme === theme ||
                selectedThemeCost <= 0 ||
                points < selectedThemeCost
              }
              className={`px-3 py-1 rounded text-xs ${
                loadingTheme ||
                selectedTheme === theme ||
                selectedThemeCost <= 0 ||
                points < selectedThemeCost
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {loadingTheme ? "Đang đổi..." : "Đổi theme"}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
