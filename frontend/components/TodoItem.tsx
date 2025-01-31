import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

type TodoItemProps = {
  todo: {
    id: number;
    text: string;
    completed: boolean;
  };
  onToggleComplete: (todoId: number) => void;
  onDelete: (todoId: number) => void;
};

export function TodoItem({ todo, onToggleComplete, onDelete }: TodoItemProps) {
  return (
    <View style={styles.todoContainer}>
      <Text style={todo.completed ? styles.completed : styles.incomplete}>
        {todo.text}
      </Text>
      <Button title={todo.completed ? "Completed" : "Mark as Completed"} onPress={() => onToggleComplete(todo.id)} />
      <Button title="Delete" color="red" onPress={() => onDelete(todo.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  completed: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  incomplete: {
    color: "black",
  },
});
