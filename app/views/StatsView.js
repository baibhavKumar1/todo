'use client';
import ProgressDashboard from '../components/ProgressDashboard';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function StatsView({ plan, progressUpdates }) {
    return (
        <div className="space-y-8 animate-fade-in max-w-8xl mx-auto">
            <ProgressDashboard plan={plan} progressUpdates={progressUpdates} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Risk Factors" className="bg-slate-900/50 border-slate-800">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-400">Deadline Risk</span>
                            <Badge color="green">Low</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-400">Task Complexity</span>
                            <Badge color="amber">Medium</Badge>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
