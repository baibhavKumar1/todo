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
    domain: String,
    metrics: [{
        name: String,
        target: String,
        unit: String
    }],
    resources: [String],
    resources_needed: [String],
    constraints: [String],
    assumptions: [String],
    deadline: String,
    deadline_suggestion: String,
    deadline_violation: Boolean,
    confidence: Number,
    total_estimated_hours: Number,
    predicted_completion: String,
    rationale: String,
    changes: [{
        task_id: String,
        action: String,
        from: String,
        to: String,
        reason: String,
        impact: String
    }],
    milestones: [{
        id: String,
        title: String,
        description: String,
        estimate_hours: Number,
        dependencies: [String],
        acceptance_criteria: [String],
        tasks: [{
            id: String,
            title: String,
            description: String,
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

// Force delete the model in development if we need to update the schema
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Project;
}

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
