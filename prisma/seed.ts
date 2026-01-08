// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
    'Mathematics', 'Science', 'History', 'Language Arts', 'Technology', 'Art', 'Music', 'Physical Education'
]

const COURSE_TITLES_BY_CATEGORY: Record<string, string[]> = {
    Mathematics: ['Algebra I', 'Geometry', 'Calculus', 'Statistics', 'Linear Algebra'],
    Science: ['Biology', 'Chemistry', 'Physics', 'Environmental Science', 'Astronomy'],
    History: ['World History', 'US History', 'European History', 'Ancient Civilizations', 'Modern Politics'],
    'Language Arts': ['English Literature', 'Creative Writing', 'Journalism', 'Public Speaking', 'Poetry'],
    Technology: ['Computer Science Principles', 'Web Development', 'Robotics', 'Data Science', 'Cybersecurity'],
    Art: ['Painting', 'Drawing', 'Art History', 'Digital Design'],
    Music: ['Music Theory', 'Choir', 'Band', 'Orchestra'],
    'Physical Education': ['Gym', 'Health', 'Sports Medicine']
}

async function main() {
    console.log("🌱 Starting seed...")

    // 1. Categories
    const categories = []
    for (const name of CATEGORIES) {
        const cat = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name, description: `${name} courses` },
        })
        categories.push(cat)
    }
    console.log(`✅ Created ${categories.length} categories`)

    // 2. Teachers (20)
    const teachers = []
    for (let i = 1; i <= 20; i++) {
        const teacher = await prisma.user.upsert({
            where: { email: `teacher${i}@school.com` },
            update: { role: 'TEACHER' },
            create: {
                email: `teacher${i}@school.com`,
                name: `Teacher ${i}`,
                role: 'TEACHER',
            },
        })
        teachers.push(teacher)
    }
    console.log(`✅ Created ${teachers.length} teachers`)

    // 3. Students (100)
    const students = []
    for (let i = 1; i <= 100; i++) {
        const student = await prisma.user.upsert({
            where: { email: `student${i}@school.com` },
            update: { role: 'STUDENT' }, // Ensure they are students
            create: {
                email: `student${i}@school.com`,
                name: `Student ${i}`,
                role: 'STUDENT',
            },
        })
        students.push(student)
    }
    console.log(`✅ Created ${students.length} students`)

    // 4. Courses
    const courses = []
    // Assign 2-5 courses to each teacher
    for (const teacher of teachers) {
        const numCourses = Math.floor(Math.random() * 4) + 2 // 2 to 5 courses

        for (let j = 0; j < numCourses; j++) {
            const randomCatName = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
            const cat = categories.find(c => c.name === randomCatName)!
            const possibleTitles = COURSE_TITLES_BY_CATEGORY[randomCatName] || ['General Course']
            const title = possibleTitles[Math.floor(Math.random() * possibleTitles.length)] + ` (${teacher.name})` // Unique title

            const type = Math.random() > 0.5 ? 'FACE_TO_FACE' : 'ONLINE'
            const capacity = type === 'FACE_TO_FACE' ? 40 : null

            const course = await prisma.course.create({
                data: {
                    title,
                    description: `A comprehensive ${randomCatName} course taught by ${teacher.name}.`,
                    summary: `This course covers key concepts in ${randomCatName}. suitable for all levels.`,
                    curriculum: `Week 1: Intro\nWeek 2: Basics\nWeek 3: Advanced Topics\nWeek 4: Final Project`,
                    categoryId: cat.id,
                    teacherId: teacher.id,
                    type: type,
                    capacity: capacity
                }
            })
            courses.push(course)
        }
    }
    console.log(`✅ Created ${courses.length} courses`)

    // 5. Enrollments
    const allEnrollments = []
    // Track enrollment counts in memory to avoid N+1 queries
    const courseEnrollmentCounts: Record<string, number> = {}
    courses.forEach(c => courseEnrollmentCounts[c.id] = 0)

    for (const student of students) {
        // Enroll in 3-6 random courses
        const numEnrollments = Math.floor(Math.random() * 4) + 3
        const shuffledCourses = [...courses].sort(() => 0.5 - Math.random()) // Copy to avoid mutating original if needed, though sort mutates in place

        // We need to pick unique courses for this student
        let enrolledCount = 0

        for (const course of shuffledCourses) {
            if (enrolledCount >= numEnrollments) break

            // Check capacity
            if (course.type === 'FACE_TO_FACE' && course.capacity) {
                if (courseEnrollmentCounts[course.id] >= course.capacity) continue
            }

            // Add to batch list
            allEnrollments.push({
                userId: student.id,
                courseId: course.id
            })

            // Update in-memory count
            courseEnrollmentCounts[course.id]++
            enrolledCount++
        }
    }

    // Batch insert
    // split into chunks if necessary, but 100 students * ~5 courses = 500 records is fine for one batch
    if (allEnrollments.length > 0) {
        await prisma.enrollment.createMany({
            data: allEnrollments,
            skipDuplicates: true
        })
    }
    console.log(`✅ Created ${allEnrollments.length} enrollments`)

    console.log("🎉 Seeding finished successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })