export const metadata = {
  title: "Supply Optimization - Enterprise",
  description: "Inventory and supply chain optimization system",
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
