import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Highlight, themes } from "prism-react-renderer"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  hideHeader?: boolean
}

const LANG_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  bash: "bash",
  sh: "bash",
  env: "bash",
  "": "typescript",
}

function resolveLanguage(lang?: string): string {
  if (!lang) return "typescript"
  const lower = lang.toLowerCase()
  return LANG_MAP[lower] || lower
}

const customTheme = {
  ...themes.vsDark,
  plain: {
    ...themes.vsDark.plain,
    backgroundColor: "transparent",
    color: "#d4d4d8",
  },
}

export function CodeBlock({ code, language, filename, hideHeader }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const resolvedLang = resolveLanguage(language)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-[#1e1e25] bg-[#0a0a0a] overflow-hidden my-4">
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e25] bg-[#111114]">
          <span className="text-xs text-[#9d9daa] font-mono">
            {filename || language || "code"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#5c5c6a] hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <Highlight theme={customTheme} code={code.trim()} language={resolvedLang}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
