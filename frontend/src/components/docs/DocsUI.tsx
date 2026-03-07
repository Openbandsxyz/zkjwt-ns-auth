import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { CodeBlock } from "./CodeBlock"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared UI Components for Docs
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
    return (
        <h2
            id={id}
            className="text-xl font-semibold text-foreground mt-12 mb-4 scroll-mt-20 flex items-center gap-2"
        >
            {children}
        </h2>
    )
}

export function SubHeading({ children }: { children: ReactNode }) {
    return (
        <h3 className="text-sm font-semibold text-foreground mt-6 mb-2 uppercase tracking-wide">
            {children}
        </h3>
    )
}

export function Pill({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground">
            {children}
        </span>
    )
}

export function Callout({
    type = "info",
    children,
}: {
    type?: "info" | "warning" | "tip"
    children: ReactNode
}) {
    const styles = {
        info: "border-border bg-secondary/30 text-muted-foreground",
        warning: "border-border bg-secondary/30 text-muted-foreground",
        tip: "border-border bg-secondary/30 text-muted-foreground",
    }
    const icons = {
        info: "ℹ",
        warning: "⚠",
        tip: "✦",
    }

    return (
        <div className={`rounded-lg border px-4 py-3 my-4 text-sm ${styles[type]}`}>
            <div className="flex items-start gap-2">
                <span className="text-xs mt-0.5">{icons[type]}</span>
                <div>{children}</div>
            </div>
        </div>
    )
}

export function EndpointRow({
    method,
    path,
    description,
}: {
    method: string
    path: string
    description: string
}) {
    const color =
        method === "GET"
            ? "text-foreground bg-secondary"
            : method === "POST"
                ? "text-foreground bg-secondary"
                : method === "DELETE"
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground bg-secondary"

    return (
        <tr className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
            <td className="py-2.5 pr-3 w-20">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>{method}</span>
            </td>
            <td className="py-2.5 pr-3">
                <code className="text-foreground text-[13px]">{path}</code>
            </td>
            <td className="py-2.5 text-muted-foreground text-sm">{description}</td>
        </tr>
    )
}

export function ParamRow({
    name,
    required,
    description,
}: {
    name: string
    required?: boolean
    description: ReactNode
}) {
    return (
        <tr className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
            <td className="py-2 pr-3">
                <code className="text-foreground text-[13px]">{name}</code>
            </td>
            <td className="py-2 pr-3 w-20">
                {required !== undefined && (
                    <span
                        className={`text-[10px] font-semibold uppercase ${required ? "text-foreground" : "text-muted-foreground/40"}`}
                    >
                        {required ? "required" : "optional"}
                    </span>
                )}
            </td>
            <td className="py-2 text-muted-foreground text-sm">{description}</td>
        </tr>
    )
}

export function TableHead({ children }: { children?: ReactNode }) {
    return (
        <th className="py-2 pr-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
            {children}
        </th>
    )
}

export function FileRow({
    n,
    file,
    badge,
    desc,
    code,
    lang,
    defaultOpen = false,
}: {
    n: number
    file: string
    badge: string
    desc: string
    code: string
    lang: string
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    const [copied, setCopied] = useState(false)
    const lineCount = code.trim().split("\n").length

    function handleCopy(e: React.MouseEvent) {
        e.stopPropagation()
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left cursor-pointer hover:bg-secondary/30 transition-colors group"
            >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center">
                    {n}
                </span>
                <code className="text-[13px] font-mono text-foreground font-medium truncate">{file}</code>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 bg-secondary text-muted-foreground">
                    {badge}
                </span>
                <span className="text-xs text-muted-foreground truncate hidden sm:block flex-1">{desc}</span>
                <span className="text-[10px] text-muted-foreground/40 font-mono flex-shrink-0 hidden sm:block">
                    {lineCount} lines
                </span>
                <span
                    onClick={handleCopy}
                    className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
                >
                    {copied ? "Copied" : "Copy"}
                </span>
                <span className={`text-[10px] font-medium flex items-center gap-1 flex-shrink-0 transition-colors ${open ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {open ? "Hide" : "View"}
                    <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                    />
                </span>
            </button>
            {open && (
                <div className="px-5 pb-4">
                    <CodeBlock code={code} language={lang} hideHeader />
                </div>
            )}
        </div>
    )
}
