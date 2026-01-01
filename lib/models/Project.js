import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
        default: 'default_user' // Simple placeholder for now
    },
    goal: String,
    objective: String,
    deadline: String,
    confidence: Number,
    predicted_completion: String,
    milestones: [{
        id: String,
        title: String,
        description: String,
        acceptance_criteria: [String],
        tasks: [{
            id: String,
            title: String,
            priority: String,
            estimate_hours: Number,
            tags: [String],
            steps: [{
                title: String,
                isCompleted: { type: Boolean, default: false }
            }],
            guidance: {
                context: String,
                action_plan: [String],
                ai_prompt: String,
                generatedAt: Date
            }
        }]
    }],
    scheduled_tasks: [{
        task_id: String,
        date: String,
        estimate_hours: Number
    }],
    progressUpdates: [{
        task_id: String,
        date: String,
        status: String,
        percent_complete: Number,
        notes: String
    }],
    userProfile: {
        avg_hours_per_day: Number,
        workdays: [String]
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
