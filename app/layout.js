import localFont from "next/font/local";
import "./globals.css";

const ppNeueMontreal = localFont({
  src: [
    { path: "./fonts/ppneuemontreal-thin.otf", weight: "100", style: "normal" },
    { path: "./fonts/ppneuemontreal-book.otf", weight: "400", style: "normal" },
    { path: "./fonts/ppneuemontreal-medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/ppneuemontreal-bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-pp-neue-montreal",
  display: "swap",
});

export const metadata = {
  title: "Spendflo Videos",
  description: "Video Marketing Master Tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={ppNeueMontreal.variable}>
      <body>{children}</body>
    </html>
  );
}
