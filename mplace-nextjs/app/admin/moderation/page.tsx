import AdminModerationManager from "@/components/admin/AdminModerationManager"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function ModerationPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Product Moderation"
        subTitle="Review submissions, approve qualified listings, or request revisions"
        routes={[
          { path: "/admin", breadcrumbName: "Dashboard" },
          { path: "/admin/moderation", breadcrumbName: "Moderation" },
        ]}
      />
      <AdminModerationManager />
    </div>
  )
}
