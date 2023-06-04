import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTodo, setEditedTodo] = useState('');
  const [currentTodoId, setCurrentTodoId] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { text: newTodo, id: Date.now(), checked: false }]);
      setNewTodo('');
    }
  };

  const deleteTodo = id => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    updateSelectedCount(updatedTodos);
  };

  const deleteSelectedTodos = () => {
    const updatedTodos = todos.filter(todo => !todo.checked);
    setTodos(updatedTodos);
    updateSelectedCount(updatedTodos);
  };

  const deleteAllTodos = () => {
    setTodos([]);
    setSelectedCount(0);
  };

  const openEditModal = (id, text) => {
    setCurrentTodoId(id);
    setEditedTodo(text);
    setEditModalVisible(true);
  };

  const updateTodo = () => {
    if (editedTodo.trim() !== '') {
      const updatedTodos = todos.map(todo => {
        if (todo.id === currentTodoId) {
          return { ...todo, text: editedTodo };
        }
        return todo;
      });
      setTodos(updatedTodos);
      setEditModalVisible(false);
      setEditedTodo('');
      setCurrentTodoId(null);
    }
  };

  const toggleTodo = id => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, checked: !todo.checked };
      }
      return todo;
    });
    setTodos(updatedTodos);
    updateSelectedCount(updatedTodos);
  };

  const updateSelectedCount = todos => {
    const count = todos.filter(todo => todo.checked).length;
    setSelectedCount(count);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={newTodo}
          onChangeText={text => setNewTodo(text)}
          placeholder="일정 추가"
          style={styles.input}
        />
        <TouchableOpacity onPress={addTodo} style={styles.addButton}>
          <Image source={require('../assets/plus.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.selectionContainer}>
        <Text>Total: {todos.length}</Text>
        <Text>Selected: {selectedCount}</Text>
        <Text>Unselected: {todos.length - selectedCount}</Text>
      </View>
      <ScrollView style={styles.todoList}>
        {todos.map(todo => (
          <View style={styles.todoItem} key={todo.id}>
            <TouchableOpacity onPress={() => toggleTodo(todo.id)}>
              <Image
                source={todo.checked ? require('../assets/checked.png') : require('../assets/uncheck.png')}
                style={styles.checkbox}
              />
            </TouchableOpacity>
            <Text style={styles.todoText}>{todo.text}</Text>
            <TouchableOpacity onPress={() => openEditModal(todo.id, todo.text)}>
              <Image source={require('../assets/update.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
              <Image source={require('../assets/delete.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Modal visible={editModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            value={editedTodo}
            onChangeText={text => setEditedTodo(text)}
            placeholder="수정해주세요."
            style={styles.editInput}
          />
          <Button title="수정" onPress={updateTodo} />
        </View>
      </Modal>
      <TouchableOpacity onPress={deleteSelectedTodos} style={styles.deleteSelectedButton}>
        <Text style={styles.deleteSelectedText}>선택삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={deleteAllTodos} style={styles.deleteAllButton}>
        <Text style={styles.deleteAllText}>전체삭제</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  todoList: {
    flex: 1,
    marginBottom: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  editInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  deleteSelectedButton: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  deleteSelectedText: {
    color: 'white',
    fontSize: 16,
  },
  deleteAllButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  deleteAllText: {
    color: 'white',
    fontSize: 16,
  },
});

export default TodoList