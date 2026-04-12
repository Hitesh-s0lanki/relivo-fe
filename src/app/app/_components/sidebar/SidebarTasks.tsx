const CHATS = [
  { id: "1", title: "Review of Strique.io Platform" },
  { id: "4", title: "Which model do you use" },
  { id: "2", title: "Skill Creator for GitHub Development" },
  { id: "3", title: "Launch a Meta Campaign" },
];

export function SidebarTasks() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-4">
      <p className="px-2.5 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
        All chats
      </p>
      {CHATS.map((chat) => (
        <button
          key={chat.id}
          className="group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
        >
          <span className="truncate text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
            {chat.title}
          </span>
        </button>
      ))}
    </div>
  );
}
