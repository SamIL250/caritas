'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DonationContextType {
  isModalOpen: boolean;
  openModal: (campaignId?: string | null) => void;
  closeModal: () => void;
  campaignId: string | null;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: ReactNode }) {
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
    <DonationContext.Provider value={{ isModalOpen, openModal, closeModal, campaignId }}>
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}
