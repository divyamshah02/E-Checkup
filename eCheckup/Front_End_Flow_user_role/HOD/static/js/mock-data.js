function getMockCases() {
  const policyHolders = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sunita Devi",
    "Vikram Singh",
    "Anjali Mehta",
    "Sanjay Verma",
    "Meena Gupta",
    "Arun Joshi",
    "Kavita Reddy",
  ]
  const coordinators = ["Aarav Sharma", "Isha Singh", "Rohan Gupta", "Diya Patel", "Kabir Mehta"]
  const caseTypes = ["vmer", "dc-visit", "online"]
  const statuses = ["pending", "in-progress", "completed"]
  const cases = []

  for (let i = 1; i <= 200; i++) {
    const caseType = caseTypes[i % 3]
    const status = statuses[i % 3]
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)

    const history = [
      {
        stage: "Case Created",
        user: "Manager",
        date: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "Initial case creation.",
      },
      {
        stage: "Coordinator Assigned",
        user: "Manager",
        date: new Date(date.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "Assigned to coordinator for scheduling.",
      },
    ]

    if (status === "in-progress" || status === "completed") {
      history.push({
        stage: "Appointment Scheduled",
        user: "Tele-caller",
        date: new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "Appointment confirmed with policy holder.",
      })
      if (caseType === "dc-visit") {
        history.push({
          stage: "DC Visit Completed",
          user: "DC Center",
          date: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          notes: "Checkup complete, reports pending.",
        })
      } else {
        // VMER & Online
        history.push({
          stage: "VMER Call Completed",
          user: "Coordinator",
          date: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          notes: "Video call finished successfully.",
        })
      }
    }
    if (status === "completed") {
      history.push({
        stage: "Reports Uploaded",
        user: caseType === "dc-visit" ? "DC Center" : "Coordinator",
        date: new Date(date.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "All necessary documents are uploaded.",
      })
      history.push({
        stage: "Case Closed",
        user: "HOD",
        date: date.toISOString().split("T")[0],
        notes: "Case verified and closed.",
      })
    }

    cases.push({
      id: `LIC-2024-${String(i).padStart(4, "0")}`,
      policyHolder: policyHolders[i % policyHolders.length],
      type: caseType,
      status: status,
      assignedTo: coordinators[i % coordinators.length],
      date: date.toISOString().split("T")[0],
      details: {
        policyNumber: `POL${Math.floor(100000 + Math.random() * 900000)}`,
        sumAssured: `${Math.floor(5 + Math.random() * 95)} Lacs`,
        contact: `+91 98765${Math.floor(10000 + Math.random() * 90000)}`,
        email: `user${i}@example.com`,
      },
      history: history,
    })
  }
  return cases
}
// CRITICAL FIX: Generate and store data in localStorage on script load
// This makes the data available to all pages (dashboard, case-details, etc.)
;(() => {
  if (!localStorage.getItem("mockCases")) {
    const cases = getMockCases()
    localStorage.setItem("mockCases", JSON.stringify(cases))
  }
})()
