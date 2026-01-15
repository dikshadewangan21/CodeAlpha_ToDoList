class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('taskForm').addEventListener('submit', (e) => this.addTask(e));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
    }

    addTask(e) {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (text && this.editingId === null) {
            const task = {
                id: Date.now(),
                text: text,
                completed: false,
                created: new Date().toISOString()
            };
            this.tasks.unshift(task);
        } else if (this.editingId !== null) {
            this.tasks = this.tasks.map(task => 
                task.id === this.editingId ? { ...task, text } : task
            );
            this.editingId = null;
        }
        
        input.value = '';
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks();
        this.render();
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            document.getElementById('taskInput').value = task.text;
            this.editingId = id;
            document.getElementById('taskInput').focus();
        }
    }

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        if (confirm('Clear all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending': return this.tasks.filter(task => !task.completed);
            case 'completed': return this.tasks.filter(task => task.completed);
            default: return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();
        this.updateStats();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks ${this.currentFilter === 'all' ? '' : `in "${this.currentFilter}"`} category</p>
                    <small>Add a task to get started!</small>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.editTask(${task.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="app.deleteTask(${task.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }
}

// Initialize app when DOM loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});
