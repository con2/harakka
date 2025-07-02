import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { LanguageProvider } from "./context/LanguageContext.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </LanguageProvider>
  </StrictMode>,
);
