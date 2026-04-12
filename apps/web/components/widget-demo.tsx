'use client'

import { Screen2Prompt } from 'screen2prompt/next'

/**
 * Renders the Screen2Prompt widget in demo mode.
 * No license key is required or exposed in source — the widget
 * activates via the `demo` prop which bypasses license validation.
 */
export function WidgetDemo() {
  return <Screen2Prompt demo />
}
