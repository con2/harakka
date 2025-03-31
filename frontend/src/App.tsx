//import { Button } from "./components/ui/button"
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/appRoutes";

function App() {

  return (
    <>
      <RouterProvider
      router={router}
    />
    </>
  )
}

export default App
