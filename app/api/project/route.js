import dbConnect from '../../../lib/mongodb';
import Project from '../../../lib/models/Project';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('id');
        const userId = searchParams.get('userId') || 'default_user';

        let project;
        if (projectId) {
            project = await Project.findById(projectId);
        } else {
            project = await Project.findOne({ userId }).sort({ updatedAt: -1 });
        }

        if (!project) {
            return Response.json({ message: 'No project found' }, { status: 404 });
        }

        // --- Stall Detection Logic ---
        // Convert to plain object to add custom fields
        const projectObj = project.toObject();
        let stalledTaskId = null;

        if (projectObj.scheduled_tasks && projectObj.scheduled_tasks.length > 0) {
            const today = new Date().toISOString().split('T')[0];

            // Find the first task that was scheduled for today or earlier but isn't done
            const candidate = projectObj.scheduled_tasks.find(st => {
                const isDone = projectObj.progressUpdates?.some(pu => pu.task_id === st.task_id && pu.status === 'done');
                return st.date <= today && !isDone;
            });

            if (candidate) {
                // If the task was scheduled for BEFORE today, it's definitely stalled
                if (candidate.date < today) {
                    stalledTaskId = candidate.task_id;
                }
            }
        }

        return Response.json({ ...projectObj, stalled_task_id: stalledTaskId });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const userId = body.userId || 'default_user';
        console.log('POST /api/project - userId:', userId);

        const project = await Project.findOneAndUpdate(
            { userId },
            { ...body, updatedAt: Date.now() },
            { upsert: true, new: true, runValidators: true }
        );

        console.log('Project updated/created:', project._id);
        return Response.json(project);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
