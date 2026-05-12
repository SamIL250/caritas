"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";

export default function HeroPage() {
  const [selectedPage, setSelectedPage] = useState("home");

  const pages = [
    { id: "home", title: "Home" },
    { id: "about", title: "About Us" },
    { id: "livelihoods", title: "Livelihoods" },
    { id: "health", title: "Health" },
  ];

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-0">
      <Topbar
        title="Hero Sections"
        actions={
          <Button variant="primary" className="h-9">
            Save Changes
          </Button>
        }
      />

      <div className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white sm:min-h-[min(70vh,32rem)] lg:min-h-[min(80vh,40rem)]">
        {/* Left Panel: Pages List */}
        <div className="w-[200px] border-r border-[var(--color-border-default)] bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-[var(--color-border-default)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input placeholder="Search pages..." className="pl-9 h-9" />
            </div>
          </div>
          <div className="p-2 space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedPage === page.id
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-muted)] hover:bg-stone-50 hover:text-[var(--color-text-primary)]"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Hero Form & Preview */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-page-bg)] p-6 flex flex-col xl:flex-row gap-6">
          <Card className="flex-1 xl:max-w-md h-fit">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border-default)] pb-4">
              Edit Hero Content
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">Heading</label>
                <Input defaultValue="Empowering Rwandan Communities" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">Subheading</label>
                <textarea 
                  className="w-full h-24 p-3 border border-[var(--color-border-default)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  defaultValue="Caritas Rwanda works to promote human dignity and comprehensive development of the human person."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">Background Image</label>
                <div className="border border-[var(--color-border-default)] rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-stone-100 rounded relative overflow-hidden">
                      <Image src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400&auto=format&fit=crop" alt="Hero bg" fill className="object-cover" />
                    </div>
                    <span className="text-sm text-[var(--color-text-primary)]">agriculture_project.jpg</span>
                  </div>
                  <Button variant="secondary" className="h-8 text-xs">Replace</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">CTA Button Text</label>
                  <Input defaultValue="Our Work" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">CTA Button URL</label>
                  <Input defaultValue="/what-we-do" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex-1 flex flex-col gap-2 min-h-[400px]">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider pl-2">Live Preview</h3>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-white">
              <div className="absolute inset-0 z-0">
                <Image src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400&auto=format&fit=crop" alt="Hero bg" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-12 text-white">
                <h1 className="text-4xl font-bold mb-4">Empowering Rwandan Communities</h1>
                <p className="text-lg text-stone-200 mb-8 max-w-2xl">
                  Caritas Rwanda works to promote human dignity and comprehensive development of the human person.
                </p>
                <button className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-md font-medium transition-colors">
                  Our Work
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
