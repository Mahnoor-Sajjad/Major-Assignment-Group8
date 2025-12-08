include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <cstdio>   // for remove()
using namespace std;

/* ============================================================
   SIMPLE & CLEAN ATTENDANCE SYSTEM
   ============================================================ */

class AttendanceSystem {
private:
    vector<string> students;
    vector<bool> attendanceRecord;

public:

    // Add a new student
    void addStudent(const string &name) {
        students.push_back(name);
        attendanceRecord.push_back(false);
        cout << "? Student added successfully!\n";
    }

    // Mark student present
    void markPresent(int index) {
        if (index >= 0 && index < attendanceRecord.size()) {
            attendanceRecord[index] = true;
        }
    }

    // Show attendance nicely formatted
    void showAttendance() {
        cout << "\n===== Attendance Record =====\n";
        if (students.empty()) {
            cout << "No students found.\n";
            return;
        }

        for (int i = 0; i < students.size(); i++) {
            cout << i + 1 << ". " << students[i]
                 << " --> " << (attendanceRecord[i] ? "Present" : "Absent") << "\n";
        }
        cout << "==============================\n";
    }

    vector<string> getStudents() { return students; }
    vector<bool> getAttendance() { return attendanceRecord; }

    /* ============================================================
       EXPORT TO CSV (Deletes previous CSV automatically!)
       ============================================================ */
    bool exportToCSV(const string &filename) {

        // Delete old file if exists
        remove(filename.c_str());  
        
        ofstream file(filename);

        if (!file.is_open()) {
            cout << "? Error: Could not create CSV file.\n";
            return false;
        }

        file << "Name,Attendance\n";
        for (int i = 0; i < students.size(); i++) {
            file << students[i] << ","
                 << (attendanceRecord[i] ? "Present" : "Absent") << "\n";
        }

        file.close();
        cout << "? CSV exported successfully! (Old file deleted automatically)\n";
        return true;
    }
};


/* ============================================================
   REGRESSION TESTS (Beginner friendly)
   ============================================================ */

bool test_addStudent() {
    AttendanceSystem sys;
    sys.addStudent("Ali");
    return sys.getStudents().size() == 1;
}

bool test_markPresent() {
    AttendanceSystem sys;
    sys.addStudent("Ali");
    sys.markPresent(0);
    return sys.getAttendance()[0] == true;
}

bool test_exportToCSV() {
    AttendanceSystem sys;
    sys.addStudent("Ali");
    sys.markPresent(0);
    return sys.exportToCSV("attendance.csv");
}


/* ============================================================
   MAIN MENU
   ============================================================ */

int main() {
    AttendanceSystem system;
    int choice;

    cout << "=====================================\n";
    cout << "     Attendance Management System    \n";
    cout << "=====================================\n";

    do {
        cout << "\nChoose an option:\n";
        cout << "1. Add Student\n";
        cout << "2. Mark Attendance\n";
        cout << "3. Show Attendance\n";
        cout << "4. Export CSV\n";
        cout << "0. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1) {
            string name;
            cout << "Enter student name: ";
            cin >> name;
            system.addStudent(name);
        } 
        
        else if (choice == 2) {
            auto stds = system.getStudents();

            if (stds.empty()) {
                cout << "No students available to mark.\n";
                continue;
            }

            cout << "\nMark attendance (Enter P for present, anything else = Absent):\n";
            cout << "-------------------------------------------------------------\n";

            for (int i = 0; i < stds.size(); i++) {
                cout << stds[i] << ": ";
                string att;
                cin >> att;

                if (att == "P" || att == "p")
                    system.markPresent(i);
            }
            cout << "? Attendance marked!\n";
        } 
        
        else if (choice == 3) {
            system.showAttendance();
        } 
        
        else if (choice == 4) {
            system.exportToCSV("attendance.csv");
        }

    } while (choice != 0);

    cout << "Program ended.\n";
    return 0;
}



