import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./components/Button";
import Input from "./components/Input";
import SignInOrUp from "./SignInOrUp";

function App() {
  const dragFrom = useRef(null);
  const dragTo = useRef(null);
  const dragIndexRef = useRef(null);
  const timeout = useRef(null);

  const [notification, setNotification] = useState("");

  const handleNotification = (value) => {
    setNotification(value);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const [user, setUser] = useState(null);

  const [loginPhase, setLoginPhase] = useState("Sign In");

  const [taskName, setTaskName] = useState("");

  const [state, setState] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const fetchCards = useCallback(async (userId) => {
    const response = await fetch("http://localhost:3001/card/3");
    const result = await response.json();
    // console.log(result);
    const newTodo = [],
      newInProgress = [],
      newDone = [];
    if (result) {
      for (const card of result) {
        switch (card.board_name) {
          case "To Do": {
            newTodo.push({ label: card.card_name, order: card.card_order });
            break;
          }
          case "In Progress": {
            newInProgress.push({
              label: card.card_name,
              order: card.card_order,
            });
            break;
          }
          case "Done": {
            newDone.push({ label: card.card_name, order: card.card_order });
            break;
          }
          default:
            return;
        }
      }
    }
    newTodo.sort((a, b) => a.order - b.order);
    setState({ todo: newTodo, inProgress: newInProgress, done: newDone });
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!taskName) return;
    setTaskName("");
    setState({ ...state, todo: [...state.todo, { label: taskName }] });
  };

  const onDragStart = (label, item, index) => (e) => {
    dragFrom.current = { label, item, index };
  };

  const onDragOver = (label) => (e) => {
    dragTo.current = label;
    if (dragFrom.current.label !== label) {
      dragIndexRef.current = null;
    }
  };

  const onDragOverItem = (index) => (e) => {
    e.stopPropagation();
    dragIndexRef.current = index;
  };

  const onDrop = (e) => {
    // utility functions
    const removeItem = (newState, label, index) => {
      switch (label) {
        case "To Do":
          newState.todo.splice(index, 1);
          break;
        case "In Progress":
          newState.inProgress.splice(index, 1);
          break;
        case "Done":
          newState.done.splice(index, 1);
          break;
        default:
          return;
      }
    };
    const sameBoardOperation = (newState, label, item) => {
      switch (label) {
        case "To Do": {
          const newData = [...state.todo];
          newData.splice(dragFrom.current.index, 1);
          newData.splice(dragIndexRef.current, 0, item);
          newState.todo = newData;
          break;
        }
        case "In Progress": {
          const newData = [...state.inProgress];
          newData.splice(dragFrom.current.index, 1);
          newData.splice(dragIndexRef.current, 0, item);
          newState.inProgress = newData;
          break;
        }
        case "Done": {
          const newData = [...state.done];
          newData.splice(dragFrom.current.index, 1);
          newData.splice(dragIndexRef.current, 0, item);
          newState.done = newData;
          break;
        }
        default:
          return;
      }
    };
    // main operation
    if (dragFrom.current && dragTo.current) {
      const { label, item, index } = dragFrom.current;
      const newState = JSON.parse(JSON.stringify(state));
      if (dragFrom.current.label === dragTo.current) {
        sameBoardOperation(newState, label, item);
        setState(newState);
      } else {
        switch (dragTo.current) {
          case "To Do": {
            if (dragIndexRef.current !== null) {
              const newData = [...state.todo];
              newData.splice(dragIndexRef.current, 0, item);
              newState.todo = newData;
            } else {
              newState.todo = [...state.todo, item];
            }
            removeItem(newState, label, index);
            setState(newState);
            break;
          }
          case "In Progress": {
            if (dragIndexRef.current !== null) {
              const newData = [...state.inProgress];
              newData.splice(dragIndexRef.current, 0, item);
              newState.inProgress = newData;
            } else {
              newState.inProgress = [...state.inProgress, item];
            }
            removeItem(newState, label, index);
            setState(newState);
            break;
          }
          case "Done": {
            if (dragIndexRef.current !== null) {
              const newData = [...state.done];
              newData.splice(dragIndexRef.current, 0, item);
              newState.done = newData;
            } else {
              newState.done = [...state.done, item];
            }
            removeItem(newState, label, index);
            setState(newState);
            break;
          }
          default:
            return;
        }
      }
    }
  };

  const handleSave = () => {
    if (!user) {
      handleNotification("Please Login!");
      return;
    }
  };

  return (
    <main className="relative flex flex-col gap-8 justify-start items-center p-20">
      <form className="flex gap-5" onSubmit={handleAdd}>
        <Input
          placeholder="Write your task..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>
      <div className="flex gap-6 justify-center flex-wrap">
        {[
          { data: state.todo, label: "To Do" },
          { data: state.inProgress, label: "In Progress" },
          { data: state.done, label: "Done" },
        ].map((list, index) => (
          <div
            key={index}
            onDragOver={onDragOver(list.label)}
            className="border border-black w-[200px] min-h-[550px] text-center"
          >
            <h2 className="px-10 py-1 font-medium text-xl text-neutral-700 border-b border-black bg-accent">
              {list.label}
            </h2>
            <ul className="p-4">
              {list.data.map((item, index) => (
                <li
                  key={index}
                  draggable
                  onDragStart={onDragStart(list.label, item, index)}
                  onDragOver={onDragOverItem(index)}
                  onDragEnd={onDrop}
                  className="px-5 py-1 border border-black mt-5 first:mt-0 text-xl text-neutral-700 overflow-hidden bg-neutral-300"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <SignInOrUp
        user={user}
        loginPhase={loginPhase}
        setLoginPhase={setLoginPhase}
        setUser={setUser}
        handleNotification={handleNotification}
      />
      {notification && (
        <p className="fixed bottom-10 right-5 mt-10 px-4 py-3 text-lg bg-neutral-700 text-white">
          {notification}
        </p>
      )}
      <Button
        type="button"
        className="px-7 py-1 border border-black text-accent text-base font-medium active:opacity-75"
        onClick={handleSave}
      >
        Save
      </Button>
    </main>
  );
}

export default App;
