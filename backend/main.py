from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TodoItem(BaseModel):
    id: int
    text: str
    completed: bool

todos = []
active_connections = []

@app.get("/todos")
async def get_todos():
    return [todo.model_dump() for todo in todos]

@app.post("/todos")
async def add_todo(todo: TodoItem):
    todos.append(todo)
    todo_dict = todo.model_dump() 
    await broadcast({"type": "new_todo", "todo": todo_dict}) 
    return todo_dict



@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    global todos
    todos = [todo for todo in todos if todo.id != todo_id]
    await broadcast({"type": "delete_todo", "todo_id": todo_id})
    return {"status": "Todo deleted"}

@app.put("/todos/{todo_id}")
async def update_todo(todo_id: int, todo_update: TodoItem):
    for todo in todos:
        if todo.id == todo_id:
            todo.completed = todo_update.completed
            todo.text = todo_update.text
            updated_todo_dict = todo.model_dump() 
            await broadcast({"type": "todoUpdated", "updatedTodo": updated_todo_dict}) 
            return updated_todo_dict 
    return {"error": "Todo not found"}



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received data: {data}")
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast(message: dict):
    for connection in active_connections:
        try:
            if "todo" in message and isinstance(message["todo"], TodoItem):
                message["todo"] = message["todo"].model_dump()
            
            if "updatedTodo" in message and isinstance(message["updatedTodo"], TodoItem):
                message["updatedTodo"] = message["updatedTodo"].model_dump()

            await connection.send_json(message)
        except Exception as e:
            print(f"Error broadcasting message: {e}")
