export const metadata = {
  title: "Robotics Vision - Enterprise",
  description: "Computer vision and image processing for robotics",
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
