// Courses Module - Handles course creation, reading, updating, and deletion

class CourseManager {
    constructor() {
        this.coursesFile = '../data/courses.txt.txt';
    }

    // Initialize courses file if empty
    async initCoursesFile() {
        try {
            const response = await fetch(this.coursesFile);
            const text = await response.text();
            if (!text.trim()) {
                await this.saveCourses([]);
            }
        } catch (error) {
            await this.saveCourses([]);
        }
    }

    // Read courses from storage or seed demo data
    async getCourses() {
        // Prefer localStorage so teacher-created courses persist
        const stored = localStorage.getItem('lms_courses');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (error) {
                console.warn('Invalid courses in localStorage, refetching...', error);
            }
        }

        // Attempt to fetch from bundled data file
        let courses = [];
        try {
            const response = await fetch(this.coursesFile);
            const text = await response.text();
            if (text && text.trim()) {
                courses = JSON.parse(text);
            }
        } catch (error) {
            console.warn('Unable to load courses file, using fallback data.', error);
        }

        // Seed default demo courses if none exist
        if (!Array.isArray(courses) || courses.length === 0) {
            courses = this.getDefaultCourses();
        }

        await this.saveCourses(courses);
        return courses;
    }

    // Save courses to file
    async saveCourses(courses) {
        localStorage.setItem('lms_courses', JSON.stringify(courses));
        return true;
    }

    // Provide default demo courses so students can browse immediately
    getDefaultCourses() {
        const now = new Date().toISOString();
        return [
            {
                id: 'demo-course-1',
                name: 'Introduction to Web Development',
                description: 'Learn the fundamentals of HTML, CSS, and JavaScript by building interactive pages.',
                teacherId: 'demo-teacher-1',
                teacherName: 'Ayesha Khan',
                createdAt: now,
                students: []
            },
            {
                id: 'demo-course-2',
                name: 'Data Structures Basics',
                description: 'Understand arrays, stacks, queues, and linked lists with hands-on exercises.',
                teacherId: 'demo-teacher-2',
                teacherName: 'Michael Chen',
                createdAt: now,
                students: []
            },
            {
                id: 'demo-course-3',
                name: 'Creative Writing Workshop',
                description: 'Sharpen your storytelling skills through prompts, peer reviews, and feedback.',
                teacherId: 'demo-teacher-3',
                teacherName: 'Priya Desai',
                createdAt: now,
                students: []
            }
        ];
    }

    // Get all courses
    async getAllCourses() {
        return await this.getCourses();
    }

    // Get course by ID
    async getCourseById(courseId) {
        const courses = await this.getCourses();
        return courses.find(c => c.id === courseId);
    }

    // Get courses by teacher ID
    async getCoursesByTeacher(teacherId) {
        const courses = await this.getCourses();
        return courses.filter(c => c.teacherId === teacherId);
    }

    // Create a new course
    async createCourse(courseData) {
        const { name, description, teacherId, teacherName } = courseData;

        if (!name || name.trim().length === 0) {
            return { success: false, message: 'Course name is required' };
        }
        if (!teacherId) {
            return { success: false, message: 'Teacher ID is required' };
        }

        const courses = await this.getCourses();

        // Check if course name already exists
        if (courses.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, message: 'Course name already exists' };
        }

        const newCourse = {
            id: Date.now().toString(),
            name: name.trim(),
            description: description || '',
            teacherId,
            teacherName: teacherName || 'Unknown Teacher',
            createdAt: new Date().toISOString(),
            students: []
        };

        courses.push(newCourse);
        await this.saveCourses(courses);

        return { success: true, message: 'Course created successfully', course: newCourse };
    }

    // Update course
    async updateCourse(courseId, courseData) {
        const courses = await this.getCourses();
        const index = courses.findIndex(c => c.id === courseId);

        if (index === -1) {
            return { success: false, message: 'Course not found' };
        }

        courses[index] = {
            ...courses[index],
            ...courseData,
            id: courseId // Ensure ID doesn't change
        };

        await this.saveCourses(courses);
        return { success: true, message: 'Course updated successfully', course: courses[index] };
    }

    // Delete course
    async deleteCourse(courseId) {
        const courses = await this.getCourses();
        const filtered = courses.filter(c => c.id !== courseId);

        if (courses.length === filtered.length) {
            return { success: false, message: 'Course not found' };
        }

        await this.saveCourses(filtered);
        return { success: true, message: 'Course deleted successfully' };
    }

    // Search courses
    async searchCourses(query) {
        const courses = await this.getCourses();
        const lowerQuery = query.toLowerCase();
        return courses.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery) ||
            c.teacherName.toLowerCase().includes(lowerQuery)
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CourseManager;
}

