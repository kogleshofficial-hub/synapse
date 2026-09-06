import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNAPSE — Know what to do next",
  description:
    "A local-first workload planner that turns deadlines, effort and available time into a realistic schedule.",
  keywords: [
    "workload planner",
    "student planner",
    "deadline planner",
    "study planner",
    "task planning",
  ],
  verification: {
    google: "LI6z3Avdq6RsVP2faZ6nlhcbRwvnMIdjJkrSBygvnZM",
  },
  openGraph: {
    title: "SYNAPSE — Know what to do next",
    description: "Turn deadlines into a realistic plan you can actually follow.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
