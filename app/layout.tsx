import "./globals.css";
import { Public_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { SessionProvider } from "next-auth/react";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AI SaaS Platform</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="AI-powered SaaS platform with document management, chat, and intelligent search capabilities."
        />
        <meta property="og:title" content="AI SaaS Platform" />
        <meta
          property="og:description"
          content="AI-powered SaaS platform with document management, chat, and intelligent search capabilities."
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI SaaS Platform" />
        <meta
          name="twitter:description"
          content="AI-powered SaaS platform with document management, chat, and intelligent search capabilities."
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <SessionProvider>
          <NuqsAdapter>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Main Content Area */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <Header />
                
                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-background">
                  <div className="container mx-auto p-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </NuqsAdapter>
        </SessionProvider>
      </body>
    </html>
  );
}
