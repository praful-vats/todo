import axios from "axios";

const BASE_URL = "https://tooodooo.duckdns.org";

const TodoService = {
  getTodos: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/todos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  addTodo: async (todo: { id: number; text: string; completed: boolean }) => {
    try {
      const response = await axios.post(`${BASE_URL}/todos`, todo);
      return response.data;
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  },

  deleteTodo: async (todoId: number) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${todoId}`);
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  },

  updateTodo: async (
    todoId: number,
    updatedTodo: { id: number; text: string; completed: boolean }
  ) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/todos/${todoId}`,
        updatedTodo
      );
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  },
};

export default TodoService;