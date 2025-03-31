import { createBrowserRouter } from "react-router-dom";
import Login from "../components/Login/Login";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />
    },
  ]
);