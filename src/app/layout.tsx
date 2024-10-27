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
import { MyProvider } from "@/context/MyContext";
import MainLoader from "@/components/MainLoader";
import 'react-loading-skeleton/dist/skeleton.css'
import 'draft-js/dist/Draft.css';
import 'react-quill/dist/quill.snow.css';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

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
        <Suspense fallback={<MainLoader />}>
          <QueryClientProvider client={queryClient} >
            <MyProvider>
              <StoreContext>
                <AutoLogin>
                  <HelmetProvider context={helmetContext}>
                    <Toaster />
                    {children}
                  </HelmetProvider>
                </AutoLogin>
              </StoreContext>
            </MyProvider>
          </QueryClientProvider>
        </Suspense>
      </body>
    </html >
  );
}
