import AdminCustomersManager from "@/components/admin/AdminCustomersManager"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminCustomersPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Customers"
        subTitle="Track key buyers, recent activity, and lifetime value across the marketplace"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/customers", breadcrumbName: "Customers" },
        ]}
      />
      <AdminCustomersManager />
    </div>
  )
}
