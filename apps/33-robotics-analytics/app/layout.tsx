export const metadata = {
  title: "Robotics Analytics - Enterprise",
  description: "Analyze robotics data, performance, and trends",
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
