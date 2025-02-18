"use client";

import { buttonVariants } from "@/components/ui/button";
import { SITE_URLS } from "@/config/site-urls";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0">
      <Link
        href={SITE_URLS.dashboard.tableView}
        className={buttonVariants({
          variant: "ghost",
          className: cn(
            "rounded-b-none",
            getActive(pathname, SITE_URLS.dashboard.tableView)
              ? "border-b-2 border-primary"
              : "",
          ),
        })}
      >
        Table View
      </Link>
      <Link
        href={SITE_URLS.dashboard.kanbanView}
        className={buttonVariants({
          variant: "ghost",
          className: cn(
            "rounded-b-none",
            getActive(pathname, SITE_URLS.dashboard.kanbanView)
              ? "border-b-2 border-primary"
              : "",
          ),
        })}
      >
        Kanban View
      </Link>
    </nav>
  );
}

function getActive(pathname: string, url: string) {
  return pathname === url ? true : false;
}
