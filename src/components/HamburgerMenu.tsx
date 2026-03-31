"use client";

import { useState } from "react";

interface HamburgerMenuProps {
  clinicId?: string;
  onOpenPresets?: () => void;
  onExportText?: () => void;
  onExportJson?: () => void;
  /** 管理者モード（出力系ボタンを表示） */
  isAdmin?: boolean;
}

export default function HamburgerMenu({
  clinicId,
  onOpenPresets,
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
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
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
            {onOpenPresets && (
              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                }
                label="テンプレートから始める"
                onClick={() => handleAction(onOpenPresets)}
              />
            )}

            {isAdmin && (
            <>
            <div className="mx-4 my-1" style={{ borderTop: "1px solid var(--md-outline-variant)" }} />

            {onExportText && (
              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                label="テキスト出力"
                onClick={() => handleAction(onExportText)}
              />
            )}
            {onExportJson && (
              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
                label="JSON出力"
                onClick={() => handleAction(onExportJson)}
              />
            )}

            </>
            )}

            <div className="mx-4 my-1" style={{ borderTop: "1px solid var(--md-outline-variant)" }} />

            <MenuItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
              label="トップに戻る"
              href="/"
            />

            {clinicId && isAdmin && (
              <MenuItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
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
