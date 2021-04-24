import React from "react";
import logo from "./logo.svg";
import "./App.css";
import ReactPlayer from "react-player";
import { HashRouter, Link, Switch, Route } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { Auth, API } from "aws-amplify";
import { createComment as CreateComment } from "./graphql/mutations";
import { listComments as ListComments } from "./graphql/queries";
import { onCreateComment as OnCreateComment } from "./graphql/subscriptions";

const streamUrl =
  "https://6e7195379fb1.us-east-1.playback.live-video.net/api/video/v1/us-east-1.501296098176.channel.0DVDxjIjpBkm.m3u8";

function Router() {
  return (
    <HashRouter>
      <nav>
        <Link to="/">Stream</Link>
        <Link to="/auth">Profile</Link>
      </nav>
      <Switch>
        <Route exact path="/">
          <App />
        </Route>
        <Route exact path="/auth">
          <AuthComponent />
        </Route>
      </Switch>
    </HashRouter>
  );
}

const initialState = {
  comments: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_COMMENTS":
      return {
        ...state,
        comments: action.comments,
      };
    case "ADD_COMMENT":
      return {
        ...state,
        comments: [...state.comments, action.comment],
      };
    default:
      return state;
  }
}

function App() {
  const [user, setUser] = React.useState(null);
  const [inputValue, setInput] = React.useState("");
  const [state, dispatch] = React.useReducer(reducer, initialState);
  React.useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((err) => console.log({ err }));
    fetchComments();
    subscribe();
  }, []);
  function subscribe() {
    API.graphql({
      query: OnCreateComment,
    }).subscribe({
      next: async (commentData) => {
        console.log({ commentData });
        const {
          value: { data },
        } = commentData;
        try {
          const user = await Auth.currentAuthenticatedUser();
          console.log({ user });
          if (user.username === data.onCreateComment.owner) {
            return;
          }
          dispatch({ type: "ADD_COMMENT", comment: data.onCreateComment });
        } catch (err) {
          console.log("err: ", err);
          dispatch({ type: "ADD_COMMENT", comment: data.onCreateComment });
        }
      },
    });
  }
  async function fetchComments() {
    const commentData = await API.graphql({
      query: ListComments,
    });
    dispatch({
      type: "SET_COMMENTS",
      comments: commentData.data.listComments.items,
    });
  }
  async function createComment() {
    if (!inputValue) return;
    const message = inputValue;
    setInput("");
    dispatch({
      type: "ADD_COMMENT",
      comment: { message, owner: user.username },
    });
    await API.graphql({
      query: CreateComment,
      variables: {
        input: { message },
      },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
  }
  function onChange(e) {
    e.persist();
    setInput(e.target.value);
  }
  return (
    <div className="App">
      <div style={{ display: "flex" }}>
        <div style={{ width: 900, border: "1px solid black" }}>
          <ReactPlayer url={streamUrl} width="100%" height="100%" playing />
        </div>
        <div style={{ width: 300, border: "1px solid black" }}>
          {user && (
            <div>
              <input
                value={inputValue}
                onChange={onChange}
                placeholder="comment"
              />
              <button onClick={createComment}>Create Comment</button>
            </div>
          )}
          {state.comments.map((comment, index) => (
            <div key={index}>
              <p>{comment.message}</p>
              <span>From: {comment.owner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Router;
