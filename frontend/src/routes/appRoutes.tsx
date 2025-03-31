import { createBrowserRouter } from "react-router-dom";
import Login from "../components/Auth/Login";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />
    },
  ]
);