import { LayoutDashboard, Settings, Users } from 'lucide-react'
import ProvinceOverview from './features/kpi-dashboard/ProvinceOverview'
import BranchOverview from './features/branch-detail/BranchOverview'
import AdminSettings from './features/admin-config/AdminSettings'

const routes = [
  {
    path: '/',
    label: 'ภาพรวมจังหวัด',
    icon: LayoutDashboard,
    element: <ProvinceOverview />,
    role: 'user',
  },
  {
    path: '/branch',
    label: 'ภาพรวมสาขา',
    icon: Users,
    element: <BranchOverview />,
    role: 'user',
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: Settings,
    element: <AdminSettings />,
    role: 'admin',
  },
]

export default routes
