import React, { PropsWithChildren } from "react";
import { Providers } from "./components/Providers";
import "./styles/globals.css";
import TabBar from "./components/TabBar";
import TabContent from "./components/TabContent";
import { SessionTabsProvider } from "./hooks/useSessionTabs";
import type { Metadata } from 'next'
import { Poppins } from "next/font/google"

export const metadata: Metadata = {
  title: 'Remote File Manager',
  description: 'Manage your remote files easily',
}

const poppins = Poppins({ subsets: ["latin"], weight: "600" })

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="/favicon.png" />
      <title>Remote File Manager</title>
      </head>
      <body className="min-h-screen">
        <Providers>
          <SessionTabsProvider>
              <TabBar />
              <TabContent />
          </SessionTabsProvider>
        </Providers>
      </body>
    </html>
  );
}
