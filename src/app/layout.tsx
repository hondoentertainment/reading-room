import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const themeBoot = `(function(){try{var t=localStorage.getItem("krr-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "Kyle's Reading Room",
    template: "%s · Kyle's Reading Room",
  },
  description:
    "A personal shelf for essays worth keeping: links to the originals, a little context, and room for your own notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${display.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
