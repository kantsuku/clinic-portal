"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div
            className="w-full max-w-sm p-8 text-center"
            style={{
              background: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-corner-xl)",
              boxShadow: "var(--md-elevation-2)",
            }}
          >
            <img src="/ponko.png" alt="ぽん子" className="w-16 h-16 mx-auto mb-4" />
            <h1
              className="text-lg font-medium mb-2"
              style={{ color: "var(--md-on-surface)" }}
            >
              エラーが発生しました
            </h1>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              申し訳ありません、問題が発生しました。
              入力データは自動保存されていますのでご安心ください。
            </p>
            <p
              className="text-xs mb-6 font-mono p-2"
              style={{
                color: "var(--md-error)",
                background: "var(--md-error-container)",
                borderRadius: "var(--md-shape-corner-sm)",
              }}
            >
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 text-sm font-medium"
              style={{
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
