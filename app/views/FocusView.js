'use client';
import FocusCard from '../components/FocusCard';

export default function FocusView({ currentTask, progressUpdates, onTaskAction, scheduledTasks }) {
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
        </div>
    );
}
