import {
  Bell,
  Menu,
  Search,
  ChevronDown,
} from "lucide-react";

function Topbar({ setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:w-[280px]">
          <Search size={17} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search security features..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            /
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            K
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-semibold text-slate-800">
              Kritika
            </p>
            <p className="text-[10px] text-slate-400">
              Protected Account
            </p>
          </div>

          <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}

export default Topbar;