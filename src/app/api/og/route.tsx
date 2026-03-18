import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Unknown";
  const score = parseInt(searchParams.get("score") || "0", 10);
  const verdict = searchParams.get("verdict") || "INVESTIGATING...";

  let color = "#00ff41";
  let bgAccent = "rgba(0, 255, 65, 0.1)";
  if (score >= 75) {
    color = "#ff0040";
    bgAccent = "rgba(255, 0, 64, 0.1)";
  } else if (score >= 50) {
    color = "#ff8800";
    bgAccent = "rgba(255, 136, 0, 0.1)";
  } else if (score >= 25) {
    color = "#ffcc00";
    bgAccent = "rgba(255, 204, 0, 0.1)";
  }

  let emoji = "✅";
  if (score >= 75) emoji = "🔴";
  else if (score >= 50) emoji = "🟠";
  else if (score >= 25) emoji = "🟡";
  else if (score > 0) emoji = "🟢";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: color,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 14,
            letterSpacing: 6,
            color: "#ff0040",
            marginBottom: 20,
          }}
        >
          CLASSIFIED
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#ffffff",
            marginBottom: 28,
            display: "flex",
            gap: 8,
          }}
        >
          <span>🕵️ Is My VC a</span>
          <span style={{ color: "#00ff41" }}>Foreign Agent</span>
          <span>? 🕵️‍♀️</span>
        </div>

        <div
          style={{
            fontSize: 16,
            color: "#666",
            letterSpacing: 3,
            marginBottom: 20,
          }}
        >
          {`SUBJECT: ${name.toUpperCase()}`}
        </div>

        <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: color,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: 18,
              color: "#666",
              letterSpacing: 2,
            }}
          >
            / 100 SPY SCORE
          </span>
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: color,
            letterSpacing: 4,
            marginBottom: 20,
            padding: "8px 24px",
            background: bgAccent,
            borderRadius: 8,
          }}
        >
          {verdict}
        </div>

        <div
          style={{
            width: 400,
            height: 8,
            background: "#222",
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: color,
              borderRadius: 4,
            }}
          />
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#444",
            letterSpacing: 1,
          }}
        >
          ismyvcaforeignagent.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
