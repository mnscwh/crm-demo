import "@/styles/globals.css";
import { SidebarMenu } from "@/components/SidebarMenu";
import { AICopilot } from "@/components/AICopilot";

export const metadata = {
  title: "Law Firm AI CRM",
  description: "Юридична CRM з AI-аналітикою документів та справ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-100 text-gray-900">
        <SidebarMenu />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        <AICopilot />
      </body>
    </html>
  );
}