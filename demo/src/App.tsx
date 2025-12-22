import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Demo from "./pages/Demo";
import Documentation from "./pages/Documentation";

import LayoutNavbar from "./components/LayoutNavbar";
import { routeHome, routeDemo, routeDocumentation } from "./utils/Routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routeHome} element={<LayoutNavbar />}>
          <Route index element={<Home />} />
          <Route path={routeDemo} element={<Demo />} />
          <Route path={routeDocumentation} element={<Documentation />} />
        </Route>
      </Routes>
    </BrowserRouter >
  )
}

export default App