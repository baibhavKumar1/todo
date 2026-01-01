'use client';

import { useState, useEffect, useRef } from 'react';

export default function useProject() {
    const [goalText, setGoalText] = useState('');
    const [optionalDeadline, setOptionalDeadline] = useState('');
    const [userProfile, setUserProfile] = useState({ avg_hours_per_day: 4, workdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] });
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [projectId, setProjectId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [progressUpdates, setProgressUpdates] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState('focus');
    const [chatInput, setChatInput] = useState('');
    const [selectedTaskForGuidance, setSelectedTaskForGuidance] = useState(null);
    const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
    const [emphasizedTaskIds, setEmphasizedTaskIds] = useState([]);
    const [agentTrace, setAgentTrace] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const chatMessagesRef = useRef(null);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchProject = async (id = null) => {
        try {
            const url = id ? `/api/project?id=${id}` : '/api/project';
            const res = await fetch(url);
            if (res.ok) {
                const projectData = await res.json();
                setData(projectData);
                setProjectId(projectData._id);
                if (projectData.progressUpdates) setProgressUpdates(projectData.progressUpdates);
                if (projectData.userProfile) setUserProfile(projectData.userProfile);
            }
        } catch (err) {
            console.error('Failed to fetch project:', err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const projectsData = await res.json();
                setProjects(projectsData);
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    };

    useEffect(() => {
        fetchProject();
        fetchProjects();
    }, []);

    const syncWithDB = async (newData) => {
        let flattenedData = { ...newData };
        if (newData.updated_plan) {
            flattenedData = { ...flattenedData, ...newData.updated_plan };
            delete flattenedData.updated_plan;
        }

        const updated = { ...data, ...flattenedData, progressUpdates, userProfile };
        setData(updated);

        try {
            await fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
        } catch (err) {
            console.error('Failed to sync with MongoDB:', err);
        }
    };

    const callApi = async (endpoint, body) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (res.ok) {
                if (result.ui_action) handleUIAction(result.ui_action);
                syncWithDB(result);
                addToast(result.message || 'Operation successful!', 'success');
            } else {
                addToast(result.error || 'An error occurred', 'error');
            }
        } catch (error) {
            addToast(error.message, 'error');
        }
        setLoading(false);
    };

    const handleUIAction = (action) => {
        if (!action) return;
        switch (action.type) {
            case 'NAVIGATE':
                if (action.payload?.tab) setActiveTab(action.payload.tab);
                if (action.payload?.milestoneIndex !== undefined) setActiveMilestoneIndex(action.payload.milestoneIndex);
                break;
            case 'EMPHASIZE':
                if (action.payload?.task_id) {
                    setEmphasizedTaskIds(prev => [...new Set([...prev, action.payload.task_id])]);
                }
                break;
            case 'TOAST':
                addToast(action.payload?.message, action.payload?.type || 'info');
                break;
        }
    };

    const handleInferGoal = async () => {
        if (!goalText) {
            addToast('Please enter a goal', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/goal-inference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal_text: goalText, optional_deadline: optionalDeadline, user_profile: userProfile }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            setAgentTrace(["Analyzing your request...", "Inferring milestones..."]);
            setChatInput("AI is generating your plan...");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;
                // Periodic feedback
                if (accumulated.length % 100 === 0) {
                    setAgentTrace(prev => [...prev, "Structuring data..."]);
                }
            }

            let responseText = accumulated.trim();
            if (responseText.startsWith('```json')) responseText = responseText.slice(7, -3).trim();
            else if (responseText.startsWith('```')) responseText = responseText.slice(3, -3).trim();

            const result = JSON.parse(responseText);
            setData(result);
            await syncWithDB(result);
            addToast('Goal inferred! Building blueprint...', 'success');
            // Chain to decomposition
            await handleDecompose(result);
        } catch (err) {
            console.error(err);
            addToast('Failed to infer goal', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDecompose = async (inputData = null) => {
        const sourceData = inputData || data;
        setLoading(true);
        try {
            const res = await fetch('/api/decomposition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal_struct: sourceData, max_milestones: 5 }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
            }

            let responseText = accumulated.trim();
            if (responseText.startsWith('```json')) responseText = responseText.slice(7, -3).trim();
            else if (responseText.startsWith('```')) responseText = responseText.slice(3, -3).trim();

            const result = JSON.parse(responseText);
            const newData = { ...sourceData, milestones: result.milestones };
            setData(newData);
            await syncWithDB(newData);
            addToast('Plan generated! Scheduling tasks...', 'success');

            // Chain to scheduling
            await handleSchedule(newData.milestones, newData.deadline);
        } catch (err) {
            console.error(err);
            addToast('Decomposition failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (milestones = null, deadline = null) => {
        await callApi('scheduling', {
            milestones: milestones || data.milestones,
            deadline: deadline || data.deadline,
            user_availability: { workdays: userProfile.workdays, hours_per_day: userProfile.avg_hours_per_day, blackouts: [] },
            max_daily_utilization: 0.8,
        });
        setActiveTab('schedule');
    };

    const handleTaskAction = (taskId, action) => {
        if (action === 'complete' || action === 'skipped' || action === 'mark-done') {
            const newUpdate = {
                task_id: taskId,
                date: new Date().toISOString().split('T')[0],
                status: action === 'complete' || action === 'mark-done' ? 'done' : 'skipped',
                percent_complete: action === 'complete' || action === 'mark-done' ? 1.0 : 0.0,
                notes: action === 'complete' || action === 'mark-done' ? 'Completed via Focus Mode' : 'Skipped via Focus Mode',
            };

            const updatedProgress = [...progressUpdates, newUpdate];
            setProgressUpdates(updatedProgress);
            syncWithDB({ progressUpdates: updatedProgress });

            addToast(action === 'complete' || action === 'mark-done' ? 'Task completed!' : 'Task skipped.', 'success');
            if (action === 'skipped') handleReplan('User skipped a task, please reschedule.');
        } else if (action === 'mark-undone') {
            // Remove the most recent 'done' entry for this task
            const updatedProgress = [...progressUpdates];
            for (let i = updatedProgress.length - 1; i >= 0; i--) {
                if (updatedProgress[i].task_id === taskId && updatedProgress[i].status === 'done') {
                    updatedProgress.splice(i, 1);
                    break;
                }
            }
            setProgressUpdates(updatedProgress);
            syncWithDB({ progressUpdates: updatedProgress });
            addToast('Task unmarked as done', 'info');
        } else if (action === 'guidance') {
            let taskObj = null;
            for (const m of data.milestones || []) {
                const found = m.tasks.find(t => t.id === taskId);
                if (found) { taskObj = found; break; }
            }
            if (taskObj) {
                setSelectedTaskForGuidance(taskObj);
                setIsGuidanceModalOpen(true);
            }
        } else if (action === 'emphasize') {
            const updatedEmphasized = emphasizedTaskIds.includes(taskId)
                ? emphasizedTaskIds.filter(id => id !== taskId)
                : [...emphasizedTaskIds, taskId];
            setEmphasizedTaskIds(updatedEmphasized);
            addToast(emphasizedTaskIds.includes(taskId) ? 'Task de-emphasized' : 'Task emphasized!', 'info');
        }
    };

    const handleReplan = (instruction = '') => {
        callApi('replanning', {
            current_plan: data.scheduled_tasks ? { ...data } : [],
            progress_updates: progressUpdates,
            user_availability: { workdays: userProfile.workdays, hours_per_day: userProfile.avg_hours_per_day, blackouts: [] },
            user_instruction: instruction
        });
    };

    const handleUndo = () => {
        // Obsolete
    };

    const handleSwitchProject = (id) => {
        if (id === 'new') handleNewProject();
        else fetchProject(id);
    };

    const handleNewProject = async () => {
        if (!confirm('Start a new project? All current progress will be lost.')) return;
        const resetData = { goal: '', objective: '', deadline: '', confidence: 0, predicted_completion: '', milestones: [], scheduled_tasks: [] };
        setData(resetData);
        setProjectId(null);
        setProgressUpdates([]);
        setEmphasizedTaskIds([]);
        setGoalText('');
        setOptionalDeadline('');

        try {
            const res = await fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...resetData, progressUpdates: [], userProfile }),
            });
            const result = await res.json();
            setProjectId(result._id);
            fetchProjects();
            addToast('New project started!', 'success');
            setActiveTab('plan');
        } catch (err) {
            console.error('Failed to reset project:', err);
            addToast('Failed to reset project', 'error');
        }
    };

    const handleChatSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
        setChatInput('');
        setLoading(true);
        setAgentTrace(["Initializing context lookup...", "Analyzing project state..."]);

        try {
            const contextPrompt = `You are a context-aware AI assistant for this todo project.
CURRENT PROJECT: ${data.goal || 'No goal set'}
OBJECTIVE: ${data.objective || 'No objective set'}
MILESTONES: ${JSON.stringify(data.milestones || [])}
PROGRESS: ${JSON.stringify(progressUpdates)}

User Query: ${chatInput}

Provide a helpful, concise response. If the user asks about specific tasks or progress, use the provided context.`;

            setAgentTrace(prev => [...prev, "Consulting OpenRouter..."]);
            const res = await fetch('/api/goal-inference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal_text: contextPrompt }),
            });

            if (!res.ok) throw new Error('API request failed');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;

                setChatMessages(prev => {
                    const next = [...prev];
                    // Find the last assistant message to update
                    for (let i = next.length - 1; i >= 0; i--) {
                        if (next[i].role === 'assistant') {
                            next[i] = { ...next[i], content: accumulated };
                            break;
                        }
                    }
                    return next;
                });

                if (accumulated.length % 50 === 0) {
                    setAgentTrace(prev => {
                        const last = prev[prev.length - 1];
                        if (last === "Streaming response...") return prev;
                        return [...prev, "Streaming response..."];
                    });
                }
            }
            setAgentTrace(prev => [...prev, "Query complete."]);
            setTimeout(() => setAgentTrace([]), 3000);
        } catch (err) {
            console.error(err);
            addToast('Chat failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkday = (day) => {
        setUserProfile(prev => {
            const newDays = prev.workdays.includes(day) ? prev.workdays.filter(d => d !== day) : [...prev.workdays, day];
            return { ...prev, workdays: newDays };
        });
    };

    return {
        goalText, setGoalText, optionalDeadline, setOptionalDeadline, userProfile, setUserProfile,
        data, loading, projectId, projects, progressUpdates, toasts, activeTab, setActiveTab,
        chatInput, setChatInput, selectedTaskForGuidance, setSelectedTaskForGuidance,
        isGuidanceModalOpen, setIsGuidanceModalOpen, activeMilestoneIndex, setActiveMilestoneIndex,
        emphasizedTaskIds, agentTrace, chatMessages, chatMessagesRef,
        handleInferGoal, handleDecompose, handleSchedule, handleTaskAction, handleReplan,
        handleSwitchProject, handleNewProject, handleChatSubmit, toggleWorkday, removeToast
    };
}
