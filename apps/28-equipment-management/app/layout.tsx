export const metadata = {
  title: "Equipment Management - Enterprise",
  description: "Asset lifecycle and equipment management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
