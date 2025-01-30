import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Plus,
  SquareTerminal,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { CreateCategoryDialog } from "./category-dialog"
import { NavProjects } from "./nav-projects"


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
  }

  const categories = (useLiveQuery(() => db.categories.toArray(), []) ?? []).map(
    cat => (
      {
        name: cat.name,
        url: `/${cat.name}`,
        icon: SquareTerminal,
        // isActive: true,
        // items: [{
        //   title: cat.name + " Paper",
        //   url: "/" + cat.name,
        // }],
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
          {/* <NavMain items={categories} /> */}
          <NavProjects items={categories} />
        </SidebarContent>
        <SidebarFooter>

          <SidebarGroup>
            <SidebarGroupLabel>Category</SidebarGroupLabel>
            <SidebarGroupAction
              onClick={() => {
                setOpenCategoryDialog(true)
              }}
            >
              <Plus /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction>
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
