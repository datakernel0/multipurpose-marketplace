import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET current user settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to fetch user with all fields, but handle missing fields gracefully
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        // New fields - these might not exist yet if migration hasn't run
        username: true,
        bio: true,
        profileHeading: true,
        website: true,
        country: true,
        coverImage: true,
        facebookUrl: true,
        twitterUrl: true,
        behanceUrl: true,
        dribbbleUrl: true,
        billingFirstName: true,
        billingLastName: true,
        billingCompany: true,
        billingEmail: true,
        billingCountry: true,
        billingAddress1: true,
        billingAddress2: true,
        billingCity: true,
        billingZipCode: true,
        emailRatingReminder: true,
        emailUpdateNotifications: true,
        emailCommentNotifications: true,
        emailReviewNotifications: true,
        emailItemReviewNotifications: true,
        emailSupportNotifications: true,
        emailWeeklySummary: true,
        emailNewsletter: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load user settings" }, { status: 500 })
  }
}

// UPDATE user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      // Personal Information
      name,
      username,
      email,
      password,
      confirmPassword,
      website,
      country,
      profileHeading,
      bio,
      
      // Profile Images
      image,
      coverImage,
      
      // Social Links
      facebookUrl,
      twitterUrl,
      behanceUrl,
      dribbbleUrl,
      
      // Billing Information
      billingFirstName,
      billingLastName,
      billingCompany,
      billingEmail,
      billingCountry,
      billingAddress1,
      billingAddress2,
      billingCity,
      billingZipCode,
      
      // Email Settings
      emailRatingReminder,
      emailUpdateNotifications,
      emailCommentNotifications,
      emailReviewNotifications,
      emailItemReviewNotifications,
      emailSupportNotifications,
      emailWeeklySummary,
      emailNewsletter,
    } = body

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: { id: session.user.id },
        },
      })
      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
      }
    }

    // Build update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name || null
    if (username !== undefined) updateData.username = username || null
    if (email !== undefined) updateData.email = email
    if (website !== undefined) updateData.website = website || null
    if (country !== undefined) updateData.country = country || null
    if (profileHeading !== undefined) updateData.profileHeading = profileHeading || null
    if (bio !== undefined) updateData.bio = bio || null
    if (image !== undefined) updateData.image = image || null
    if (coverImage !== undefined) updateData.coverImage = coverImage || null
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl || null
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl || null
    if (behanceUrl !== undefined) updateData.behanceUrl = behanceUrl || null
    if (dribbbleUrl !== undefined) updateData.dribbbleUrl = dribbbleUrl || null
    if (billingFirstName !== undefined) updateData.billingFirstName = billingFirstName || null
    if (billingLastName !== undefined) updateData.billingLastName = billingLastName || null
    if (billingCompany !== undefined) updateData.billingCompany = billingCompany || null
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail || null
    if (billingCountry !== undefined) updateData.billingCountry = billingCountry || null
    if (billingAddress1 !== undefined) updateData.billingAddress1 = billingAddress1 || null
    if (billingAddress2 !== undefined) updateData.billingAddress2 = billingAddress2 || null
    if (billingCity !== undefined) updateData.billingCity = billingCity || null
    if (billingZipCode !== undefined) updateData.billingZipCode = billingZipCode || null
    if (emailRatingReminder !== undefined) updateData.emailRatingReminder = emailRatingReminder
    if (emailUpdateNotifications !== undefined) updateData.emailUpdateNotifications = emailUpdateNotifications
    if (emailCommentNotifications !== undefined) updateData.emailCommentNotifications = emailCommentNotifications
    if (emailReviewNotifications !== undefined) updateData.emailReviewNotifications = emailReviewNotifications
    if (emailItemReviewNotifications !== undefined) updateData.emailItemReviewNotifications = emailItemReviewNotifications
    if (emailSupportNotifications !== undefined) updateData.emailSupportNotifications = emailSupportNotifications
    if (emailWeeklySummary !== undefined) updateData.emailWeeklySummary = emailWeeklySummary
    if (emailNewsletter !== undefined) updateData.emailNewsletter = emailNewsletter
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        profileHeading: true,
        website: true,
        country: true,
        image: true,
        coverImage: true,
      },
    })

    return NextResponse.json(
      { message: "Settings updated successfully", user: updatedUser },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 })
  }
}
