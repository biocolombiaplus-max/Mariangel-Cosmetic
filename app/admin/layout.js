export const metadata = {
  title: "Panel administrativo | Mariangel Cosmetic",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-brand-blush-50">{children}</div>;
}
