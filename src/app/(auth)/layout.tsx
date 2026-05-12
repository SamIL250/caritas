import React from "react";
import Image from "next/image";
import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-page-bg)]">
      {/* Left panel — brand (hidden on small screens; logo also shown above form on mobile) */}
      <div className="hidden lg:flex lg:w-[min(42vw,32rem)] xl:w-[min(40vw,36rem)] flex-col justify-between bg-[var(--color-primary)] p-10 text-white relative overflow-hidden min-h-0">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="relative z-10 auth-left-enter">
          <div className="inline-block rounded-lg bg-white p-2.5 sm:p-3 ring-1 ring-white/40">
            <Image
              src="/logo_bg.png"
              alt="Caritas Rwanda"
              width={220}
              height={72}
              className="h-9 w-auto sm:h-10 object-contain object-left"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 space-y-4 auth-left-enter max-w-md">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Content Management
            <br />
            System
          </h1>
          <p className="text-white/75 text-sm leading-relaxed">
            Manage your website content, media, donations, and more — all from one centralized
            dashboard.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/45 text-xs">
            &copy; {new Date().getFullYear()} Caritas Rwanda. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 min-h-[100dvh]">
        {children}
      </div>
    </div>
  );
}
