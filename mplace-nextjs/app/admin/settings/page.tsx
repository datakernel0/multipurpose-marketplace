import AdminSettingsManagerNew from "@/components/admin/AdminSettingsManagerNew"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Admin Settings"
        subTitle="Update platform-wide configuration without deploying new code"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/settings", breadcrumbName: "Settings" },
        ]}
      />
      <AdminSettingsManagerNew />
    </div>
  )
}
