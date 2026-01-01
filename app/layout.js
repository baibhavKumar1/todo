import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "AI Todo Planner",
  description: "AI-powered project management tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} bg-white text-black antialiased`}
      >
        {children}
      </body>

    </html>
  );
}
