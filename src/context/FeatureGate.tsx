//src/context/FeatureGate.tsx

import { Lock } from "lucide-react";

interface FeatureGateProps {
  enabled: boolean;
  children: React.ReactNode;
  upgradeText?: string;
}

export default function FeatureGate({
  enabled,
  children,
  upgradeText = "Upgrade to unlock this feature",
}: FeatureGateProps) {
  return (
    <div style={{ position: "relative" }}>
      {/* Feature content */}
      <div
        style={{
          filter: enabled ? "none" : "blur(4px)",
          pointerEvents: enabled ? "auto" : "none",
          userSelect: enabled ? "auto" : "none",
          transition: "filter 0.2s ease",
        }}
      >
        {children}
      </div>

      {/* Overlay */}
      {!enabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "16px 20px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              textAlign: "center",
              maxWidth: "280px",
            }}
          >
            <Lock size={20} style={{ marginBottom: 8 }} />
            <p style={{ fontWeight: 600, marginBottom: 12 }}>
              {upgradeText}
            </p>

            <button
              onClick={() => alert("Redirect to upgrade page")}
              style={{
                background: "#4f46e5",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}