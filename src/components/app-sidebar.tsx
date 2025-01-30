import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Plus,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { CreateCategoryDialog } from "./category-dialog"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Library",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }

  const categories = (useLiveQuery(() => db.categories.toArray(), []) ?? []).map(
    cat => (
      {
        title: cat.name,
        url: "",
        icon: SquareTerminal,
        isActive: true,
        items: [{
          title: cat.name + " Projects",
          url: "dashboard/" + cat.name,
        }],
      })
  )

  const [openCategoryDialog, setOpenCategoryDialog] = React.useState(false)
  return (
    <>
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={categories}  />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setOpenCategoryDialog(true)
                }}
                tooltip={'Create Category'}>
                <Plus className="mr-2" />
                <span className="text-sm">Add Category</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <CreateCategoryDialog 
      open={openCategoryDialog} 
      onOpenChange={setOpenCategoryDialog}
    />
</>
  )
}
