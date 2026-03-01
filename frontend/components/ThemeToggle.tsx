"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-14 h-7 rounded-full bg-muted animate-pulse" />
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
        >
            <span className="theme-toggle-thumb">
                {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-zinc-100" />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
            </span>
        </button>
    )
}
