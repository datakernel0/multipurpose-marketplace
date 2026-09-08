import Link from "next/link"

interface Product {
  id: string
  title: string
  category: {
    name: string
    slug: string
    parent?: {
      name: string
      slug: string
    } | null
  }
}

interface SingleProductBreadcrumbProps {
  product: Product
}

export default function SingleProductBreadcrumb({ product }: SingleProductBreadcrumbProps) {
  return (
    <section className="breadcrumb-area">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="breadcrumb">
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                {product.category.parent && (
                  <li>
                    <Link href={`/all-products?category=${product.category.parent.slug}`}>
                      {product.category.parent.name}
                    </Link>
                  </li>
                )}
                <li className="active">
                  <Link href={`/all-products?category=${product.category.slug}`}>{product.category.name}</Link>
                </li>
              </ul>
            </div>
            <h1 className="page-title">{product.title}</h1>
          </div>
        </div>
      </div>
    </section>
  )
}

