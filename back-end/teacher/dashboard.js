// Sample data
const sample = {
  classes: 5,
  pending: 10,
  recent: [
    'Assignment: Database Systems - Section A',
    'Quiz: Web Engineering - Section B',
    'Attendance Update - BSCS-5',
    'Lab Report Submission - Programming Fundamentals',
    'Project Proposal - Software Engineering'
  ],
  students: [
    { id: 1, name: 'Ayesha Khan', cls: 'BSCS-1', status: 'Present', grade: 85 },
    { id: 2, name: 'Mahnoor Sajjad', cls: 'BSCS-1', status: 'Absent', grade: 78 },
    { id: 3, name: 'Warda Mehmood', cls: 'BSCS-3', status: 'Present', grade: 92 },
    { id: 4, name: 'Hamza Ali', cls: 'BSCS-5', status: 'Present', grade: 88 },
    { id: 5, name: 'Muhammad Abbas', cls: 'BSIT-2', status: 'Present', grade: 90 },
    { id: 6, name: 'Muhammad Danyal', cls: 'BSIT-2', status: 'Absent', grade: 74 },
    { id: 7, name: 'Muhammad Irshad', cls: 'BSSE-4', status: 'Present', grade: 95 },
    { id: 8, name: 'Shayan Ali Khan', cls: 'BSSE-4', status: 'Present', grade: 89 },
  ]
};

// Fill cards
document.getElementById('classes-count').textContent = sample.classes;
document.getElementById('pending-approvals').textContent = sample.pending;

// Fill Recent Submissions as badges
const recentList = document.getElementById('recent-list');
sample.recent.forEach(item => {
  const span = document.createElement('span');
  span.textContent = item;
  span.classList.add('tag');
  recentList.appendChild(span);
});

// Calculate average grade
const avgGrade = Math.round(sample.students.reduce((sum, s) => sum + s.grade, 0) / sample.students.length);
document.getElementById('average-grade').textContent = avgGrade;

// Fill Student Table
const tbody = document.getElementById('student-rows');
sample.students.forEach(student => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.cls}</td>
    <td class="status-${student.status.toLowerCase()}">${student.status}</td>
    <td class="grade">${student.grade}</td>
  `;
  tbody.appendChild(tr);
});
