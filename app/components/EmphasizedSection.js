'use client';

import TaskCard from './TaskCard';

export default function EmphasizedSection({ tasks, onAction, isCompletedMap, scheduledTasks = [] }) {
    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
            <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-widest">Priority Assignments</h3>
                <span className="bg-amber-100 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {tasks.length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(task => {
                    const scheduledTask = scheduledTasks.find(st => st.task_id === task.id);
                    return (
                        <div key={task.id} className="relative">
                            {/* Highlighting wrapper */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-20 transition duration-1000 group-hover:duration-200"></div>
                            <TaskCard
                                task={task}
                                onAction={onAction}
                                isCompleted={isCompletedMap[task.id]}
                                isEmphasized={true}
                                date={scheduledTask?.date}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
