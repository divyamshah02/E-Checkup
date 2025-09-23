import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, Video, Calendar, Bell, DollarSign, BarChart3, Shield, Building2, Upload } from "lucide-react"

export default function SystemOverview() {
  const caseTypes = [
    {
      type: "VMER",
      description: "Video Medical Examination Report",
      process: "Video call diagnosis without DC visit",
      stakeholders: ["Coordinator", "Tele Caller", "Policy Holder"],
    },
    {
      type: "DC Visit",
      description: "Diagnostic Center Visit",
      process: "Physical visit to diagnostic center",
      options: ["Paid by LIC/Self", "New/Reviving Policy"],
      stakeholders: ["Coordinator", "Tele Caller", "DC", "Policy Holder"],
    },
  ]

  const userRoles = [
    { role: "Admin", level: "System", access: "Full system access" },
    { role: "HOD", level: "Main", access: "Department oversight" },
    { role: "Manager", level: "Operations", access: "Case creation & management" },
    { role: "Asst Manager", level: "Operations", access: "Case creation & support" },
    { role: "Coordinator", level: "Operations", access: "Case coordination" },
    { role: "Tele Caller", level: "Operations", access: "Scheduling & communication" },
    { role: "DC", level: "External", access: "Report upload & management" },
  ]

  const licHierarchy = [
    "HO (Head Office) - Can see all cases",
    "Regional Office - Regional cases",
    "Divisional Office - Division cases",
    "Branch - Branch cases",
    "DO (Development Officer) - DO cases",
    "Agent - Own cases only",
  ]

  const keyFeatures = [
    { icon: FileText, title: "Case Management", desc: "Create, assign, and track cases" },
    { icon: Video, title: "VMER Integration", desc: "Video call scheduling and recording" },
    { icon: Calendar, title: "Scheduling System", desc: "Appointment management" },
    { icon: Bell, title: "Notifications", desc: "Email/SMS/Push notifications" },
    { icon: Upload, title: "Document Upload", desc: "Reports and video uploads" },
    { icon: DollarSign, title: "Finance Module", desc: "Invoicing and payments" },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Operational insights" },
    { icon: Shield, title: "Role-based Access", desc: "Hierarchical permissions" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">LIC Medical Verification Case Management System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive platform for managing policyholder medical verification cases with VMER and DC visit workflows
          </p>
        </div>

        {/* Case Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Case Types & Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {caseTypes.map((caseType, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{caseType.type}</h3>
                  <Badge variant="outline">{caseType.type === "VMER" ? "Video" : "Physical"}</Badge>
                </div>
                <p className="text-sm text-gray-600">{caseType.description}</p>
                <p className="text-sm">{caseType.process}</p>
                {caseType.options && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Options:</p>
                    {caseType.options.map((option, i) => (
                      <Badge key={i} variant="secondary" className="mr-2">
                        {option}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Stakeholders:</p>
                  <div className="flex flex-wrap gap-1">
                    {caseType.stakeholders.map((stakeholder, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Roles & Access Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRoles.map((user, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{user.role}</h4>
                    <Badge
                      variant={
                        user.level === "System"
                          ? "default"
                          : user.level === "Main"
                            ? "destructive"
                            : user.level === "Operations"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {user.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.access}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LIC Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              LIC Organizational Hierarchy
            </CardTitle>
            <CardDescription>Each level can view their own and subordinate cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {licHierarchy.map((level, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>System Features & Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyFeatures.map((feature, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">Frontend</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Responsive web application</li>
                  <li>• Mobile app (iOS/Android)</li>
                  <li>• Real-time dashboard</li>
                  <li>• File upload interface</li>
                  <li>• Calendar integration</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Backend</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• RESTful API</li>
                  <li>• Authentication & authorization</li>
                  <li>• Notification service</li>
                  <li>• File storage system</li>
                  <li>• Database management</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-purple-600">Infrastructure</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Cloud hosting</li>
                  <li>• Database (PostgreSQL)</li>
                  <li>• File storage (AWS S3)</li>
                  <li>• Email/SMS gateway</li>
                  <li>• Video call integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Phase 1: Core System</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• User management & authentication</li>
                  <li>• Case creation & assignment</li>
                  <li>• Basic workflow implementation</li>
                  <li>• Database schema design</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Phase 2: Advanced Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Video call integration</li>
                  <li>• Notification system</li>
                  <li>• File upload & management</li>
                  <li>• Finance module</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Start Development Planning
          </Button>
        </div>
      </div>
    </div>
  )
}
