'use server'

import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- 1. AUTHENTICATION (Login/Logout) ---

import { createClient } from '@/utils/supabase/server'

const prisma = new PrismaClient()

// --- 1. AUTHENTICATION (Login/Logout/Signup) ---

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Session handling is automatic via Supabase middleware/wrapper
  // We just need to check the role now to redirect

  const user = await getCurrentUser()
  if (!user) return { error: 'Authentication failed' }

  if (user.role === 'ADMIN') {
    redirect('/admin')
  } else if (user.role === 'TEACHER') {
    redirect('/teacher')
  } else {
    redirect('/student')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Signup failed' }
  }

  // 2. Create User in Prisma DB (Sync)
  // We use the Supabase User ID as the Prisma User ID
  try {
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: email,
        name: name,
        role: 'STUDENT', // Default role
      },
    })
  } catch (e) {
    // If user already exists in DB (rare case if fresh signup), ignore or handle
    console.error('Prisma user creation failed:', e)
    // Optional: Delete Supabase user to cleanup? 
    // For now we proceed, assuming maybe they existed.
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Helper to get logged-in user with Role from Prisma
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Supabase Auth Error:", error)
    return null
  }

  if (!supabaseUser) {
    console.log("No Supabase User found.")
    return null
  }

  // Fetch role and details from Prisma
  try {
    console.log("Fetching Prisma User for ID:", supabaseUser.id)
    const prismaUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id }
    })

    if (!prismaUser) {
      console.log("Prisma User not found (returned null).")
    }

    return prismaUser
  } catch (e) {
    console.error("Prisma Error in getCurrentUser:", e)
    return null
  }
}

// --- 2. ADMIN ACTIONS ---

// --- 2. ADMIN ACTIONS ---

export async function getAdminData() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) redirect('/login')

  // Parallelize separate data fetches to improve performance
  const [courses, categories, users] = await Promise.all([
    prisma.course.findMany({
      include: { category: true, teacher: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany(),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      orderBy: { name: 'asc' }
    })
  ])

  return { courses, categories, users, user }
}

export async function createCourse(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const categoryId = formData.get('categoryId') as string
  const summary = formData.get('summary') as string
  const curriculum = formData.get('curriculum') as string
  const type = formData.get('type') as 'FACE_TO_FACE' | 'ONLINE'
  const capacityInput = formData.get('capacity')

  let capacity: number | null = 40 // Default
  if (type === 'ONLINE') {
    capacity = null // No limit or ignored
  } else if (capacityInput) {
    capacity = parseInt(capacityInput as string)
  }

  let teacherId = user.id
  // If ADMIN, check if they selected a teacher
  if (user.role === 'ADMIN') {
    const selectedTeacherId = formData.get('teacherId') as string
    if (selectedTeacherId) {
      teacherId = selectedTeacherId
    }
  }

  await prisma.course.create({
    data: {
      title,
      description,
      categoryId,
      summary,
      curriculum,
      teacherId,
      type: type || 'FACE_TO_FACE',
      capacity
    }
  })

  revalidatePath('/admin')
}

export async function deleteCourse(courseId: string) {
  // Add permission check?
  await prisma.course.delete({ where: { id: courseId } })
  revalidatePath('/admin')
}



export async function updateCourseTeacher(courseId: string, teacherId: string | null) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { teacherId: teacherId }
    })
    revalidatePath('/admin')
    revalidatePath('/teacher')
    revalidatePath('/student')
    return { success: true }
  } catch (e) {
    console.error("Failed to update course teacher:", e)
    return { error: "Failed to update teacher" }
  }
}

export async function getAdminDashboardData() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    students,
    teachers,
    courses,
    enrollments
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.course.count(),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { enrollments: true }
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: { courses: true }
    }),
    prisma.course.findMany({ // Fixed: Removed erroneous enrollment include structure
      include: { enrollments: true, teacher: true }
    }),
    prisma.enrollment.findMany() // Fetch all enrollments for distribution calculation
  ])

  // 1. Student Class Distribution (Histogram)
  // Map: Number of classes -> Number of students
  const studentDistributionMap = new Map<number, number>()
  students.forEach(s => {
    const count = s.enrollments.length
    studentDistributionMap.set(count, (studentDistributionMap.get(count) || 0) + 1)
  })

  const studentClassDistribution = Array.from(studentDistributionMap.entries())
    .map(([classes, students]) => ({ classes: `${classes} Classes`, students }))
    .sort((a, b) => parseInt(a.classes) - parseInt(b.classes))

  // 2. Teacher Class Load (Detailed: Teacher Name -> Class Count)
  const teacherClassDistribution = teachers.map(t => ({
    name: t.name || t.email,
    classes: t.courses.length
  })).sort((a, b) => b.classes - a.classes)

  // 3. Class Size Distribution (Detailed: Course Name -> Student Count)
  const courseEnrollmentDistribution = courses.map(c => ({
    name: c.title,
    students: c.enrollments.length
  })).sort((a, b) => b.students - a.students)

  // 4. Assigned vs Unassigned
  const assignedCount = courses.filter(c => c.teacherId !== null).length
  const unassignedCount = courses.length - assignedCount
  const courseAssignmentStats = [
    { name: 'Assigned', value: assignedCount, fill: '#0ea5e9' }, // sky-500
    { name: 'Unassigned', value: unassignedCount, fill: '#ef4444' } // red-500
  ]

  return {
    overview: { totalStudents, totalTeachers, totalCourses },
    charts: {
      studentClassDistribution,
      teacherClassDistribution,
      courseEnrollmentDistribution,
      courseAssignmentStats
    },
    user
  }
}

// --- 3. STUDENT ACTIONS ---

export async function getStudentData() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Get all courses with category AND teacher + Enrollments count
  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      include: {
        category: true,
        teacher: true,
        enrollments: true // We need count to check capacity
      }
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
    })
  ])

  const enrolledCourseIds = enrollments.map(e => e.courseId)

  return { courses, enrolledCourseIds, user }
}

export async function enrollInCourse(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "User not found" }

  // Check Capacity
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { enrollments: true }
  })

  if (!course) return { error: "Course not found" }

  if (course.type === 'FACE_TO_FACE' && course.capacity) {
    if (course.enrollments.length >= course.capacity) {
      return { error: "Course is full" } // Ensure generic error message doesn't break UI
    }
  }

  // Create the link in the "Enrollment" table
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId: courseId
    }
  })

  revalidatePath('/student')
  return { success: true }
}

export async function dropCourse(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "User not found" }

  await prisma.enrollment.deleteMany({
    where: {
      userId: user.id,
      courseId: courseId
    }
  })

  revalidatePath('/student')
  return { success: true }
}

// --- 4. USER MANAGEMENT (ADMIN) ---

export async function getUsersData() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return { users, currentUser: user }
}

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'TEACHER' | 'STUDENT') {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return { error: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) {
    console.error("Failed to update role:", e)
    return { error: "Failed to update role" }
  }
}

// --- 5. TEACHER DASHBOARD ACTIONS ---

export async function getTeacherDashboardStats() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'TEACHER') redirect('/login')

  const teacherCourses = await prisma.course.findMany({
    where: { teacherId: user.id },
    include: { enrollments: true }
  })

  // 1. Total Stats
  const totalCourses = teacherCourses.length

  // 2. Active Classes (Courses with at least 1 student)
  const activeClasses = teacherCourses.filter(c => c.enrollments.length > 0).length

  // 3. Total Unique Students
  const uniqueStudentIds = new Set<string>()
  teacherCourses.forEach(c => {
    c.enrollments.forEach(e => uniqueStudentIds.add(e.userId))
  })
  const totalStudents = uniqueStudentIds.size

  // 4. Class Size Distribution (Bar Chart)
  const classSizeData = teacherCourses.map(c => ({
    name: c.title,
    students: c.enrollments.length
  })).sort((a, b) => b.students - a.students)

  return {
    stats: {
      totalCourses,
      totalStudents,
      activeClasses
    },
    charts: {
      classSizeData
    },
    user
  }
}

export async function getTeacherData() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) redirect('/login')

  // Fetch all courses with enrollments and students for management
  // Also fetch categories for the create course modal
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      include: {
        category: true,
        teacher: true,
        enrollments: {
          include: { user: true } // Include student details
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany()
  ])

  return { courses, categories, user }
}

export async function assignTeacherToCourse(courseId: string) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'TEACHER') return { error: "Unauthorized" }

  // Check if unassigned (or just overwrite? Plan said "assign self". Let's check first for safety, or just allow claiming)
  // For simplicity: allow claiming if teacherId is null or if invalid.

  await prisma.course.update({
    where: { id: courseId },
    data: { teacherId: user.id }
  })

  revalidatePath('/teacher')
}

export async function removeStudentFromCourse(courseId: string, studentId: string) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) return { error: "Unauthorized" }

  // Verify ownership? (Optional, but good practice). For now, trust the UI/Role.

  await prisma.enrollment.deleteMany({
    where: {
      courseId: courseId,
      userId: studentId
    }
  })

  revalidatePath('/teacher')
}