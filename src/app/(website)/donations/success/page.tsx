"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Heart } from "lucide-react";
import { finalizeStripeCheckoutSession } from "@/app/actions/stripe";
import {
  PAYMENT_METHOD_LABELS,
  type DonationPaymentMethod,
} from "@/lib/donation-payment-methods";

function pendingMethodLabel(raw: string | null): string {
  if (!raw) return "your chosen method";
  if (raw in PAYMENT_METHOD_LABELS) {
    return PAYMENT_METHOD_LABELS[raw as DonationPaymentMethod];
  }
  return raw.replace(/_/g, " ");
}

function DonationSuccessInner() {
  const searchParams = useSearchParams();
  const pending = searchParams.get("pending") === "1";
  const methodParam = searchParams.get("method");
  const sessionId = searchParams.get("session_id");
  const methodPhrase = pendingMethodLabel(methodParam);

  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (pending || !sessionId) return;
    void finalizeStripeCheckoutSession(sessionId).then((result) => {
      if (result.ok === true) {
        setVerified(true);
        return;
      }
      setVerifyError(result.error);
    });
  }, [pending, sessionId]);

  if (pending) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1.5rem 5rem",
          background: `linear-gradient(rgba(3, 17, 43, 0.85), rgba(3, 17, 43, 0.95)), url('/img/bg_3.png') center/cover no-repeat`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "#fff",
            borderRadius: "30px",
            padding: "4rem 3rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2b8a3e",
              marginBottom: "1.5rem",
            }}
          >
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "#03112b",
              marginBottom: "1rem",
              letterSpacing: "-0.03em",
            }}
          >
            Thank you!
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#5a6a7a", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            We received your pledge. Please complete your payment via{" "}
            <strong style={{ color: "#03112b" }}>{methodPhrase}</strong> for the amount you entered. Our team will
            reconcile the gift when the funds arrive.
          </p>

          <div
            style={{
              background: "#fcfcfc",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "3rem",
              border: "1px solid #f1f3f5",
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                color: "#8c2208",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontWeight: 800, color: "#03112b", marginBottom: "0.25rem" }}>What happens next?</h3>
              <p style={{ fontSize: "0.9rem", color: "#5a6a7a", lineHeight: 1.5 }}>
                Keep any reference or receipt from your bank or mobile money provider. We may email you at the address
                you provided once the donation is confirmed. For questions, contact Caritas Rwanda using the details on
                our website.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "none" }}
            >
              Return to Homepage <ArrowRight size={18} />
            </Link>
            <Link
              href="/news"
              className="btn"
              style={{
                background: "#f8f9fa",
                color: "#03112b",
                border: "1px solid #e9ecef",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Read Our Latest Stories
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const missingSessionError =
    !pending && !sessionId
      ? "We could not verify this donation. Please retry checkout from the donation form."
      : null;

  if (!pending && (verifyError || missingSessionError)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1.5rem 5rem",
          background: `linear-gradient(rgba(3, 17, 43, 0.85), rgba(3, 17, 43, 0.95)), url('/img/bg_3.png') center/cover no-repeat`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "#fff",
            borderRadius: "30px",
            padding: "4rem 3rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#03112b", marginBottom: "1rem" }}>
            Payment confirmation pending
          </h1>
          <p style={{ fontSize: "1rem", color: "#5a6a7a", marginBottom: "2rem", lineHeight: 1.6 }}>
            {verifyError || missingSessionError}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary" style={{ boxShadow: "none" }}>
              Return to Homepage
            </Link>
            <Link
              href="/"
              className="btn"
              style={{
                background: "#f8f9fa",
                color: "#03112b",
                border: "1px solid #e9ecef",
                fontWeight: 600,
                boxShadow: "none",
              }}
            >
              Try donating again
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!pending && sessionId && !verified && !verifyError) {
    return <SuccessFallback />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8rem 1.5rem 5rem",
        background: `linear-gradient(rgba(3, 17, 43, 0.85), rgba(3, 17, 43, 0.95)), url('/img/bg_3.png') center/cover no-repeat`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "#fff",
          borderRadius: "30px",
          padding: "4rem 3rem",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2b8a3e",
            marginBottom: "1.5rem",
          }}
        >
          <CheckCircle2 size={56} strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#03112b",
            marginBottom: "1rem",
            letterSpacing: "-0.03em",
          }}
        >
          Thank You!
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#5a6a7a", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          Your generosity has been successfully processed. You&apos;ve just taken a step towards restoring human dignity
          and building hope in Rwanda.
        </p>

        <div
          style={{
            background: "#fcfcfc",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "3rem",
            border: "1px solid #f1f3f5",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              color: "#8c2208",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            <Heart size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, color: "#03112b", marginBottom: "0.25rem" }}>What happens next?</h3>
            <p style={{ fontSize: "0.9rem", color: "#5a6a7a", lineHeight: 1.5 }}>
              You will receive a receipt via email shortly. Your contribution will be directly applied to the programs or
              campaign you selected.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "none" }}
          >
            Return to Homepage <ArrowRight size={18} />
          </Link>
          <Link
            href="/news"
            className="btn"
            style={{
              background: "#f8f9fa",
              color: "#03112b",
              border: "1px solid #e9ecef",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Read Our Latest Stories
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8rem 1.5rem 5rem",
        background: `linear-gradient(rgba(3, 17, 43, 0.85), rgba(3, 17, 43, 0.95)), url('/img/bg_3.png') center/cover no-repeat`,
      }}
    >
      <p style={{ color: "#fff", fontWeight: 600 }}>Loading…</p>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <DonationSuccessInner />
    </Suspense>
  );
}
