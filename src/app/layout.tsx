import { GoogleTranslateBootstrap } from "@/components/i18n/GoogleTranslateBootstrap";
import "@/components/i18n/google-translate.css";
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: "Caritas Rwanda CMS",
  description: "Content Management System for Caritas Rwanda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextTopLoader color="#a5280d" showSpinner={false} zIndex={99999} />
        <GoogleTranslateBootstrap />
        {children}
      </body>
    </html>
  );
}
