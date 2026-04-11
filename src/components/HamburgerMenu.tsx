"use client";

import { useState } from "react";
import { Menu, X, Star, LayoutGrid, FileDown, Download, Home, Settings } from "lucide-react";

interface HamburgerMenuProps {
  clinicId?: string;
  onOpenPresets?: () => void;
  onOpenMissionBuilder?: () => void;
  onExportText?: () => void;
  onExportJson?: () => void;
  /** 管理者モード（出力系ボタンを表示） */
  isAdmin?: boolean;
}

export default function HamburgerMenu({
  clinicId,
  onOpenPresets,
  onOpenMissionBuilder,
  onExportText,
  onExportJson,
  isAdmin = false,
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);

  function handleAction(fn?: () => void) {
    if (fn) fn();
    setOpen(false);
  }

  return (
    <>
      {/* FAB ハンバーガーボタン */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-40 w-12 h-12 flex items-center justify-center"
        style={{
          background: open ? "var(--md-on-surface)" : "var(--md-primary)",
          color: open ? "var(--md-surface)" : "var(--md-on-primary)",
          borderRadius: "var(--md-shape-corner-md)",
          boxShadow: "var(--md-elevation-2)",
          border: "none",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        aria-label="メニューを開く"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu */}
      {open && (
        <div
          className="fixed top-20 right-4 z-40 w-64"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-lg)",
            boxShadow: "var(--md-elevation-2)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: "var(--md-primary-container)",
            }}
          >
            <img src="/ponko.png" alt="ぽん子" className="w-8 h-8" />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--md-on-primary-container)" }}>
                Clinic Portal
              </p>
              {clinicId && (
                <p className="text-[11px]" style={{ color: "var(--md-on-primary-container)" }}>
                  ID: {clinicId}
                </p>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {onOpenMissionBuilder && (
              <MenuItem
                icon={<Star size={20} />}
                label="MISSION WAY"
                onClick={() => handleAction(onOpenMissionBuilder)}
              />
            )}
            {onOpenPresets && (
              <MenuItem
                icon={<LayoutGrid size={20} />}
                label="テンプレートから始める"
                onClick={() => handleAction(onOpenPresets)}
              />
            )}

            {isAdmin && (
            <>
            <div className="mx-4 my-1" style={{ borderTop: "1px solid var(--md-outline-variant)" }} />

            {onExportText && (
              <MenuItem
                icon={<FileDown size={20} />}
                label="テキスト出力"
                onClick={() => handleAction(onExportText)}
              />
            )}
            {onExportJson && (
              <MenuItem
                icon={<Download size={20} />}
                label="JSON出力"
                onClick={() => handleAction(onExportJson)}
              />
            )}

            </>
            )}

            <div className="mx-4 my-1" style={{ borderTop: "1px solid var(--md-outline-variant)" }} />

            <MenuItem
              icon={<Home size={20} />}
              label="トップに戻る"
              href="/"
            />

            {clinicId && isAdmin && (
              <MenuItem
                icon={<Settings size={20} />}
                label="管理画面"
                href="/admin"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className = "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left min-h-[48px] transition-colors";
  const style = {
    color: "var(--md-on-surface)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  };

  const content = (
    <>
      <span style={{ color: "var(--md-on-surface-variant)" }}>{icon}</span>
      {label}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className} style={{ ...style, textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} style={style}>
      {content}
    </button>
  );
}
