// Controller for teacher logic
module.exports = {
    getAllTeachers: () => {
        return [
            { id: 1, name: "Ali", subject: "Math" },
            { id: 2, name: "Ayesha", subject: "Science" },
        ];
    },

    addTeacher: (teacherData) => {
        return {
            message: "Teacher added",
            teacher: teacherData
        };
    }
};
