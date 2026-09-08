import AdminProductsManager from "@/components/admin/AdminProductsManager"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        subTitle="Manage live inventory, feature top items, or intervene when listings need attention."
        routes={[
          { breadcrumbName: "Home", path: "/admin" },
          { breadcrumbName: "Products", path: "/admin/products" },
        ]}
      />
      <AdminProductsManager />
    </>
  )
}
