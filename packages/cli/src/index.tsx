import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Rootlayout } from "./layouts/root-layout";
import { Home } from "./screens/home";
import { NewSession } from "./screens/new-session";
import { Sessions } from "./screens/session";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Rootlayout />,
    children: [
      { index: true, element: <Home />  },
      { path: "sessions/new" , element: <NewSession/>},
      { path: "sessions/:id" , element: <Sessions/>},

    ]
  }
])


function App() {
  return <RouterProvider router={router}/>
}

const renderer = await createCliRenderer({
  targetFps: 60,
  exitOnCtrlC: false,
});
createRoot(renderer).render(<App />);
