// Teacher Module - Handles grade management and teacher-specific operations

class TeacherManager {
    constructor() {
        this.assignmentsFile = '../data/assignments.txt.txt';
    }

    // Get enrollment manager instance
    getEnrollmentManager() {
        if (typeof EnrollmentManager !== 'undefined') {
            return new EnrollmentManager();
        }
        return {
            getAllEnrollments: async () => {
                return JSON.parse(localStorage.getItem('lms_enrollments') || '[]');
            },
            getEnrollmentsByCourse: async (courseId) => {
                const enrollments = JSON.parse(localStorage.getItem('lms_enrollments') || '[]');
                return enrollments.filter(e => e.courseId === courseId);
            },
            saveEnrollments: async (enrollments) => {
                localStorage.setItem('lms_enrollments', JSON.stringify(enrollments));
            }
        };
    }

    // Get course manager instance
    getCourseManager() {
        if (typeof CourseManager !== 'undefined') {
            return new CourseManager();
        }
        return {
            getCoursesByTeacher: async (teacherId) => {
                const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
                return courses.filter(c => c.teacherId === teacherId);
            }
        };
    }

    // Initialize assignments file if empty
    async initAssignmentsFile() {
        try {
            const response = await fetch(this.assignmentsFile);
            const text = await response.text();
            if (!text.trim()) {
                await this.saveAssignments([]);
            }
        } catch (error) {
            await this.saveAssignments([]);
        }
    }

    // Read assignments from file
    async getAssignments() {
        try {
            const response = await fetch(this.assignmentsFile);
            const text = await response.text();
            if (!text.trim()) return [];
            return JSON.parse(text);
        } catch (error) {
            const stored = localStorage.getItem('lms_assignments');
            return stored ? JSON.parse(stored) : [];
        }
    }

    // Save assignments to file
    async saveAssignments(assignments) {
        localStorage.setItem('lms_assignments', JSON.stringify(assignments));
        return true;
    }

    // Get all assignments
    async getAllAssignments() {
        return await this.getAssignments();
    }

    // Get assignments by course ID
    async getAssignmentsByCourse(courseId) {
        const assignments = await this.getAssignments();
        return assignments.filter(a => a.courseId === courseId);
    }

    // Create assignment
    async createAssignment(assignmentData) {
        const { courseId, title, description, dueDate, maxScore } = assignmentData;

        if (!courseId || !title) {
            return { success: false, message: 'Course ID and title are required' };
        }

        const assignments = await this.getAssignments();

        const newAssignment = {
            id: Date.now().toString(),
            courseId,
            title: title.trim(),
            description: description || '',
            dueDate: dueDate || null,
            maxScore: maxScore || 100,
            createdAt: new Date().toISOString()
        };

        assignments.push(newAssignment);
        await this.saveAssignments(assignments);

        return { success: true, message: 'Assignment created successfully', assignment: newAssignment };
    }

    // Update grade for a student in a course
    async updateGrade(studentId, courseId, grade) {
        const enrollmentManager = this.getEnrollmentManager();
        const enrollments = await enrollmentManager.getAllEnrollments();
        const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);

        if (!enrollment) {
            return { success: false, message: 'Enrollment not found' };
        }

        // Validate grade
        const gradeNum = parseFloat(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            return { success: false, message: 'Grade must be a number between 0 and 100' };
        }

        enrollment.grade = gradeNum;
        await enrollmentManager.saveEnrollments(enrollments);

        return { success: true, message: 'Grade updated successfully', enrollment };
    }

    // Get students enrolled in teacher's courses
    async getStudentsForTeacher(teacherId) {
        const courseManager = this.getCourseManager();
        const enrollmentManager = this.getEnrollmentManager();
        const courses = await courseManager.getCoursesByTeacher(teacherId);
        const enrollments = await enrollmentManager.getAllEnrollments();
        
        const students = [];
        courses.forEach(course => {
            const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
            courseEnrollments.forEach(enrollment => {
                if (!students.find(s => s.studentId === enrollment.studentId)) {
                    students.push({
                        studentId: enrollment.studentId,
                        studentName: enrollment.studentName,
                        courseId: course.id,
                        courseName: course.name,
                        grade: enrollment.grade,
                        enrollmentId: enrollment.id
                    });
                }
            });
        });

        return students;
    }

    // Get grades for a specific course
    async getCourseGrades(courseId) {
        const enrollmentManager = this.getEnrollmentManager();
        const enrollments = await enrollmentManager.getEnrollmentsByCourse(courseId);
        return enrollments.map(e => ({
            studentId: e.studentId,
            studentName: e.studentName,
            grade: e.grade,
            enrolledAt: e.enrolledAt
        }));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherManager;
}
