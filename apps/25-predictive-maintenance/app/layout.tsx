export const metadata = {
  title: "Predictive Maintenance - Enterprise",
  description: "AI-powered equipment maintenance prediction system",
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
