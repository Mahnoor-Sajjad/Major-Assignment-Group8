// Enrollment Module - Handles student course enrollments

class EnrollmentManager {
    constructor() {
        this.enrollmentsFile = '../data/enrollement.txt.txt';
    }

    // Get course manager instance
    getCourseManager() {
        if (typeof CourseManager !== 'undefined') {
            return new CourseManager();
        }
        // Fallback: create a simple course manager
        return {
            getCourseById: async (id) => {
                const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
                return courses.find(c => c.id === id);
            },
            getCourses: async () => {
                return JSON.parse(localStorage.getItem('lms_courses') || '[]');
            },
            saveCourses: async (courses) => {
                localStorage.setItem('lms_courses', JSON.stringify(courses));
            }
        };
    }

    // Initialize enrollments file if empty
    async initEnrollmentsFile() {
        try {
            const response = await fetch(this.enrollmentsFile);
            const text = await response.text();
            if (!text.trim()) {
                await this.saveEnrollments([]);
            }
        } catch (error) {
            await this.saveEnrollments([]);
        }
    }

    // Read enrollments from file
    async getEnrollments() {
        try {
            const response = await fetch(this.enrollmentsFile);
            const text = await response.text();
            if (!text.trim()) return [];
            return JSON.parse(text);
        } catch (error) {
            const stored = localStorage.getItem('lms_enrollments');
            return stored ? JSON.parse(stored) : [];
        }
    }

    // Save enrollments to file
    async saveEnrollments(enrollments) {
        localStorage.setItem('lms_enrollments', JSON.stringify(enrollments));
        return true;
    }

    // Get all enrollments
    async getAllEnrollments() {
        return await this.getEnrollments();
    }

    // Get enrollments by student ID
    async getEnrollmentsByStudent(studentId) {
        const enrollments = await this.getEnrollments();
        return enrollments.filter(e => e.studentId === studentId);
    }

    // Get enrollments by course ID
    async getEnrollmentsByCourse(courseId) {
        const enrollments = await this.getEnrollments();
        return enrollments.filter(e => e.courseId === courseId);
    }

    // Enroll student in a course
    async enrollStudent(studentId, courseId, studentName) {
        if (!studentId || !courseId) {
            return { success: false, message: 'Student ID and Course ID are required' };
        }

        // Check if course exists
        const courseManager = this.getCourseManager();
        const course = await courseManager.getCourseById(courseId);
        if (!course) {
            return { success: false, message: 'Course not found' };
        }

        const enrollments = await this.getEnrollments();

        // Check if already enrolled
        if (enrollments.find(e => e.studentId === studentId && e.courseId === courseId)) {
            return { success: false, message: 'Already enrolled in this course' };
        }

        const enrollment = {
            id: Date.now().toString(),
            studentId,
            studentName: studentName || 'Unknown Student',
            courseId,
            courseName: course.name,
            enrolledAt: new Date().toISOString(),
            status: 'active',
            grade: null
        };

        enrollments.push(enrollment);
        await this.saveEnrollments(enrollments);

        // Update course students list
        course.students = course.students || [];
        if (!course.students.includes(studentId)) {
            course.students.push(studentId);
            const allCourses = await courseManager.getCourses();
            const courseIndex = allCourses.findIndex(c => c.id === courseId);
            if (courseIndex !== -1) {
                allCourses[courseIndex] = course;
                await courseManager.saveCourses(allCourses);
            }
        }

        return { success: true, message: 'Enrolled successfully', enrollment };
    }

    // Unenroll student from a course
    async unenrollStudent(studentId, courseId) {
        const enrollments = await this.getEnrollments();
        const filtered = enrollments.filter(e => !(e.studentId === studentId && e.courseId === courseId));

        if (enrollments.length === filtered.length) {
            return { success: false, message: 'Enrollment not found' };
        }

        await this.saveEnrollments(filtered);
        return { success: true, message: 'Unenrolled successfully' };
    }

    // Get student's enrolled courses with details
    async getStudentCourses(studentId) {
        const enrollments = await this.getEnrollmentsByStudent(studentId);
        const courseManager = this.getCourseManager();
        const courses = await courseManager.getCourses();
        
        return enrollments.map(enrollment => {
            const course = courses.find(c => c.id === enrollment.courseId);
            return {
                ...enrollment,
                course: course || null
            };
        });
    }

    // Check if student is enrolled in course
    async isEnrolled(studentId, courseId) {
        const enrollments = await this.getEnrollments();
        return enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnrollmentManager;
}

