"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";

interface VolunteerContextType {
  isModalOpen: boolean;
  openModal: (campaignId?: string | null) => void;
  closeModal: () => void;
  campaignId: string | null;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function VolunteerProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const openModal = (id: string | null = null) => {
    setCampaignId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCampaignId(null);
  };

  return (
    <VolunteerContext.Provider value={{ isModalOpen, openModal, closeModal, campaignId }}>
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteer() {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error("useVolunteer must be used within a VolunteerProvider");
  }
  return context;
}
