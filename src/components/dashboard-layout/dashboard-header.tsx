import { HeaderNav } from "@/components/dashboard-layout/dashboard-header-nav";
import { siteUrls } from "@/config/site-urls";
import Link from "next/link";

export function Header() {
  return (
    <header className="grid h-24 w-full gap-4 border-b border-dashed border-border">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col justify-between border-x border-dashed border-border px-4 pt-4">
        <div className="flex w-full items-center justify-between">
          <Link href={siteUrls.dashboard.base} className="font-semibold">
            GFE Assignment
          </Link>
        </div>

        <HeaderNav />
      </div>
    </header>
  );
}
