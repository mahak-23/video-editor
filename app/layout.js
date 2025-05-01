import Header from "@/components/layout/Header";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-[#f1f1f1]">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
