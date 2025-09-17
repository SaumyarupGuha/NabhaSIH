import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["patient"]}>{children}</ProtectedRoute>
}
