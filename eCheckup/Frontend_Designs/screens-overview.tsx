import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Calendar, Settings, BarChart3, Bell, Upload, Video, DollarSign, Shield } from "lucide-react"

export default function ScreensOverview() {
  const userRoles = [
    {
      role: "Admin",
      color: "bg-red-100 text-red-800",
      screens: [
        "Login/Authentication",
        "Admin Dashboard",
        "User Management",
        "Role Management",
        "System Settings",
        "Audit Logs",
        "Global Reports & Analytics",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "HOD (Head of Department)",
      color: "bg-purple-100 text-purple-800",
      screens: [
        "Login/Authentication",
        "HOD Dashboard",
        "Department Overview",
        "Team Performance Reports",
        "Case Analytics",
        "Resource Management",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "Manager",
      color: "bg-blue-100 text-blue-800",
      screens: [
        "Login/Authentication",
        "Manager Dashboard",
        "Case Creation",
        "Case Assignment",
        "Team Management",
        "Case Tracking",
        "Reports & Analytics",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "Assistant Manager",
      color: "bg-cyan-100 text-cyan-800",
      screens: [
        "Login/Authentication",
        "Assistant Manager Dashboard",
        "Case Creation",
        "Case Assignment",
        "Case Support",
        "Team Coordination",
        "Reports",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "Coordinator",
      color: "bg-green-100 text-green-800",
      screens: [
        "Login/Authentication",
        "Coordinator Dashboard",
        "Assigned Cases",
        "Case Management",
        "Tele Caller Assignment",
        "Status Tracking",
        "Document Review",
        "Case Forwarding",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "Tele Caller",
      color: "bg-yellow-100 text-yellow-800",
      screens: [
        "Login/Authentication",
        "Tele Caller Dashboard",
        "Assigned Cases",
        "Scheduling Interface",
        "Appointment Calendar",
        "Contact Management",
        "Call Logs",
        "Status Updates",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "DC (Diagnostic Center)",
      color: "bg-orange-100 text-orange-800",
      screens: [
        "Login/Authentication",
        "DC Dashboard",
        "Assigned Cases",
        "Schedule Management",
        "Report Upload",
        "Document Management",
        "Payment Tracking",
        "Case History",
        "Notifications Center",
        "Profile Management",
      ],
    },
    {
      role: "LIC Hierarchy (HO/Regional/Division/Branch/DO/Agent)",
      color: "bg-indigo-100 text-indigo-800",
      screens: [
        "Login/Authentication",
        "LIC Dashboard",
        "Case Viewing (Hierarchy-based)",
        "Case Approval/Review",
        "Subordinate Cases",
        "Case Analytics",
        "Reports",
        "Case History",
        "Notifications Center",
        "Profile Management",
      ],
    },
  ]

  const commonScreens = [
    { name: "Case Details View", icon: FileText, desc: "Detailed case information and history" },
    { name: "Document Upload", icon: Upload, desc: "File and document upload interface" },
    { name: "Video Call Interface (VMER)", icon: Video, desc: "Video medical examination interface" },
    { name: "Finance/Invoicing", icon: DollarSign, desc: "Financial management and invoicing" },
    { name: "Calendar/Scheduling", icon: Calendar, desc: "Appointment and schedule management" },
    { name: "Search & Filters", icon: Settings, desc: "Advanced search and filtering options" },
    { name: "Notifications Management", icon: Bell, desc: "Notification preferences and history" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">LIC Case Management - Screen Architecture</h1>
          <p className="text-xl text-gray-600">Complete frontend screen mapping for all user roles</p>
        </div>

        {/* Role-based Screens */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Role-based Screen Requirements</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {userRoles.map((role, index) => (
              <Card key={index} className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    {role.role}
                    <Badge className={role.color}>{role.screens.length} screens</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {role.screens.map((screen, screenIndex) => (
                      <div key={screenIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium">
                          {screenIndex + 1}
                        </div>
                        <span className="text-sm font-medium">{screen}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Common Screens */}
        <Card>
          <CardHeader>
            <CardTitle>Common Screens (Used across multiple roles)</CardTitle>
            <CardDescription>Shared interfaces with role-based access controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonScreens.map((screen, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <screen.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{screen.name}</h4>
                    <p className="text-xs text-gray-600">{screen.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screen Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Screen Categories Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-medium">Authentication</h4>
                <p className="text-sm text-gray-600">Login, Registration, Password Reset</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-medium">Dashboards</h4>
                <p className="text-sm text-gray-600">Role-specific overview screens</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-medium">Case Management</h4>
                <p className="text-sm text-gray-600">Creation, tracking, assignment</p>
              </div>
              <div className="space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-medium">Administration</h4>
                <p className="text-sm text-gray-600">Settings, users, reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">Frontend Framework</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• HTML5 semantic markup</li>
                  <li>• Bootstrap 5.3+ for responsive design</li>
                  <li>• Vanilla JavaScript for interactions</li>
                  <li>• CSS3 for custom styling</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Responsive Design</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Mobile-first approach</li>
                  <li>• Breakpoints: xs, sm, md, lg, xl</li>
                  <li>• Touch-friendly interfaces</li>
                  <li>• Progressive Web App features</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-purple-600">UI/UX Standards</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Professional color scheme</li>
                  <li>• Consistent navigation patterns</li>
                  <li>• Accessibility compliance</li>
                  <li>• Loading states and feedback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Ready to start designing individual screens</h3>
          <p className="text-gray-600">
            Each screen will be built with Bootstrap components, responsive design, and role-specific functionality
          </p>
        </div>
      </div>
    </div>
  )
}
