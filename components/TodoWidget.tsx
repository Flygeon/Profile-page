'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { config } from '@/data/config'
import { getLocalStorage, setLocalStorage } from '@/lib/storage'
import { TodoItem } from '@/data/config'

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = getLocalStorage<TodoItem[]>('todos')
    return saved || config.todos
  })

  const toggleTodo = (id: number) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
    setTodos(updated)
    setLocalStorage('todos', updated)
  }

  const completedCount = todos.filter((t) => t.done).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      className="h-full"
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-list-check text-neon-green"></i>
              <span className="text-xs text-gray-400">待办</span>
            </div>
            <span className="text-xs text-gray-500">{completedCount}/{todos.length}</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {todos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-all ${
                    todo.done ? 'bg-dark-600/50' : 'hover:bg-dark-600/30'
                  }`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.done
                        ? 'border-neon-green bg-neon-green/20'
                        : 'border-dark-400'
                    }`}
                  >
                    {todo.done && (
                      <i className="fa-solid fa-check text-xs text-neon-green"></i>
                    )}
                  </div>
                  <span
                    className={`text-xs flex-1 transition-all ${
                      todo.done ? 'text-gray-500 line-through' : 'text-gray-300'
                    }`}
                  >
                    {todo.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
