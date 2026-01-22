 import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import History from "./pages/History";
import VideoMeet from "./pages/VideoMeet";
import NotFound from "./pages/NotFound";

import AuthProvider from "./contexts/AuthProvider";
import WithAuth from "./utils/withAuth";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Authentication />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <WithAuth>
                <Home />
              </WithAuth>
            }
          />

          <Route
            path="/history"
            element={
              <WithAuth>
                <History />
              </WithAuth>
            }
          />

          {/* Meeting Route */}
          <Route
            path="/meeting/:roomId"
            element={
              <WithAuth>
                <VideoMeet />
              </WithAuth>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
