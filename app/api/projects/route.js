import dbConnect from '../../../lib/mongodb';
import Project from '../../../lib/models/Project';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId') || 'default_user';

        const projects = await Project.find({ userId }).sort({ updatedAt: -1 }).select('_id goal projectName');

        return Response.json(projects);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
