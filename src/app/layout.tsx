import { GoogleTranslateBootstrap } from "@/components/i18n/GoogleTranslateBootstrap";
import "@/components/i18n/google-translate.css";

export const metadata = {
  title: "Caritas Rwanda CMS",
  description: "Content Management System for Caritas Rwanda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GoogleTranslateBootstrap />
        {children}
      </body>
    </html>
  );
}
