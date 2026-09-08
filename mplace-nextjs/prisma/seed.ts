import { PrismaClient, SystemSettingGroup, SystemSettingType, SellerStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const seedDemoData = process.env.SEED_DEMO_DATA === 'true'

async function main() {
  const adminRoleIds: Record<string, string> = {}

  // Demo cleanup is opt-in. Production bootstrap must never wipe marketplace data.
  if (seedDemoData) {
    await prisma.moderationAction.deleteMany()
    await prisma.adminRoleAssignment.deleteMany()
    await prisma.adminRolePermission.deleteMany()
    await prisma.adminRole.deleteMany()
    await prisma.adminPermission.deleteMany()
    await prisma.forumReply.deleteMany()
    await prisma.forumThread.deleteMany()
    await prisma.blogComment.deleteMany()
    await prisma.blog.deleteMany()
    await prisma.eventSpeaker.deleteMany()
    await prisma.event.deleteMany()
    await prisma.job.deleteMany()
    await prisma.fAQ.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.termCondition.deleteMany()
    await prisma.badge.deleteMany()
    await prisma.careerFeature.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany({ where: { email: { not: 'admin@martplace.com' } } })
  }

  // Create default admin user
  // IMPORTANT: Change the default password after first login!
  // In production, DEFAULT_ADMIN_PASSWORD environment variable is REQUIRED
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD
  if (!defaultPassword) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DEFAULT_ADMIN_PASSWORD environment variable is required in production')
    }
    // Only allow default password in development
    console.warn('⚠️  WARNING: Using default password "admin123". Set DEFAULT_ADMIN_PASSWORD environment variable in production!')
  }
  const adminPassword = defaultPassword || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@martplace.com' },
    update: {},
    create: {
      email: 'admin@martplace.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPERADMIN',
      image: '/images/usr_avatar.png',
    },
  })

  if (!seedDemoData) {
    console.log('Production bootstrap complete. Demo users and marketplace content were skipped.')
    return
  }

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@martplace.com' },
    update: {},
    create: {
      email: 'user1@martplace.com',
      name: 'John Smith',
      password: hashedPassword,
      role: 'SELLER',
      image: '/images/usr_avatar.png',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@martplace.com' },
    update: {},
    create: {
      email: 'user2@martplace.com',
      name: 'Mitesh Chavda',
      password: hashedPassword,
      role: 'USER',
      image: '/images/support_avat1.png',
    },
  })

  // Create additional seller users
  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@martplace.com' },
    update: {},
    create: {
      email: 'seller1@martplace.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'SELLER',
      username: 'sarahjohnson',
      bio: 'Professional WordPress developer with 10+ years of experience',
      image: '/images/usr_avatar.png',
      sellerStatus: 'APPROVED' as SellerStatus,
    },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@martplace.com' },
    update: {},
    create: {
      email: 'seller2@martplace.com',
      name: 'Michael Chen',
      password: hashedPassword,
      role: 'SELLER',
      username: 'michaelchen',
      bio: 'React and Next.js expert creating modern web applications',
      image: '/images/usr_avatar.png',
      sellerStatus: 'APPROVED' as SellerStatus,
    },
  })

  const seller3 = await prisma.user.upsert({
    where: { email: 'seller3@martplace.com' },
    update: {},
    create: {
      email: 'seller3@martplace.com',
      name: 'Emily Rodriguez',
      password: hashedPassword,
      role: 'SELLER',
      username: 'emilyrodriguez',
      bio: 'UI/UX designer specializing in modern web templates',
      image: '/images/usr_avatar.png',
      sellerStatus: 'APPROVED' as SellerStatus,
    },
  })

  const seller4 = await prisma.user.upsert({
    where: { email: 'seller4@martplace.com' },
    update: {},
    create: {
      email: 'seller4@martplace.com',
      name: 'David Kim',
      password: hashedPassword,
      role: 'SELLER',
      username: 'davidkim',
      bio: 'Full-stack developer creating premium digital products',
      image: '/images/usr_avatar.png',
      sellerStatus: 'APPROVED' as SellerStatus,
    },
  })

  // Create sellers with different statuses for testing
  const seller5 = await prisma.user.upsert({
    where: { email: 'seller5@martplace.com' },
    update: {},
    create: {
      email: 'seller5@martplace.com',
      name: 'Alex Thompson',
      password: hashedPassword,
      role: 'SELLER',
      username: 'alexthompson',
      bio: 'Mobile app developer specializing in React Native',
      image: '/images/usr_avatar.png',
      sellerStatus: 'PENDING_REVIEW' as SellerStatus,
      country: 'United States',
    },
  })

  const seller6 = await prisma.user.upsert({
    where: { email: 'seller6@martplace.com' },
    update: {},
    create: {
      email: 'seller6@martplace.com',
      name: 'Lisa Wang',
      password: hashedPassword,
      role: 'SELLER',
      username: 'lisawang',
      bio: 'Graphic designer creating modern UI kits',
      image: '/images/usr_avatar.png',
      sellerStatus: 'PENDING_REVIEW' as SellerStatus,
      country: 'Canada',
    },
  })

  const seller7 = await prisma.user.upsert({
    where: { email: 'seller7@martplace.com' },
    update: {},
    create: {
      email: 'seller7@martplace.com',
      name: 'James Wilson',
      password: hashedPassword,
      role: 'SELLER',
      username: 'jameswilson',
      bio: 'Backend developer creating API solutions',
      image: '/images/usr_avatar.png',
      sellerStatus: 'REJECTED' as SellerStatus,
      country: 'United Kingdom',
      sellerVerificationNotes: 'Incomplete profile information',
    },
  })

  const seller8 = await prisma.user.upsert({
    where: { email: 'seller8@martplace.com' },
    update: {},
    create: {
      email: 'seller8@martplace.com',
      name: 'Maria Garcia',
      password: hashedPassword,
      role: 'SELLER',
      username: 'mariagarcia',
      bio: 'Frontend developer creating Vue.js templates',
      image: '/images/usr_avatar.png',
      sellerStatus: 'SUSPENDED' as SellerStatus,
      country: 'Spain',
      sellerVerificationNotes: 'Account suspended due to policy violations',
    },
  })

  const seller9 = await prisma.user.upsert({
    where: { email: 'seller9@martplace.com' },
    update: {},
    create: {
      email: 'seller9@martplace.com',
      name: 'Robert Brown',
      password: hashedPassword,
      role: 'SELLER',
      username: 'robertbrown',
      bio: 'E-commerce specialist creating Shopify themes',
      image: '/images/usr_avatar.png',
      sellerStatus: 'PENDING_REVIEW' as SellerStatus,
      country: 'Australia',
    },
  })

  const seller10 = await prisma.user.upsert({
    where: { email: 'seller10@martplace.com' },
    update: {},
    create: {
      email: 'seller10@martplace.com',
      name: 'Sophie Martin',
      password: hashedPassword,
      role: 'SELLER',
      username: 'sophiemartin',
      bio: 'Content creator and digital marketer',
      image: '/images/usr_avatar.png',
      sellerStatus: 'APPROVED' as SellerStatus,
      country: 'France',
      sellerVerifiedAt: new Date(),
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'wordpress' },
      update: {},
      create: {
        name: 'WordPress',
        slug: 'wordpress',
        description: 'WordPress themes and plugins',
        image: '/images/catword.png',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'html' },
      update: {},
      create: {
        name: 'HTML',
        slug: 'html',
        description: 'HTML templates',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mockup' },
      update: {},
      create: {
        name: 'Mockup',
        slug: 'mockup',
        description: 'Design mockups',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'react' },
      update: {},
      create: {
        name: 'React',
        slug: 'react',
        description: 'React components, templates, and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: {
        name: 'Next.js',
        slug: 'nextjs',
        description: 'Next.js templates and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'svelte' },
      update: {},
      create: {
        name: 'Svelte',
        slug: 'svelte',
        description: 'Svelte components and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'django' },
      update: {},
      create: {
        name: 'Django',
        slug: 'django',
        description: 'Django projects and templates',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'laravel' },
      update: {},
      create: {
        name: 'Laravel',
        slug: 'laravel',
        description: 'Laravel projects and packages',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vue' },
      update: {},
      create: {
        name: 'Vue.js',
        slug: 'vue',
        description: 'Vue.js components and templates',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'angular' },
      update: {},
      create: {
        name: 'Angular',
        slug: 'angular',
        description: 'Angular components and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node.js packages and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'express' },
      update: {},
      create: {
        name: 'Express.js',
        slug: 'express',
        description: 'Express.js templates and boilerplates',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'python' },
      update: {},
      create: {
        name: 'Python',
        slug: 'python',
        description: 'Python scripts and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'php' },
      update: {},
      create: {
        name: 'PHP',
        slug: 'php',
        description: 'PHP scripts and applications',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript libraries and scripts',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: {
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TypeScript projects and libraries',
      },
    }),
  ])

  const adminPermissionData = [
    {
      key: 'moderation.products.review',
      description: 'Review submitted products before publication.',
      category: 'moderation.products',
    },
    {
      key: 'moderation.products.escalate',
      description: 'Escalate product submissions for additional review.',
      category: 'moderation.products',
    },
    {
      key: 'moderation.sellers.review',
      description: 'Review and approve seller accounts.',
      category: 'moderation.sellers',
    },
    {
      key: 'users.manage',
      description: 'Manage all marketplace users.',
      category: 'users',
    },
    {
      key: 'support.tickets.manage',
      description: 'Manage customer support tickets.',
      category: 'support',
    },
    {
      key: 'reports.view.financial',
      description: 'View financial reports and metrics.',
      category: 'reports',
    },
    {
      key: 'reports.view.operations',
      description: 'View operational reports and analytics.',
      category: 'reports',
    },
    {
      key: 'billing.view',
      description: 'View billing and payout information.',
      category: 'billing',
    },
    {
      key: 'support.tickets.view',
      description: 'View support tickets.',
      category: 'support',
    },
    {
      key: 'users.view',
      description: 'View user accounts and profiles.',
      category: 'users',
    },
  ]

  const permissionRecords = await Promise.all(
    adminPermissionData.map((permission) =>
      prisma.adminPermission.upsert({
        where: { key: permission.key },
        update: {
          description: permission.description,
          category: permission.category,
        },
        create: permission,
      })
    )
  )

  const permissionMap = new Map(permissionRecords.map((permission) => [permission.key, permission.id]))

  const rolesSeed = [
    {
      name: 'Super Admin',
      description: 'Full access to all administrative operations.',
      level: 100,
      isSystem: true,
      permissions: adminPermissionData.map((permission) => permission.key),
    },
    {
      name: 'Platform Admin',
      description: 'Manages core marketplace operations and users.',
      level: 80,
      isSystem: false,
      permissions: [
        'moderation.products.review',
        'moderation.products.escalate',
        'moderation.sellers.review',
        'users.manage',
        'support.tickets.manage',
        'reports.view.financial',
        'reports.view.operations',
        'billing.view',
      ],
    },
    {
      name: 'Content Moderator',
      description: 'Reviews product submissions and seller compliance.',
      level: 60,
      isSystem: false,
      permissions: [
        'moderation.products.review',
        'moderation.products.escalate',
        'moderation.sellers.review',
        'support.tickets.view',
      ],
    },
    {
      name: 'Support Specialist',
      description: 'Handles customer support and basic account inquiries.',
      level: 50,
      isSystem: false,
      permissions: [
        'support.tickets.manage',
        'users.view',
      ],
    },
    {
      name: 'Finance Analyst',
      description: 'Monitors financial performance and payouts.',
      level: 40,
      isSystem: false,
      permissions: [
        'billing.view',
        'reports.view.financial',
      ],
    },
  ]

  const roleRecords = []
  for (const roleSeed of rolesSeed) {
    const roleRecord = await prisma.adminRole.upsert({
      where: { name: roleSeed.name },
      update: {
        description: roleSeed.description,
        level: roleSeed.level,
        isSystem: roleSeed.isSystem,
      },
      create: {
        name: roleSeed.name,
        description: roleSeed.description,
        level: roleSeed.level,
        isSystem: roleSeed.isSystem,
      },
    })

    await prisma.adminRolePermission.deleteMany({ where: { roleId: roleRecord.id } })

    const permissionIds = roleSeed.permissions
      .map((key) => permissionMap.get(key))
      .filter((id): id is string => Boolean(id))

    if (permissionIds.length > 0) {
      await prisma.adminRolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: roleRecord.id,
          permissionId,
        })),
      })
    }

    roleRecords.push(roleRecord)
  }

  const superAdminRole = roleRecords.find((role) => role.name === 'Super Admin')
  if (superAdminRole) {
    await prisma.adminRoleAssignment.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        assignedById: adminUser.id,
      },
    })
  }

  const moderatorRole = roleRecords.find((role) => role.name === 'Content Moderator')
  if (moderatorRole) {
    await prisma.adminRoleAssignment.create({
      data: {
        userId: user1.id,
        roleId: moderatorRole.id,
        assignedById: adminUser.id,
      },
    })
  }

  const supportRole = roleRecords.find((role) => role.name === 'Support Specialist')
  if (supportRole) {
    await prisma.adminRoleAssignment.create({
      data: {
        userId: user2.id,
        roleId: supportRole.id,
        assignedById: adminUser.id,
      },
    })
  }

  // Available product images and screenshots
  const productImages = [
    '/images/p1.jpg',
    '/images/p2.jpg',
    '/images/p3.jpg',
    '/images/p4.jpg',
    '/images/p5.jpg',
    '/images/p6.jpg',
    '/images/p7.jpg',
    '/images/p8.jpg',
    '/images/featprod.jpg',
    '/images/prodthumb.jpg',
    '/images/prodthumb2.jpg',
    '/images/prodthumb3.jpg',
  ]

  // Available screenshot images
  const screenshotImages = [
    '/images/itprv.jpg',
    '/images/itprv2.jpg',
    '/images/lp1.jpg',
    '/images/lp2.jpg',
    '/images/lp3.jpg',
    '/images/lp4.jpg',
    '/images/lp5.jpg',
    '/images/lp6.jpg',
    '/images/pl1.jpg',
    '/images/pl2.jpg',
    '/images/pl3.jpg',
    '/images/pl4.jpg',
    '/images/pl5.jpg',
    '/images/pl6.jpg',
    '/images/ov1.jpg',
    '/images/ov2.jpg',
    '/images/ov3.jpg',
    '/images/capro1.jpg',
    '/images/capro2.jpg',
    '/images/sp2.jpg',
    '/images/sp3.jpg',
    '/images/pur1.jpg',
    '/images/pur2.jpg',
    '/images/pur3.jpg',
    '/images/pur4.jpg',
    '/images/pur5.jpg',
  ]

  // Helper function to get main product image by index
  const getProductImage = (index: number) => productImages[index % productImages.length]

  // Helper function to get multiple screenshots for a product (3-5 screenshots)
  const getProductScreenshots = (index: number, count: number = 4): string[] => {
    const screenshots: string[] = []
    for (let i = 0; i < count; i++) {
      const screenshotIndex = (index * count + i) % screenshotImages.length
      screenshots.push(screenshotImages[screenshotIndex])
    }
    return screenshots
  }

  // Create comprehensive product list
  const productData = [
    // WordPress Products
    {
      title: 'Finance and Consulting Business Theme',
      slug: 'finance-consulting-business-theme',
      description: 'A professional WordPress theme designed for finance and consulting businesses. Features modern design, responsive layout, and custom post types for services and testimonials.',
      price: 60,
      salePrice: 45,
      images: [getProductImage(0), ...getProductScreenshots(0)],
      categorySlug: 'wordpress',
      sellerId: user1.id,
      featured: true,
      downloads: 234,
      views: 1200,
      rating: 4.5,
      tags: 'wordpress, business, finance, consulting, responsive',
      filesIncluded: ['PHP', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/finance-theme',
    },
    {
      title: 'Flounce - Multipurpose OpenCart Theme',
      slug: 'flounce-multipurpose-opencart-theme',
      description: 'A versatile OpenCart theme perfect for any e-commerce store. Includes multiple homepage layouts, product quick view, and advanced filtering options.',
      price: 60,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'wordpress',
      sellerId: user1.id,
      featured: true,
      downloads: 156,
      views: 890,
      rating: 4.2,
      tags: 'opencart, ecommerce, multipurpose, shop',
      filesIncluded: ['PHP', 'CSS', 'JS', 'XML'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    {
      title: 'Elegant Restaurant WordPress Theme',
      slug: 'elegant-restaurant-wordpress-theme',
      description: 'Beautiful WordPress theme for restaurants, cafes, and food businesses. Features online menu, reservation system, and gallery showcase.',
      price: 49,
      salePrice: 35,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'wordpress',
      sellerId: seller1.id,
      featured: false,
      downloads: 89,
      views: 456,
      rating: 4.7,
      tags: 'wordpress, restaurant, food, menu',
      filesIncluded: ['PHP', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari'],
    },
    {
      title: 'Corporate Business WordPress Theme',
      slug: 'corporate-business-wordpress-theme',
      description: 'Professional corporate theme with portfolio, team, and services sections. Perfect for agencies and businesses.',
      price: 55,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'wordpress',
      sellerId: seller1.id,
      featured: true,
      downloads: 201,
      views: 1100,
      rating: 4.6,
      tags: 'wordpress, corporate, business, portfolio',
      filesIncluded: ['PHP', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // React Products
    {
      title: 'Modern Dashboard React Template',
      slug: 'modern-dashboard-react-template',
      description: 'A complete React dashboard template with charts, tables, and admin panels. Built with Material-UI and includes authentication.',
      price: 75,
      salePrice: 59,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'react',
      sellerId: seller2.id,
      featured: true,
      downloads: 312,
      views: 1500,
      rating: 4.8,
      tags: 'react, dashboard, admin, material-ui',
      filesIncluded: ['JSX', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/react-dashboard',
    },
    {
      title: 'E-Commerce React Application',
      slug: 'ecommerce-react-application',
      description: 'Full-featured e-commerce React app with shopping cart, checkout, and product management. Includes Redux for state management.',
      price: 89,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'react',
      sellerId: seller2.id,
      featured: true,
      downloads: 278,
      views: 1800,
      rating: 4.9,
      tags: 'react, ecommerce, redux, shopping',
      filesIncluded: ['JSX', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/react-ecommerce',
    },
    {
      title: 'Social Media React Component Library',
      slug: 'social-media-react-component-library',
      description: 'Collection of reusable React components for building social media features: posts, comments, likes, and feeds.',
      price: 45,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'react',
      sellerId: seller2.id,
      featured: false,
      downloads: 145,
      views: 678,
      rating: 4.4,
      tags: 'react, components, social, library',
      filesIncluded: ['JSX', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari'],
    },
    // Next.js Products
    {
      title: 'Next.js Blog Template',
      slug: 'nextjs-blog-template',
      description: 'SEO-optimized Next.js blog template with markdown support, categories, tags, and search functionality.',
      price: 65,
      salePrice: 49,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'nextjs',
      sellerId: seller2.id,
      featured: true,
      downloads: 234,
      views: 1200,
      rating: 4.7,
      tags: 'nextjs, blog, seo, markdown',
      filesIncluded: ['TSX', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/nextjs-blog',
    },
    {
      title: 'Next.js Portfolio Website',
      slug: 'nextjs-portfolio-website',
      description: 'Modern portfolio website built with Next.js, featuring project showcase, about section, and contact form.',
      price: 55,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'nextjs',
      sellerId: seller2.id,
      featured: false,
      downloads: 167,
      views: 890,
      rating: 4.5,
      tags: 'nextjs, portfolio, showcase',
      filesIncluded: ['TSX', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // HTML Products
    {
      title: 'Responsive HTML5 Landing Page',
      slug: 'responsive-html5-landing-page',
      description: 'Modern, responsive HTML5 landing page template with smooth animations and mobile-first design.',
      price: 25,
      salePrice: 19,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'html',
      sellerId: seller3.id,
      featured: true,
      downloads: 456,
      views: 2100,
      rating: 4.6,
      tags: 'html5, landing, responsive, mobile',
      filesIncluded: ['HTML', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/html-landing',
    },
    {
      title: 'Corporate HTML Template',
      slug: 'corporate-html-template',
      description: 'Professional corporate HTML template with multiple page layouts, contact forms, and team sections.',
      price: 35,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'html',
      sellerId: seller3.id,
      featured: false,
      downloads: 234,
      views: 1100,
      rating: 4.4,
      tags: 'html, corporate, business',
      filesIncluded: ['HTML', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    {
      title: 'E-Commerce HTML Template',
      slug: 'ecommerce-html-template',
      description: 'Complete e-commerce HTML template with product pages, shopping cart, and checkout flow.',
      price: 42,
      salePrice: 32,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'html',
      sellerId: seller3.id,
      featured: true,
      downloads: 389,
      views: 1900,
      rating: 4.8,
      tags: 'html, ecommerce, shop, cart',
      filesIncluded: ['HTML', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // Vue.js Products
    {
      title: 'Vue.js Admin Dashboard',
      slug: 'vuejs-admin-dashboard',
      description: 'Complete Vue.js admin dashboard with Vuex, Vue Router, and comprehensive UI components.',
      price: 70,
      salePrice: 55,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'vue',
      sellerId: seller4.id,
      featured: true,
      downloads: 267,
      views: 1400,
      rating: 4.7,
      tags: 'vue, dashboard, admin, vuex',
      filesIncluded: ['VUE', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/vue-dashboard',
    },
    {
      title: 'Vue.js E-Commerce Store',
      slug: 'vuejs-ecommerce-store',
      description: 'Full-featured Vue.js e-commerce application with product catalog, cart, and user authentication.',
      price: 85,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'vue',
      sellerId: seller4.id,
      featured: true,
      downloads: 198,
      views: 1200,
      rating: 4.9,
      tags: 'vue, ecommerce, store, shopping',
      filesIncluded: ['VUE', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // Angular Products
    {
      title: 'Angular Material Dashboard',
      slug: 'angular-material-dashboard',
      description: 'Modern Angular dashboard built with Angular Material, featuring responsive design and Material Design components.',
      price: 80,
      salePrice: 65,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'angular',
      sellerId: seller4.id,
      featured: true,
      downloads: 189,
      views: 950,
      rating: 4.6,
      tags: 'angular, material, dashboard, admin',
      filesIncluded: ['TS', 'HTML', 'CSS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      livePreviewUrl: 'https://demo.example.com/angular-dashboard',
    },
    // Node.js Products
    {
      title: 'Node.js REST API Boilerplate',
      slug: 'nodejs-rest-api-boilerplate',
      description: 'Production-ready Node.js REST API with Express, authentication, validation, and database integration.',
      price: 50,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'nodejs',
      sellerId: seller4.id,
      featured: false,
      downloads: 312,
      views: 1500,
      rating: 4.8,
      tags: 'nodejs, api, express, rest',
      filesIncluded: ['JS', 'JSON'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    {
      title: 'Express.js Authentication System',
      slug: 'expressjs-authentication-system',
      description: 'Complete authentication system for Express.js with JWT, password reset, email verification, and social login.',
      price: 45,
      salePrice: 35,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'express',
      sellerId: seller4.id,
      featured: true,
      downloads: 278,
      views: 1300,
      rating: 4.7,
      tags: 'express, auth, jwt, login',
      filesIncluded: ['JS', 'JSON'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // Laravel Products
    {
      title: 'Laravel E-Commerce Package',
      slug: 'laravel-ecommerce-package',
      description: 'Complete Laravel e-commerce package with products, cart, checkout, orders, and admin panel.',
      price: 95,
      salePrice: 75,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'laravel',
      sellerId: seller1.id,
      featured: true,
      downloads: 145,
      views: 800,
      rating: 4.9,
      tags: 'laravel, ecommerce, php, package',
      filesIncluded: ['PHP', 'BLADE', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // Python Products
    {
      title: 'Django Blog Application',
      slug: 'django-blog-application',
      description: 'Full-featured Django blog application with admin panel, comments, categories, and tags.',
      price: 60,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'django',
      sellerId: seller1.id,
      featured: false,
      downloads: 198,
      views: 1000,
      rating: 4.6,
      tags: 'django, blog, python, cms',
      filesIncluded: ['PY', 'HTML', 'CSS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    {
      title: 'Django E-Commerce Platform',
      slug: 'django-ecommerce-platform',
      description: 'Complete Django e-commerce platform with payment integration, inventory management, and admin dashboard.',
      price: 88,
      salePrice: 70,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'django',
      sellerId: seller1.id,
      featured: true,
      downloads: 167,
      views: 950,
      rating: 4.8,
      tags: 'django, ecommerce, python, payment',
      filesIncluded: ['PY', 'HTML', 'CSS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // JavaScript Products
    {
      title: 'Vanilla JavaScript UI Components',
      slug: 'vanilla-javascript-ui-components',
      description: 'Collection of modern, lightweight UI components built with vanilla JavaScript - no dependencies.',
      price: 30,
      salePrice: 22,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'javascript',
      sellerId: seller3.id,
      featured: true,
      downloads: 423,
      views: 2000,
      rating: 4.7,
      tags: 'javascript, components, ui, vanilla',
      filesIncluded: ['JS', 'CSS', 'HTML'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // TypeScript Products
    {
      title: 'TypeScript Utility Library',
      slug: 'typescript-utility-library',
      description: 'Comprehensive TypeScript utility library with type-safe functions for common operations.',
      price: 35,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'typescript',
      sellerId: seller2.id,
      featured: false,
      downloads: 256,
      views: 1200,
      rating: 4.5,
      tags: 'typescript, utilities, library',
      filesIncluded: ['TS', 'JS'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    },
    // Mockup Products
    {
      title: 'iPhone 14 Pro Mockup Set',
      slug: 'iphone-14-pro-mockup-set',
      description: 'High-quality iPhone 14 Pro mockup set with multiple angles and perspectives. Perfect for app showcases.',
      price: 20,
      salePrice: 15,
      images: [getProductImage(1), ...getProductScreenshots(1)],
      categorySlug: 'mockup',
      sellerId: seller3.id,
      featured: true,
      downloads: 567,
      views: 2500,
      rating: 4.9,
      tags: 'mockup, iphone, app, design',
      filesIncluded: ['PSD', 'AI', 'PNG'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari'],
      highResolution: 'yes',
      retinaReady: 'yes',
    },
    {
      title: 'Laptop Mockup Collection',
      slug: 'laptop-mockup-collection',
      description: 'Professional laptop mockup collection with various angles and lighting conditions. Includes PSD and AI files.',
      price: 25,
      images: [getProductImage(2), ...getProductScreenshots(2)],
      categorySlug: 'mockup',
      sellerId: seller3.id,
      featured: false,
      downloads: 389,
      views: 1800,
      rating: 4.7,
      tags: 'mockup, laptop, design, psd',
      filesIncluded: ['PSD', 'AI', 'PNG'],
      compatibleBrowsers: ['Chrome', 'Firefox', 'Safari'],
      highResolution: 'yes',
      retinaReady: 'yes',
    },
  ]

  // Get category map for quick lookup
  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.id]))

  // Create all products
  const products = await Promise.all(
    productData.map((product, index) => {
      const categoryId = categoryMap.get(product.categorySlug) || categories[0].id
      // Use all images from product data (main image + screenshots)
      const productImages = product.images.length > 0 
        ? product.images 
        : [getProductImage(index), ...getProductScreenshots(index)]
      return prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          title: product.title,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          images: productImages,
          categoryId,
          sellerId: product.sellerId,
          status: 'PUBLISHED',
          moderationStatus: 'APPROVED',
          featured: product.featured,
          downloads: product.downloads,
          views: product.views,
          rating: product.rating,
          tags: product.tags,
          filesIncluded: product.filesIncluded,
          compatibleBrowsers: product.compatibleBrowsers,
          livePreviewUrl: product.livePreviewUrl,
          highResolution: product.highResolution,
          retinaReady: product.retinaReady,
        },
        create: {
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          images: productImages,
          categoryId,
          sellerId: product.sellerId,
          status: 'PUBLISHED',
          moderationStatus: 'APPROVED',
          featured: product.featured,
          downloads: product.downloads,
          views: product.views,
          rating: product.rating,
          tags: product.tags,
          filesIncluded: product.filesIncluded,
          compatibleBrowsers: product.compatibleBrowsers,
          livePreviewUrl: product.livePreviewUrl,
          highResolution: product.highResolution,
          retinaReady: product.retinaReady,
        },
      })
    })
  )

  // Create blogs
  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        title: 'Web Design Trends in 2019',
        slug: 'web-design-trends-in-2019-1',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p><p>This is a comprehensive article about web design trends in 2019.</p>',
        image: '/images/blog1.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'The best advices to start your own project',
        slug: 'best-advices-start-own-project-1',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog2.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Best Related Post Plugin',
        slug: 'best-related-post-plugin-1',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog3.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Web Design Trends in 2019',
        slug: 'web-design-trends-in-2019-2',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog4.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'The best advices to start your own project',
        slug: 'best-advices-start-own-project-2',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog5.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Best Related Post Plugin',
        slug: 'best-related-post-plugin-2',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog6.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Web Design Trends in 2019',
        slug: 'web-design-trends-in-2019-3',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog1.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'The best advices to start your own project',
        slug: 'best-advices-start-own-project-3',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog2.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Best Related Post Plugin',
        slug: 'best-related-post-plugin-3',
        excerpt: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.',
        content: '<p>Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet congue.</p>',
        image: '/images/blog3.jpg',
        authorId: adminUser.id,
        views: 345,
        commentCount: 45,
        publishedAt: new Date('2019-02-24'),
      },
    }),
  ])

  // Create blog comments
  await prisma.blogComment.createMany({
    data: [
      {
        blogId: blogs[0].id,
        name: 'John Doe',
        email: 'john@example.com',
        content: 'Great article! Very informative.',
      },
      {
        blogId: blogs[0].id,
        name: 'Jane Smith',
        email: 'jane@example.com',
        content: 'Thanks for sharing this.',
      },
    ],
  })

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'MartPlace Upcoming Event in Bangladesh',
        slug: 'martplace-event-bangladesh',
        description: 'Join us for an exciting event in Bangladesh',
        image: '/images/ev1.jpg',
        date: 'May 17-19, 2019',
        location: 'Dhaka, Bangladesh',
        featured: true,
        targetDate: new Date('2019-05-17'),
      },
    }),
    prisma.event.create({
      data: {
        title: 'Web Design Conference in California',
        slug: 'web-design-conference-california',
        image: '/images/ev2.jpg',
        date: 'May 17-19, 2019',
        location: 'California',
        featured: false,
        targetDate: new Date('2019-05-17'),
      },
    }),
    prisma.event.create({
      data: {
        title: 'The Tech Convention in Melbourne',
        slug: 'tech-convention-melbourne',
        image: '/images/ev3.jpg',
        date: 'May 17-19, 2019',
        location: 'Melbourne',
        featured: false,
        targetDate: new Date('2019-05-17'),
      },
    }),
    prisma.event.create({
      data: {
        title: 'Web Seminar Company Presentation',
        slug: 'web-seminar-company-presentation',
        image: '/images/ev4.jpg',
        date: 'May 17-19, 2019',
        location: 'New York',
        featured: false,
        targetDate: new Date('2019-05-17'),
      },
    }),
  ])

  // Create event speakers
  await prisma.eventSpeaker.createMany({
    data: [
      {
        eventId: events[0].id,
        name: 'John Speaker',
        title: 'Tech Lead',
        image: '/images/speaker1.jpg',
        bio: 'Expert in web technologies',
      },
      {
        eventId: events[0].id,
        name: 'Jane Speaker',
        title: 'Design Director',
        image: '/images/speaker2.jpg',
        bio: 'Creative design professional',
      },
    ],
  })

  // Create jobs
  await prisma.job.createMany({
    data: [
      {
        title: 'Senior Wordpress Developer Required',
        slug: 'senior-wordpress-developer',
        description: 'We are looking for an experienced WordPress developer.',
        location: 'New York City',
        type: 'Full Time',
        typeClass: 'pcolorbg',
        requirements: '5+ years experience in WordPress development',
      },
      {
        title: 'Front End Developer Required',
        slug: 'front-end-developer',
        description: 'Join our front-end development team.',
        location: 'New York City',
        type: 'Part Time',
        typeClass: 'mcolorbg1',
      },
      {
        title: 'Ruby Developer, Platform Group',
        slug: 'ruby-developer-platform',
        description: 'Looking for Ruby developers for our platform team.',
        location: 'New York City',
        type: 'Remotely',
        typeClass: 'scolorbg',
      },
      {
        title: 'Talent Acquisition Manager',
        slug: 'talent-acquisition-manager',
        description: 'We need an experienced talent acquisition manager.',
        location: 'New York City',
        type: 'Full Time',
        typeClass: 'pcolorbg',
      },
      {
        title: 'Senior Wordpress Developer Required',
        slug: 'senior-wordpress-developer-2',
        description: 'Another opportunity for WordPress developers.',
        location: 'New York City',
        type: 'Full Time',
        typeClass: 'pcolorbg',
      },
      {
        title: 'Front End Developer Required',
        slug: 'front-end-developer-2',
        description: 'Front-end developer position available.',
        location: 'New York City',
        type: 'Full Time',
        typeClass: 'mcolorbg1',
      },
    ],
  })

  // Create FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'How to write the changelog for theme updates?',
        answer: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher.',
        category: 'For Authors',
        order: 1,
      },
      {
        question: 'Why do I need to login to purchase an item on DigiPro?',
        answer: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.',
        category: 'For Authors',
        order: 2,
      },
      {
        question: 'How to create an account on DigiPro?',
        answer: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.',
        category: 'For Authors',
        order: 3,
      },
      {
        question: 'Do you recommend using a download manager software?',
        answer: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.',
        category: 'For Authors',
        order: 4,
      },
      {
        question: 'How to purchase an item on DigiPro?',
        answer: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut sceleris que the mattis, leo quam aliquet congue placerat mi id nisi interdum mollis.',
        category: 'For Authors',
        order: 5,
      },
    ],
  })

  // Testimonials are intentionally not seeded; the model remains for later schema review.
  if (false) await prisma.testimonial.createMany({
    data: [
      {
        name: 'Tubeda Pagla',
        designation: 'Product Designer',
        text: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.',
        avatar: '/images/test1.jpg',
        rating: 5,
        order: 1,
      },
      {
        name: 'Tarashi Hamada',
        designation: 'Quality Ninja',
        text: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.',
        avatar: '/images/test2.jpg',
        rating: 5,
        order: 2,
      },
      {
        name: 'Tubeda Pagla',
        designation: 'Product Designer',
        text: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.',
        avatar: '/images/test1.jpg',
        rating: 5,
        order: 3,
      },
      {
        name: 'Tarashi Hamada',
        designation: 'Quality Ninja',
        text: 'Nunc placerat mi id nisi interdum mollis. Praesent pharetra, justo ut scelerisque the mattis, leo quam aliquet diam congue is the laoreet elit metus. Nunc placerat mi is id nisi interdum is mollis. Praesent the pharetra, justo ut scelerisque.',
        avatar: '/images/test2.jpg',
        rating: 5,
        order: 4,
      },
    ],
  })

  // Create forum threads
  const forumThreads = await Promise.all([
    prisma.forumThread.create({
      data: {
        title: 'Responsive website footer menu',
        slug: 'responsive-website-footer-menu',
        content: 'I need help with making my website footer menu responsive.',
        authorId: user2.id,
        tag: 'item discussion',
        isPinned: true,
        votes: 2,
        views: 120,
        lastAnswerTime: new Date(),
        lastAnswerUserId: user1.id,
      },
    }),
    prisma.forumThread.create({
      data: {
        title: "Can't upload the template file",
        slug: 'cant-upload-template-file',
        content: 'I am having trouble uploading my template file.',
        authorId: user2.id,
        tag: 'item discussion',
        votes: 0,
        views: 45,
        lastAnswerTime: new Date(),
        lastAnswerUserId: user1.id,
      },
    }),
    prisma.forumThread.create({
      data: {
        title: 'Purchased Template Not delivered',
        slug: 'purchased-template-not-delivered',
        content: 'I purchased a template but did not receive it.',
        authorId: user1.id,
        tag: 'pre sale',
        votes: 0,
        views: 67,
        lastAnswerTime: new Date(),
        lastAnswerUserId: user2.id,
      },
    }),
    prisma.forumThread.create({
      data: {
        title: 'Invisible captcha on billing page.',
        slug: 'invisible-captcha-billing-page',
        content: 'There is an issue with the captcha on the billing page.',
        authorId: user1.id,
        tag: 'billing',
        isResolved: true,
        votes: 1,
        views: 89,
        lastAnswerTime: new Date(),
        lastAnswerUserId: adminUser.id,
      },
    }),
  ])

  // Create forum replies
  await prisma.forumReply.createMany({
    data: [
      {
        threadId: forumThreads[0].id,
        userId: user1.id,
        content: 'You can use CSS media queries to make the footer responsive.',
      },
      {
        threadId: forumThreads[1].id,
        userId: user1.id,
        content: 'Please check your file size and format. Maximum upload size is 10MB.',
      },
    ],
  })

  // Create term conditions
  await prisma.termCondition.createMany({
    data: [
      {
        title: 'Introduction',
        content: 'Welcome to MartPlace. These terms and conditions outline the rules and regulations for the use of our website.',
        order: 1,
      },
      {
        title: 'License',
        content: 'Unless otherwise stated, MartPlace and/or its licensors own the intellectual property rights.',
        order: 2,
      },
      {
        title: 'User Accounts',
        content: 'You are responsible for maintaining the confidentiality of your account and password.',
        order: 3,
      },
    ],
  })

  // Create badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'Gold Author',
        description: 'Top seller badge',
        icon: 'fa fa-trophy',
        type: 'author_rank',
        order: 1,
      },
      {
        name: 'Silver Author',
        description: 'Verified seller',
        icon: 'fa fa-medal',
        type: 'author_rank',
        order: 2,
      },
      {
        name: 'Bronze Author',
        description: 'New seller',
        icon: 'fa fa-star',
        type: 'author_rank',
        order: 3,
      },
      {
        name: 'Featured',
        description: 'Featured item',
        icon: 'fa fa-star',
        type: 'more',
        order: 1,
      },
    ],
  })

  // Create career features
  await prisma.careerFeature.createMany({
    data: [
      {
        icon: 'lnr-home',
        title: 'Work From Anywhere',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 1,
      },
      {
        icon: 'lnr-magic-wand',
        title: 'Mentoring Program',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 2,
      },
      {
        icon: 'lnr-bicycle',
        title: 'Wellness Program',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 3,
      },
      {
        icon: 'lnr-heart-pulse',
        title: 'Officespace',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 4,
      },
      {
        icon: 'lnr-leaf',
        title: 'Flexible Hours',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 5,
      },
      {
        icon: 'lnr-rocket',
        title: 'Work and Travel',
        description: 'Laborum dolo rumes fugats untras. Etharums quidem rerum facilis lores nemis omnis fugats. Lid est laborum dolo rumes fugats untras aborum dolo rumes.',
        order: 6,
      },
    ],
  })

  // Seed default system settings
  const settingSeeds = [
    {
      key: 'site.name',
      value: 'MartPlace',
      label: 'Marketplace Name',
      description: 'Displayed name across customer-facing surfaces.',
      group: 'GENERAL',
      type: 'STRING',
    },
    {
      key: 'site.tagline',
      value: 'Digital marketplace for creatives',
      label: 'Tagline',
      description: 'Short marketing phrase shown in hero areas.',
      group: 'GENERAL',
      type: 'TEXT',
    },
    {
      key: 'support.email',
      value: 'support@martplace.com',
      label: 'Support Email',
      description: 'Primary mailbox for customer inquiries.',
      group: 'SUPPORT',
      type: 'STRING',
    },
    {
      key: 'marketplace.commissionRate',
      value: '30',
      label: 'Commission Rate (%)',
      description: 'Percentage retained by the platform on each sale.',
      group: 'MARKETPLACE',
      type: 'NUMBER',
    },
    {
      key: 'marketplace.payoutSchedule',
      value: 'Weekly',
      label: 'Payout Schedule',
      description: 'How frequently seller earnings are paid out.',
      group: 'MARKETPLACE',
      type: 'STRING',
    },
    {
      key: 'billing.minimumPayout',
      value: '50',
      label: 'Minimum Payout Threshold',
      description: 'Minimum balance required before a seller can request a withdrawal.',
      group: 'BILLING',
      type: 'NUMBER',
    },
    {
      key: 'billing.taxRate',
      value: '15',
      label: 'Tax Rate (%)',
      description: 'Default tax rate applied to purchases when no locale-specific override exists.',
      group: 'BILLING',
      type: 'NUMBER',
    },
    {
      key: 'notifications.emailDigestEnabled',
      value: 'true',
      label: 'Weekly Email Digest',
      description: 'Send a weekly marketplace digest email to subscribers.',
      group: 'NOTIFICATIONS',
      type: 'BOOLEAN',
    },
    {
      key: 'notifications.purchaseEmailEnabled',
      value: 'true',
      label: 'Purchase Confirmation Emails',
      description: 'Send confirmation emails after successful purchases.',
      group: 'NOTIFICATIONS',
      type: 'BOOLEAN',
    },
  ]

  for (const setting of settingSeeds) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        label: setting.label,
        description: setting.description,
        group: setting.group as SystemSettingGroup,
        type: setting.type as SystemSettingType,
      },
      create: {
        key: setting.key,
        value: setting.value,
        label: setting.label,
        description: setting.description,
        group: setting.group as SystemSettingGroup,
        type: setting.type as SystemSettingType,
      },
    })
  }

  // Seed demo support tickets
  const supportAgent = await prisma.user.findFirst({ where: { role: "SUPPORT" } })
  const demoCustomer = await prisma.user.findFirst({ where: { role: "USER" } })
  if (demoCustomer) {
    await prisma.supportTicket.create({
      data: {
        reference: "SUP-1001",
        subject: "Download link not working",
        description: "Hi, I purchased the HexaDash template yesterday but the download link keeps returning a 404 page.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        category: "TECHNICAL",
        customerId: demoCustomer.id,
        assignedToId: supportAgent ? supportAgent.id : adminUser.id,
        history: {
          create: [
            {
              action: "CREATED",
              message: "Ticket created by customer",
              actorId: null,
            },
            {
              action: "ASSIGNED",
              message: `Assigned to ${supportAgent?.name ?? adminUser.name}`,
              actorId: supportAgent ? supportAgent.id : adminUser.id,
            },
            {
              action: "SUPPORT_REPLIED",
              message: "Thanks for reaching out! We reset the download link. Please try again.",
              actorId: supportAgent ? supportAgent.id : adminUser.id,
            },
            {
              action: "CUSTOMER_REPLIED",
              message: "It works now, thank you!",
              actorId: demoCustomer.id,
            },
          ],
        },
      },
    })

    await prisma.supportTicket.create({
      data: {
        reference: "SUP-1002",
        subject: "Request invoice for account",
        description: "Could you please send me an invoice for order #ORD-5004?",
        status: "OPEN",
        priority: "MEDIUM",
        category: "BILLING",
        customerId: demoCustomer.id,
        history: {
          create: [
            {
              action: "CREATED",
              message: "Ticket created by customer",
              actorId: null,
            },
          ],
        },
      },
    })
  }

  // Create blog posts
  const blogImages = [
    '/images/blog1.jpg',
    '/images/blog2.jpg',
    '/images/blog3.jpg',
    '/images/blog4.jpg',
    '/images/blog5.jpg',
    '/images/blog6.jpg',
    '/images/bb1.jpg',
    '/images/bb2.jpg',
    '/images/bb3.jpg',
    '/images/blogimg.jpg',
  ]

  const blogTitles = [
    'Web Design Trends in 2024',
    'Top 10 WordPress Plugins You Need',
    'How to Build a Successful Online Marketplace',
    'The Future of E-Commerce: Trends and Predictions',
    'Best Practices for Product Photography',
    'Creating Engaging User Experiences',
    'Digital Marketing Strategies for 2024',
    'The Art of Minimalist Web Design',
    'Building Trust in Online Marketplaces',
    'Mobile-First Design: Why It Matters',
    'SEO Tips for E-Commerce Websites',
    'Understanding User Behavior Analytics',
    'The Power of Social Media Marketing',
    'Content Creation for Digital Products',
    'Payment Gateway Integration Guide',
    'Customer Support Best Practices',
    'Growing Your Online Business',
    'Design Systems and Component Libraries',
    'Performance Optimization Techniques',
    'Accessibility in Web Design',
  ]

  const blogExcerpts = [
    'Discover the latest web design trends that will shape the digital landscape in 2024. From bold typography to immersive experiences.',
    'Explore the essential WordPress plugins that can transform your website into a powerful business tool.',
    'Learn the key strategies and tactics for building a thriving online marketplace from scratch.',
    'Get insights into the future of e-commerce and what trends will dominate the industry.',
    'Master the art of product photography to showcase your items in the best possible light.',
    'Discover how to create user experiences that keep visitors engaged and coming back for more.',
    'Stay ahead with the latest digital marketing strategies that actually work in 2024.',
    'Learn how minimalist design principles can create more effective and beautiful websites.',
    'Build trust with your customers through transparency, security, and excellent service.',
    'Understand why mobile-first design is crucial for success in today\'s digital world.',
    'Improve your search engine rankings with these proven SEO techniques for e-commerce.',
    'Learn how to analyze user behavior to make data-driven decisions for your business.',
    'Harness the power of social media to grow your brand and reach new audiences.',
    'Create compelling content that showcases your digital products and drives sales.',
    'Navigate the complexities of payment gateway integration with this comprehensive guide.',
    'Provide exceptional customer support that builds loyalty and drives repeat business.',
    'Scale your online business with proven growth strategies and tactics.',
    'Build consistent and maintainable design systems for better user experiences.',
    'Optimize your website\'s performance to improve user experience and search rankings.',
    'Make your website accessible to everyone with these essential design principles.',
  ]

  const blogContents = [
    'Web design is constantly evolving, and 2024 brings exciting new trends that will shape how we create digital experiences. From bold typography choices to immersive 3D elements, designers are pushing boundaries to create more engaging and interactive websites. One of the most significant trends is the use of AI-generated imagery and personalized content that adapts to user preferences. Dark mode continues to gain popularity, with more websites offering this option to reduce eye strain and save battery life on mobile devices. Micro-interactions and subtle animations are becoming more sophisticated, providing feedback and enhancing user engagement without being distracting.',
    'WordPress plugins are the backbone of any successful WordPress website. In this comprehensive guide, we\'ll explore the top 10 plugins that every website owner should consider. From SEO optimization tools like Yoast SEO to security plugins like Wordfence, these tools can significantly enhance your website\'s functionality and performance. E-commerce plugins like WooCommerce enable you to transform your site into a full-featured online store, while page builders like Elementor give you the flexibility to design custom layouts without coding. Analytics plugins help you understand your audience, while backup plugins ensure your data is always safe.',
    'Building a successful online marketplace requires careful planning, strategic thinking, and execution. Start by identifying your niche and understanding your target audience\'s needs. Choose the right technology stack that can scale with your business, and invest in a user-friendly interface that makes it easy for both buyers and sellers to navigate. Implement robust payment and security systems to build trust, and create clear policies for transactions, returns, and disputes. Marketing is crucial - use a combination of SEO, social media, and content marketing to attract users. Focus on building a community around your marketplace, as engaged users are more likely to return and make purchases.',
    'The e-commerce landscape is rapidly changing, driven by technological advances and shifting consumer behaviors. In 2024, we\'re seeing a move toward more personalized shopping experiences powered by AI and machine learning. Voice commerce is growing, with more consumers using smart speakers to make purchases. Augmented reality is becoming mainstream, allowing customers to visualize products before buying. Sustainability is also a major trend, with consumers increasingly choosing brands that align with their values. Social commerce continues to grow, with platforms like Instagram and TikTok becoming significant sales channels.',
    'Product photography is one of the most important aspects of selling online. High-quality images can make the difference between a sale and a pass. Start with good lighting - natural light is often best, but professional lighting setups can give you more control. Use a clean, uncluttered background that doesn\'t distract from your product. Show your product from multiple angles and include detail shots that highlight unique features. Consider lifestyle shots that show your product in use, as these help customers visualize how it fits into their lives. Edit your photos to ensure accurate colors and remove any imperfections, but avoid over-editing that makes products look unrealistic.',
    'Creating engaging user experiences is essential for any successful website or application. User experience design focuses on understanding user needs and creating interfaces that are intuitive, efficient, and enjoyable to use. Start by conducting user research to understand your audience\'s goals, pain points, and behaviors. Create user personas to guide your design decisions, and develop user journeys that map out how users will interact with your product. Use wireframes and prototypes to test your ideas before investing in full development. Pay attention to accessibility, ensuring that your design is usable by people with disabilities. Continuously gather feedback and iterate on your design to improve the user experience over time.',
    'Digital marketing has evolved significantly, and 2024 brings new strategies and tools to reach your target audience effectively. Content marketing remains one of the most powerful ways to attract and engage customers. Create valuable, relevant content that addresses your audience\'s needs and interests. Search engine optimization (SEO) is crucial for organic visibility - focus on creating high-quality content, optimizing for relevant keywords, and building authoritative backlinks. Social media marketing allows you to connect with your audience on platforms they use daily. Email marketing continues to deliver excellent ROI when done right. Pay-per-click advertising can provide immediate results, but requires careful targeting and optimization.',
    'Minimalist web design has gained popularity for its clean, focused approach that puts content first. By removing unnecessary elements, minimalist designs create more impactful user experiences. The key principles include using plenty of white space, limiting color palettes, choosing typography carefully, and focusing on essential elements. Minimalist designs load faster, are easier to navigate, and work well across different devices. They also tend to age better, as they\'re not tied to specific design trends. However, minimalism doesn\'t mean boring - it\'s about intentional design choices that enhance rather than distract from the content.',
    'Building trust is crucial for any online marketplace. Customers need to feel confident that they\'re making safe transactions and dealing with reputable sellers. Start by implementing robust security measures, including SSL certificates, secure payment processing, and data protection. Display clear policies for returns, refunds, and dispute resolution. Show seller ratings and reviews prominently, and verify seller identities. Provide excellent customer support that responds quickly to inquiries and resolves issues fairly. Be transparent about fees, shipping costs, and delivery times. Showcase testimonials and case studies from satisfied customers. Building trust takes time, but it\'s essential for long-term success.',
    'Mobile-first design is no longer optional - it\'s essential. With more than half of all web traffic coming from mobile devices, your website must work perfectly on smartphones and tablets. Mobile-first design means starting with the mobile experience and then enhancing it for larger screens, rather than trying to shrink a desktop design. This approach forces you to focus on what\'s truly important and creates better experiences for all users. Key considerations include touch-friendly interface elements, fast loading times, readable text without zooming, and simplified navigation. Test your design on actual devices, not just in browser developer tools, to ensure the best possible experience.',
    'SEO is critical for e-commerce success, as most customers start their shopping journey with a search engine. Start by conducting keyword research to understand what terms your potential customers are searching for. Optimize your product pages with relevant keywords in titles, descriptions, and content. Create unique, detailed product descriptions that provide value to both customers and search engines. Build a logical site structure with clear categories and navigation. Ensure your site loads quickly, as page speed is a ranking factor. Use structured data markup to help search engines understand your content. Create a blog or resource section to attract organic traffic. Build quality backlinks from reputable sites in your industry.',
    'User behavior analytics provide invaluable insights into how people interact with your website. By tracking metrics like page views, bounce rates, time on site, and conversion rates, you can identify what\'s working and what needs improvement. Use tools like Google Analytics to understand user flows and identify drop-off points in your conversion funnel. Heatmaps can show you where users click and scroll, revealing areas of interest or confusion. A/B testing allows you to experiment with different designs and content to see what performs better. Set up conversion tracking to measure the effectiveness of your marketing campaigns. Regularly review your analytics data and use it to make data-driven decisions about your website and marketing strategies.',
    'Social media marketing has become an essential component of any digital marketing strategy. Platforms like Facebook, Instagram, Twitter, and LinkedIn offer unique opportunities to connect with your audience, build brand awareness, and drive traffic to your website. Each platform has its own best practices and audience demographics, so tailor your content accordingly. Create engaging, shareable content that provides value to your followers. Use visual content like images and videos to stand out in crowded feeds. Engage with your audience by responding to comments and messages promptly. Run targeted advertising campaigns to reach specific demographics. Track your performance metrics to understand what content resonates with your audience.',
    'Content creation for digital products requires a strategic approach that showcases your products effectively while providing value to potential customers. Start by understanding your target audience and what information they need to make a purchase decision. Create detailed product descriptions that highlight key features and benefits. Use high-quality images and videos to show your products in action. Write blog posts and guides that relate to your products and help customers solve problems. Create comparison guides that help customers choose between different options. Develop case studies and testimonials that demonstrate real-world results. Make sure your content is optimized for search engines so potential customers can find it easily.',
    'Payment gateway integration is a critical component of any e-commerce website. Choose a payment provider that offers the features you need, including support for multiple payment methods, fraud protection, and easy integration. Popular options include Stripe, PayPal, and Square. Consider your target market - different regions prefer different payment methods. Ensure your payment processing is secure and PCI compliant. Provide clear information about accepted payment methods and any fees. Make the checkout process as simple as possible to reduce cart abandonment. Test your payment flow thoroughly before going live. Have a plan for handling payment disputes and refunds. Monitor your payment processing for any issues or suspicious activity.',
    'Customer support can make or break your business. Excellent support builds loyalty and encourages repeat purchases, while poor support can drive customers away. Offer multiple support channels, including email, live chat, and phone support. Respond to inquiries quickly - aim for same-day responses at minimum. Train your support team to be knowledgeable, friendly, and empathetic. Create a comprehensive FAQ section to help customers find answers quickly. Use support tickets to track and manage customer issues systematically. Follow up with customers after resolving their issues to ensure satisfaction. Use customer feedback to improve your products and services. Consider offering self-service options like knowledge bases and video tutorials.',
    'Growing an online business requires a combination of strategies and tactics. Start by understanding your market and identifying opportunities for growth. Focus on customer acquisition through various marketing channels, but don\'t neglect customer retention - it\'s often more cost-effective to keep existing customers than to acquire new ones. Expand your product offerings based on customer demand and market research. Consider entering new markets or targeting new customer segments. Invest in technology and automation to scale your operations efficiently. Build strategic partnerships that can help you reach new audiences. Continuously analyze your performance metrics and adjust your strategy based on what\'s working. Stay agile and be willing to pivot when necessary.',
    'Design systems and component libraries are essential for creating consistent, maintainable user interfaces. A design system is a collection of reusable components, guidelines, and standards that ensure consistency across your product. Start by documenting your design principles, color palette, typography, and spacing guidelines. Create a component library with reusable UI elements like buttons, forms, and cards. Use tools like Storybook to document and showcase your components. Establish naming conventions and coding standards that your team can follow. Regularly update and maintain your design system as your product evolves. Share your design system with your entire team to ensure everyone is on the same page. A well-maintained design system saves time, reduces errors, and improves the overall quality of your product.',
    'Performance optimization is crucial for providing a good user experience and improving your search engine rankings. Slow-loading websites frustrate users and can lead to higher bounce rates. Start by optimizing your images - compress them, use appropriate formats like WebP, and implement lazy loading. Minimize and combine CSS and JavaScript files to reduce the number of HTTP requests. Use a content delivery network (CDN) to serve your content from locations closer to your users. Enable browser caching to reduce load times for returning visitors. Minimize the use of third-party scripts that can slow down your site. Regularly audit your site\'s performance using tools like Google PageSpeed Insights and make improvements based on their recommendations.',
    'Accessibility in web design ensures that your website is usable by everyone, including people with disabilities. This is not only the right thing to do, but it also makes good business sense by expanding your potential audience. Follow the Web Content Accessibility Guidelines (WCAG) to ensure your site meets accessibility standards. Use semantic HTML to provide structure and meaning to your content. Ensure sufficient color contrast between text and backgrounds. Provide alternative text for images so screen readers can describe them. Make sure your site is keyboard navigable - users should be able to access all functionality without a mouse. Test your site with screen readers and other assistive technologies. Regularly audit your site for accessibility issues and fix them promptly.',
  ]

  // Get users to assign as authors
  const authors = await prisma.user.findMany({
    where: {
      role: { in: ['SELLER', 'ADMIN', 'SUPERADMIN'] },
    },
    take: 5,
  })

  if (authors.length > 0) {
    for (let i = 0; i < blogTitles.length; i++) {
      const title = blogTitles[i]
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const author = authors[i % authors.length]
      const image = blogImages[i % blogImages.length]
      const excerpt = blogExcerpts[i % blogExcerpts.length]
      const content = blogContents[i % blogContents.length] || excerpt + ' ' + excerpt

      const publishedDate = new Date()
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 90)) // Random date within last 90 days

      await prisma.blog.upsert({
        where: { slug },
        update: {
          title,
          excerpt,
          content,
          image,
          views: Math.floor(Math.random() * 1000) + 50,
          commentCount: Math.floor(Math.random() * 50),
          publishedAt: publishedDate,
        },
        create: {
          title,
          slug,
          excerpt,
          content,
          image,
          authorId: author.id,
          views: Math.floor(Math.random() * 1000) + 50,
          commentCount: Math.floor(Math.random() * 50),
          publishedAt: publishedDate,
        },
      })
    }
  }
}

main()
  .catch((e) => {
    process.stderr.write(`❌ Error seeding database: ${e instanceof Error ? e.message : String(e)}\n`)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

