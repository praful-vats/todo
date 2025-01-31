import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";
import TodoService from "./services/todoApi"; 
import axios, { AxiosError } from "axios";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket("wss://tooodooo.duckdns.org/ws"); 
    setWs(websocket);

    websocket.onopen = () => {
      console.log("WebSocket Connected");
      fetchTodos();
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message from server:", message);

      switch (message.type) {
        case "new_todo":
          setTodos((prevTodos) => [...prevTodos, message.todo]);
          break;
        case "delete_todo":
          setTodos((prevTodos) =>
            prevTodos.filter((todo) => todo.id !== message.todo_id)
          );
          break;
        case "todoUpdated":
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === message.updatedTodo.id ? message.updatedTodo : todo
            )
          );
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await TodoService.getTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const addedTodo = await TodoService.addTodo({
          id: Date.now(),
          text: newTodo,
          completed: false,
        });
        setNewTodo("");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error adding todo:", error.response?.data || error.message);
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    }
  };

  const deleteTodo = async (todoId: number) => {
    try {
      await TodoService.deleteTodo(todoId);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const onToggleComplete = async (todoId: number) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === todoId);
      if (!todoToUpdate) return;

      const updatedCompletedStatus = !todoToUpdate.completed;
      const updatedTodo = await TodoService.updateTodo(todoId, {
        ...todoToUpdate,
        completed: updatedCompletedStatus,
      });
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter a new todo"
        value={newTodo}
        onChangeText={setNewTodo}
        style={styles.input}
      />
      <Button title="Add Todo" onPress={addTodo} />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text>{item.text}</Text>
            <Button
              title={item.completed ? "Completed" : "Mark as Completed"}
              onPress={() => onToggleComplete(item.id)}
            />
            <Button title="Delete" onPress={() => deleteTodo(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});