"use client";

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback: ReactNode; onUnavailable: () => void }

export default class GalleryErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
