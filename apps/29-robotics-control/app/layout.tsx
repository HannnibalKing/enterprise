export const metadata = {
  title: "Robotics Control - Enterprise",
  description: "Real-time robot control and monitoring dashboard",
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
