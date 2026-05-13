export const metadata = {
  title: "Robotics Fleet - Enterprise",
  description: "Manage and monitor a fleet of robots",
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
