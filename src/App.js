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
  "https://5ab61782dc20.us-east-1.playback.live-video.net/api/video/v1/us-east-1.557458351015.channel.l6pYjS72ScW9.m3u8";

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

function App() {
  const [user, setUser] = React.useState(null);
  const [inputValue, setInput] = React.useState("");

  React.useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((err) => console.log({ err }));
  }, []);

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
