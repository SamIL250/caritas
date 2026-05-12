'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDonation } from "@/context/DonationContext";
import DonationModal from "./DonationModal";

export default function DonationModalWrapper() {
  const { isModalOpen, openModal, closeModal, campaignId } = useDonation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [initialError, setInitialError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('donation_cancelled') === 'true') {
      setInitialError('The donation process was not completed. If you encountered any issues or changed your mind, you can try again anytime.');
      openModal();
      
      // Clean up the URL
      const params = new URLSearchParams(searchParams);
      params.delete('donation_cancelled');
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    }
  }, [searchParams, pathname, router, openModal]);

  return (
    <DonationModal 
      isOpen={isModalOpen} 
      onClose={() => {
        closeModal();
        setInitialError(null);
      }} 
      initialCampaignId={campaignId} 
      initialError={initialError}
    />
  );
}
