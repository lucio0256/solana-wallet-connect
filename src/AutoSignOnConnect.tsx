import { useState, useEffect } from "react";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import bs58 from "bs58";

export function AutoSignOnConnect() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (primaryWallet) {
      const checkApprovals = async () => {
        try {
          const response = await fetch(
            `https://api.pacifica.fi/api/v1/account/builder_codes/approvals?account=${primaryWallet.address}`
          );
          if (response.ok) {
            const res = await response.json();
            const approved = res.success && Array.isArray(res.data) ? res.data.some((item: any) => item.builder_code === "lucio0256") : false;
            setIsApproved(approved);
          } else {
            setIsApproved(false);
          }
        } catch (error) {
          console.error("Failed to check approvals:", error);
          setIsApproved(false);
        }
      };
      checkApprovals();
    } else {
      setIsApproved(null);
    }
  }, [primaryWallet]);

  const handleApprove = async () => {
    if (!primaryWallet) return;

    try {
      const timestamp = Date.now();

      const messageToSign = {
        timestamp,
        expiry_window: 5000,
        type: "approve_builder_code",
        data: {
          builder_code: "lucio0256",
          max_fee_rate: "0.001",
        },
      };

      const sorted = sortObjectRecursively(messageToSign);
      const compactJson = JSON.stringify(sorted);

      const result = await (primaryWallet.signMessage as any)(compactJson);

      let signature: string;
      if (typeof result === "string") {
        if (result.includes("+") || result.includes("/") || result.includes("=")) {
          const signatureBytes = Buffer.from(result, "base64");
          signature = bs58.encode(signatureBytes);
        } else {
          signature = result;
        }
      } else {
        throw new Error("Unknown signature format");
      }

      const fullPayload = {
        account: primaryWallet.address,
        agent_wallet: null,
        signature: signature,
        timestamp,
        expiry_window: 5000,
        builder_code: "lucio0256",
        max_fee_rate: "0.001",
      };

      const response = await fetch(
        "https://api.pacifica.fi/api/v1/account/builder_codes/approve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        setIsApproved(true);
        console.log("Approve success:", responseText);

        (window as any).Telegram?.WebApp?.sendData(
            JSON.stringify({ approved: true, address: primaryWallet.address })
        );

      } else {
        console.error("Approve error:", response.status, responseText);
      }
    } catch (error: any) {
      console.error("Approve error:", error);
    }
  };

  const handleRevoke = async () => {
    if (!primaryWallet) return;

    try {
      const timestamp = Date.now();

      const messageToSign = {
        timestamp,
        expiry_window: 5000,
        type: "revoke_builder_code",
        data: {
          builder_code: "lucio0256",
        },
      };

      const sorted = sortObjectRecursively(messageToSign);
      const compactJson = JSON.stringify(sorted);

      const result = await (primaryWallet.signMessage as any)(compactJson);

      let signature: string;
      if (typeof result === "string") {
        if (result.includes("+") || result.includes("/") || result.includes("=")) {
          const signatureBytes = Buffer.from(result, "base64");
          signature = bs58.encode(signatureBytes);
        } else {
          signature = result;
        }
      } else {
        throw new Error("Unknown signature format");
      }

      const fullPayload = {
        account: primaryWallet.address,
        agent_wallet: null,
        signature: signature,
        timestamp,
        expiry_window: 5000,
        builder_code: "lucio0256",
      };

      const response = await fetch(
        "https://api.pacifica.fi/api/v1/account/builder_codes/revoke",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        setIsApproved(false);
        console.log("Revoke success:", responseText);
      } else {
        console.error("Revoke error:", response.status, responseText);
      }
    } catch (error: any) {
      console.error("Revoke error:", error);
    }
  };

  if (!primaryWallet) {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: '20px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Connect Wallet</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Connect your Solana wallet to approve the builder code
        </p>
        <DynamicWidget />
        <div dangerouslySetInnerHTML={{ __html: '<style type="text/css">.connect-button { display: none !important; }</style>' }} />
      </div>
    );
  }

  if (isApproved === null) {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: '20px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Checking Approval Status</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Verifying if the builder code is already approved...
        </p>
      </div>
    );
  }

  if (isApproved === true) {
    return (
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: '20px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>✅ Builder Code Approved</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          You have already approved the builder code "lucio0256". No further action needed.
        </p>

        {primaryWallet && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '16px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Wallet:</strong> {primaryWallet.connector.name}
            </div>
            <div>
              <strong>Address:</strong> {primaryWallet.address?.slice(0, 8)}...{primaryWallet.address?.slice(-6)}
            </div>
          </div>
        )}

        <button
          onClick={handleRevoke}
          style={{
            width: '100%',
            padding: '12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          ❌ Revoke Approval
        </button>

        <button
          onClick={() => handleLogOut()}
          style={{
            width: '100%',
            padding: '12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          🚪 Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      maxWidth: '400px',
      margin: '20px auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Approve Builder Code</h2>

      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Sign to approve builder code "lucio0256" with max fee rate 0.001
      </p>

      {primaryWallet && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Wallet:</strong> {primaryWallet.connector.name}
          </div>
          <div>
            <strong>Address:</strong> {primaryWallet.address?.slice(0, 8)}...{primaryWallet.address?.slice(-6)}
          </div>
        </div>
      )}

      <button
        onClick={handleApprove}
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ✍️ Sign & Approve
      </button>

      <button
        onClick={() => handleLogOut()}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '12px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        🚪 Disconnect Wallet
      </button>
    </div>
  );
}

function sortObjectRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectRecursively);
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, any>, key) => {
        result[key] = sortObjectRecursively(obj[key]);
        return result;
      }, {});
  }

  return obj;
}
