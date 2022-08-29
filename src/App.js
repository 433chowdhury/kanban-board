import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./components/Button";
import Input from "./components/Input";
import Modal from "./components/Modal";
import Review from "./components/Review";
import SignInOrUp from "./SignInOrUp";

function App() {
  const dragFrom = useRef(null);
  const dragTo = useRef(null);
  const dragIndexRef = useRef(null);
  const timeout = useRef(null);

  // const [processing, setProcessing] = useState(false);

  const [notification, setNotification] = useState("");

  const [selectedCard, setSelectedCard] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [newReview, setNewReview] = useState("");

  const [user, setUser] = useState(() => {
    const persistedUser = localStorage.getItem("user");
    if (persistedUser) return JSON.parse(persistedUser);
    else return null;
  });

  const [loginPhase, setLoginPhase] = useState("Sign In");

  const [taskName, setTaskName] = useState("");

  const [state, setState] = useState({
    todo: [
      {
        card_id: 1,
        card_name: "Task 1",
        board_name: "To Do",
        card_order: 0,
      },
      {
        card_id: 2,
        card_name: "Task 2",
        board_name: "To Do",
        card_order: 1,
      },
      {
        card_id: 3,
        card_name: "Task 3",
        board_name: "To Do",
        card_order: 2,
      },
      {
        card_id: 4,
        card_name: "Task 4",
        board_name: "To Do",
        card_order: 3,
      },
      {
        card_id: 5,
        card_name: "Task 5",
        board_name: "To Do",
        card_order: 4,
      },
    ],
    inProgress: [],
    done: [],
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    setLoginPhase("Sign In");
    setState({ todo: [], inProgress: [], done: [] });
  };

  const handleNotification = (value, infinite) => {
    setNotification(value);
    if (timeout.current) clearTimeout(timeout.current);
    if (!infinite) {
      timeout.current = setTimeout(() => {
        setNotification("");
      }, 3000);
    }
  };

  const fetchCards = useCallback(async (userId) => {
    const response = await fetch(`http://localhost:3001/card/${userId}`);
    const result = await response.json();
    // console.log(result);
    const newTodo = [],
      newInProgress = [],
      newDone = [];
    if (result) {
      for (const card of result) {
        switch (card.board_name) {
          case "To Do": {
            newTodo.push(card);
            break;
          }
          case "In Progress": {
            newInProgress.push(card);
            break;
          }
          case "Done": {
            newDone.push(card);
            break;
          }
          default:
            return;
        }
      }
    }
    newTodo.sort((a, b) => a.card_order - b.card_order);
    newInProgress.sort((a, b) => a.card_order - b.card_order);
    newDone.sort((a, b) => a.card_order - b.card_order);
    setState({ todo: newTodo, inProgress: newInProgress, done: newDone });
  }, []);

  useEffect(() => {
    if (user) fetchCards(user.user_id);
  }, [fetchCards, user]);

  const fetchReviews = useCallback(async (card_id) => {
    setReviewData([]);
    const response = await fetch(`http://localhost:3001/review/${card_id}`);
    const result = await response.json();
    // console.log(result);
    setReviewData(result);
  }, []);

  const handleAddReview = async () => {
    setReviewData([]);
    const response = await fetch(`http://localhost:3001/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        review: newReview,
        card_id: selectedCard,
        user_id: user.user_id,
      }),
    });
    const result = await response.text();
    // console.log(result);
    setNewReview("");
    handleNotification(result);
    fetchReviews(selectedCard);
  };

  useEffect(() => {
    if (selectedCard) fetchReviews(selectedCard);
  }, [fetchReviews, selectedCard]);

  const handleCardClick = (card_id) => () => {
    setSelectedCard(card_id);
    setShowReviewModal(true);
  };

  const handleClose = () => {
    setShowReviewModal(false);
    setNewReview("");
  };

  const reviewExist = () =>
    reviewData.find((review) => review.user_id === user.user_id);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) {
      handleNotification("Please Sign In!");
      return;
    }
    if (!taskName) return;
    try {
      handleNotification("Please wait...", true);
      // setProcessing(true);
      await fetch("http://localhost:3001/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_name: taskName,
          board_name: "To Do",
          user_id: user.user_id,
          card_order: state.todo.length,
        }),
      });
      handleNotification("Saved!");
      fetchCards(user.user_id);
      // setProcessing(false);
      setTaskName("");
    } catch (e) {
      // setProcessing(false);
      handleNotification("Failed");
    }
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
        item.board_name = dragTo.current;
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
      handleSave(newState);
    }
  };

  const handleSave = async (newState) => {
    if (!user) {
      handleNotification("Please Login!");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/update-all-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ...newState.todo.map((card, index) => ({
            ...card,
            card_order: index,
          })),
          ...newState.inProgress.map((card, index) => ({
            ...card,
            card_order: index,
          })),
          ...newState.done.map((card, index) => ({
            ...card,
            card_order: index,
          })),
        ]),
      });
      if (response.status === 200) handleNotification(await response.text());
    } catch (err) {
      if (err) handleNotification("Unsuccessful!");
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
                  onClick={handleCardClick(item.card_id)}
                  draggable
                  onDragStart={onDragStart(list.label, item, index)}
                  onDragOver={onDragOverItem(index)}
                  onDragEnd={onDrop}
                  className="px-5 py-1 border border-black mt-5 first:mt-0 text-xl text-neutral-700 overflow-hidden bg-neutral-300"
                >
                  {item.card_name}
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
        handleLogout={handleLogout}
      />
      {notification && (
        <p className="fixed bottom-10 right-5 mt-10 px-4 py-3 text-lg bg-neutral-700 text-white">
          {notification}
        </p>
      )}
      {/* <Button
        disabled={processing}
        type="button"
        className="px-7 py-1 border border-black text-accent text-base font-medium active:opacity-75"
        onClick={handleSave}
      >
        Save
      </Button> */}
      {showReviewModal && (
        <Modal onClose={handleClose}>
          <div className="flex flex-col gap-10 w-[700px] overflow-auto max-h-screen">
            <div className="border border-neutral-700 p-5 min-h-[400px] mt-10">
              <ul className="">
                {reviewData.map((review, index) => (
                  <Review key={index} data={review} />
                ))}
              </ul>
              {!reviewData.length && <p className="text-center">No Review</p>}
            </div>
            {!reviewExist() && (
              <div className="flex flex-col items-center mb-10">
                <textarea
                  disabled={reviewExist()}
                  className="border border-neutral-700 mb-5 w-full h-40 p-5"
                  row={10}
                  placeholder="Your review..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                />
                <Button
                  disabled={reviewExist()}
                  className="w-fit"
                  onClick={handleAddReview}
                >
                  Add Review
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
}

export default App;
