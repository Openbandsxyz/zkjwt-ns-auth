import { OAUTH_SERVER, CLIENT_ID, REDIRECT_URI, SCOPES } from "../config"
import { generatePKCE } from "../pkce"

const FONT = "'Outfit', system-ui, -apple-system, sans-serif"

/* NS "+" cross logo */
function NSLogo({ size = 16, color = "#09090b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M11 4h2v16h-2zM4 11h16v2H4z" />
    </svg>
  )
}

export function Home() {
  async function handleSignIn() {
    const { codeVerifier, codeChallenge } = await generatePKCE()
    sessionStorage.setItem("pkce_code_verifier", codeVerifier)

    const state = crypto.randomUUID()
    sessionStorage.setItem("oauth_state", state)

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    window.location.href = `${OAUTH_SERVER}/oauth/authorize?${params}`
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", fontFamily: FONT }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", maxWidth: 960, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#fafafa",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <NSLogo size={18} color="#09090b" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>StudyTracker</span>
        </div>
        <button
          onClick={handleSignIn}
          style={{
            padding: "8px 18px", fontSize: 13, fontWeight: 600,
            background: "transparent", color: "#71717a",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
            cursor: "pointer", transition: "all 0.15s", fontFamily: FONT,
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fafafa" }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#71717a" }}
        >Sign in</button>
      </nav>

      {/* Hero */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "100px 24px 80px", position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px 5px 8px", borderRadius: 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13, fontWeight: 500, color: "#a1a1aa",
          marginBottom: 28, animation: "fadeInUp 0.5s ease",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#fafafa",
            animation: "pulseGlow 2s ease-in-out infinite",
          }} />
          For NS members only
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.04em", margin: "0 0 16px", maxWidth: 580,
          animation: "fadeInUp 0.5s ease 0.1s both",
        }}>
          Track your learning at{" "}
          <span style={{ color: "#fafafa" }}>Network School</span>
        </h1>

        <p style={{
          fontSize: 16, lineHeight: 1.7, color: "#71717a", maxWidth: 440,
          margin: "0 0 36px", fontWeight: 400,
          animation: "fadeInUp 0.5s ease 0.2s both",
        }}>
          Organize study sessions, track progress, and collaborate with your cohort.
          Sign in with your NS identity to get started.
        </p>

        <button
          onClick={handleSignIn}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "15px 32px", fontSize: 15, fontWeight: 700,
            background: "#fafafa",
            color: "#09090b", border: "none", borderRadius: 12,
            cursor: "pointer", fontFamily: FONT,
            boxShadow: "0 4px 20px rgba(255,255,255,0.08)",
            transition: "all 0.2s ease",
            animation: "fadeInUp 0.5s ease 0.3s both",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,255,255,0.12)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,255,255,0.08)"
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background: "#09090b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <NSLogo size={14} color="#fafafa" />
          </div>
          Sign in with Network School
        </button>
      </div>

      {/* Feature cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, maxWidth: 680, margin: "0 auto", padding: "0 24px 80px",
      }}>
        {[
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            title: "Your Identity",
            desc: "Profile, email, and badges from Discord",
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
            title: "Roles & Access",
            desc: "NS community roles unlock features",
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            title: "Membership",
            desc: "Join date, cohort, and server boost status",
          },
        ].map((f, i) => (
          <div key={i} style={{
            background: "#111114", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "22px 18px",
            animation: `fadeInUp 0.5s ease ${0.4 + i * 0.1}s both`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>{f.icon}</div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#52525b", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Scopes */}
      <div style={{ textAlign: "center", padding: "0 24px 48px", animation: "fadeIn 0.6s ease 0.7s both" }}>
        <p style={{
          fontSize: 11, color: "#3f3f46", marginBottom: 10,
          fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const,
        }}>Requested Scopes</p>
        <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
          {SCOPES.split(" ").map((s: string) => (
            <span key={s} style={{
              padding: "4px 10px", borderRadius: 5,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              fontSize: 11, color: "#52525b", fontWeight: 500,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "20px 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        fontSize: 12, color: "#27272a",
      }}>
        Powered by NS OAuth
      </footer>
    </div>
  )
}
