export const metadata = {
  title: "Robotics Simulation - Enterprise",
  description: "Simulate robot kinematics, dynamics, and environments",
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
