import AdminSellersManager from "@/components/admin/AdminSellersManager"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminSellersPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Sellers"
        subTitle="Review seller applications and manage account status"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/sellers", breadcrumbName: "Sellers" },
        ]}
      />
      <AdminSellersManager />
    </div>
  )
}
