import AdminLayoutWrapper from "@/components/admin/layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
