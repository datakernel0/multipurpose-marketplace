import AdminSupportManagerNew from "@/components/admin/AdminSupportManagerNew"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminSupportPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Support Desk"
        subTitle="Monitor customer tickets, track escalations, and keep the queue moving"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/support", breadcrumbName: "Support" },
        ]}
      />
      <AdminSupportManagerNew />
    </div>
  )
}
