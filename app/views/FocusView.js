'use client';
import FocusCard from '../components/FocusCard';
import EmphasizedSection from '../components/EmphasizedSection';

export default function FocusView({ currentTask, progressUpdates, onTaskAction, emphasizedTasks, scheduledTasks }) {
    const isCompletedMap = progressUpdates.reduce((acc, p) => {
        if (p.status === 'done') acc[p.task_id] = true;
        return acc;
    }, {});

    const isStalled = currentTask && currentTask.date < new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
            <FocusCard
                task={currentTask}
                onAction={onTaskAction}
                isStalled={isStalled}
            />
            {emphasizedTasks.length > 0 && (
                <EmphasizedSection
                    tasks={emphasizedTasks}
                    onAction={onTaskAction}
                    isCompletedMap={isCompletedMap}
                    scheduledTasks={scheduledTasks}
                />
            )}
        </div>
    );
}
