<script>
  import todosData from '../data/todos.json'
  
  const todos = todosData
  let mounted = $state(false)
  
  setTimeout(() => {
    mounted = true
  }, 100)
  
  const completedCount = $derived(todos.filter(t => t.done).length)
</script>

<div class="todo-widget" class:mounted>
  <div class="todo-header">
    <i class="fa-solid fa-list-check"></i>
    <span>待办事项</span>
    <span class="todo-count">{completedCount}/{todos.length}</span>
  </div>
  
  <div class="todo-list">
    {#each todos as todo}
      <div class="todo-item" class:done={todo.done}>
        <i class="fa-solid {todo.done ? 'fa-check-circle' : 'fa-circle'}"></i>
        <span>{todo.text}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .todo-widget {
    width: 260px;
    padding: 18px;
    background-color: rgba(26, 26, 26, 0.45);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    opacity: 0;
    transform: translateX(16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    margin-top: 24px;
  }
  
  .todo-widget.mounted {
    opacity: 1;
    transform: translateX(0);
  }
  
  .todo-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  
  .todo-header i {
    font-size: 12px;
    color: #ffffff;
  }
  
  .todo-header span:first-of-type {
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    flex: 1;
  }
  
  .todo-count {
    font-size: 10px;
    color: #666;
  }
  
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #ccc;
    padding: 6px 0;
    transition: opacity 0.2s;
  }
  
  .todo-item i {
    font-size: 12px;
    color: #666;
    flex-shrink: 0;
  }
  
  .todo-item.done {
    opacity: 0.5;
  }
  
  .todo-item.done span {
    text-decoration: line-through;
    color: #666;
  }
  
  .todo-item.done i {
    color: #ffffff;
  }
  
  @media (max-width: 1200px) {
    .todo-widget {
      display: none;
    }
  }
</style>
