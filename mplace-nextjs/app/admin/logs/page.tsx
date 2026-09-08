import AdminLogsManager from "@/components/admin/AdminLogsManager"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminLogsPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Audit Log"
        subTitle="Review moderation decisions and administrator actions across the marketplace"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/logs", breadcrumbName: "Audit Log" },
        ]}
      />
      <AdminLogsManager />
    </div>
  )
}
