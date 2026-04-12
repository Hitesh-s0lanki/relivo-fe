import { TaskInputArea } from "./_components/home/TaskInputArea";
import { QuickActions } from "./_components/home/QuickActions";

export default function AppHome() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
        <TaskInputArea />
        <QuickActions />
      </div>
    </div>
  );
}
