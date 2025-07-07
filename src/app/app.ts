import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Task } from './models/task';
import { TaskService } from './services/task.service';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'angular-todolist-app';
  tasks: Task[] = [];
  newTask: Task = { description: '', completed: false };
  editingTask: Task | null = null;

    constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(
      (data) => {
        this.tasks = data;
      },
      (error) => {
        console.error('Erro ao carregar tarefas:', error);
      }
    );
  }

  addTask(): void {
    if (this.newTask.description.trim()) {
      this.taskService.createTask(this.newTask).subscribe(
        (createdTask) => {
          this.tasks.push(createdTask);
          this.newTask = { description: '', completed: false };
        },
        (error) => {
          console.error('Erro ao adicionar tarefa:', error);
        }
      );
    }
  }

  toggleCompletion(task: Task): void {
    if (task.id) {
      this.taskService.toggleTaskCompletion(task.id).subscribe(
        (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index].completed = updatedTask.completed;
          }
        },
        (error) => {
          console.error('Erro ao alternar conclusão da tarefa:', error);
        }
      );
    }
  }

  editTask(task: Task): void {
    this.editingTask = { ...task };
  }

  updateTask(): void {
    if (this.editingTask && this.editingTask.id && this.editingTask.description.trim()) {
      this.taskService.updateTask(this.editingTask.id, this.editingTask).subscribe(
        (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.cancelEdit();
        },
        (error) => {
          console.error('Erro ao atualizar tarefa:', error);
        }
      );
    }
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  deleteTask(id: number | undefined): void {
    if (id) {
      this.taskService.deleteTask(id).subscribe(
        () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
        },
        (error) => {
          console.error('Erro ao deletar tarefa:', error);
        }
      );
    }
  }

  filterTasks(status: 'all' | 'pending' | 'completed'): void {
    if (status === 'all') {
      this.loadTasks();
    } else if (status === 'pending') {
      this.taskService.getPendingTasks().subscribe(data => this.tasks = data);
    } else if (status === 'completed') {
      this.taskService.getCompletedTasks().subscribe(data => this.tasks = data);
    }
  }
}
