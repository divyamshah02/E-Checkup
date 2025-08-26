const mockData = {
  hod: {
    user: { name: "Dr. Anil Kumar", role: "Head of Department" },
    stats: { totalCases: 125, pendingReview: 12, completedToday: 8, slaBreaches: 2 },
    cases: [
      {
        caseId: "C001",
        policyHolder: "Ramesh Kumar",
        caseType: "VMER",
        status: "Pending Review",
        priority: "Urgent",
        assignedTo: "Dr. Sharma",
        createdOn: "2025-01-10",
      },
      {
        caseId: "C002",
        policyHolder: "Sunita Devi",
        caseType: "DC Visit",
        status: "Completed",
        priority: "Normal",
        assignedTo: "Dr. Gupta",
        createdOn: "2025-01-09",
      },
    ],
  },
  coordinator: {
    user: { name: "Sarah Johnson", role: "Coordinator" },
    telecallers: [
      { id: "TC01", name: "Amit Patel" },
      { id: "TC02", name: "Priya Singh" },
      { id: "TC03", name: "Rajesh Verma" },
    ],
    cases: [
      {
        caseId: "C003",
        policyHolder: "Vijay Singh",
        caseType: "VMER",
        status: "Scheduling Pending",
        priority: "Urgent",
        assignedOn: "2025-01-15",
        slaDaysLeft: 1,
        telecallerId: "TC01",
        schedules: [{ id: 1, type: "VMER Call", dateTime: "2025-01-20T10:00", status: "Scheduled" }],
      },
      {
        caseId: "C004",
        policyHolder: "Anjali Mehta",
        caseType: "DC Visit",
        status: "Report Upload Pending",
        priority: "High",
        assignedOn: "2025-01-14",
        slaDaysLeft: 3,
        telecallerId: "TC02",
        schedules: [
          { id: 2, type: "DC Visit", dateTime: "2025-01-18T14:30", status: "Completed", dc: "Apollo Diagnostics" },
        ],
      },
      {
        caseId: "C005",
        policyHolder: "Sanjay Gupta",
        caseType: "Online",
        status: "Tele-caller Assignment Pending",
        priority: "Normal",
        assignedOn: "2025-01-16",
        slaDaysLeft: 5,
        telecallerId: null,
        schedules: [],
      },
      {
        caseId: "C006",
        policyHolder: "Pooja Sharma",
        caseType: "DC Visit",
        status: "Scheduling Pending",
        priority: "Normal",
        assignedOn: "2025-01-16",
        slaDaysLeft: 4,
        telecallerId: "TC01",
        schedules: [],
      },
    ],
  },
  telecaller: {
    user: { name: "Amit Patel", id: "TC01" },
    cases: [
      {
        caseId: "C003",
        policyHolder: "Vijay Singh",
        caseType: "VMER",
        status: "Scheduling Pending",
        priority: "Urgent",
        assignedOn: "2025-01-15",
        schedules: [{ id: 1, type: "VMER Call", dateTime: "2025-01-20T10:00", status: "Scheduled" }],
      },
      {
        caseId: "C006",
        policyHolder: "Pooja Sharma",
        caseType: "DC Visit",
        status: "Scheduling Pending",
        priority: "Normal",
        assignedOn: "2025-01-16",
        schedules: [],
      },
    ],
  },
}

localStorage.setItem("hodMockData", JSON.stringify(mockData.hod))
localStorage.setItem("coordinatorMockData", JSON.stringify(mockData.coordinator))
localStorage.setItem("telecallerMockData", JSON.stringify(mockData.telecaller))
