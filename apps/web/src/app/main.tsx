import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">PlacementOS Client Bootstrapped</h1>
          <p className="mt-2 text-gray-600">The engineering foundation is ready.</p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
