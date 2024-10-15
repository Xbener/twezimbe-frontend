"use client"
import StoreContext from "@/context/user";
import { Inter } from "next/font/google";
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import "./globals.css";
import { Toaster } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Cookies from "js-cookie";
import { useSignIn } from "@/api/auth";
import AutoLogin from "@/context/AutoLogin";
const inter = Inter({ subsets: ["latin"] });

const helmetContext = {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    }
  }
})

// export const metadata: Metadata = {
//   title: "Twezimbe",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <title>Welcome to Twezimbe</title>
      <body className={inter.className}>
        <Suspense fallback={<h1>Loading ...</h1>}>
          <StoreContext>
            <QueryClientProvider client={queryClient} >
              <AutoLogin>
                <HelmetProvider context={helmetContext}>
                  <Toaster />
                  {children}
                </HelmetProvider>
              </AutoLogin>
            </QueryClientProvider>
          </StoreContext>
        </Suspense>
      </body>
    </html>
  );
}
