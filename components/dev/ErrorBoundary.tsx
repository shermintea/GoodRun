"use client";
import React from "react";

export class ErrorBoundary extends React.Component<
  { label?: string; children: React.ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("[ErrorBoundary]", this.props.label ?? "", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-4 text-rose-700">
          <div className="font-semibold mb-1">
            Error in {this.props.label ?? "section"}
          </div>
          <div>{String(this.state.error)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
