import type { Metadata } from "next";
import "./globals.css";
import { CanvasProvider } from "@/context/CanvasContext";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";

export const metadata: Metadata = {
    title: "CSS Animation Studio",
    description: "A powerful web-based CSS animation studio",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body suppressHydrationWarning>
                <ThemeRegistry>
                    <CanvasProvider>
                        {children}
                    </CanvasProvider>
                </ThemeRegistry>
            </body>
        </html>
    );
}
