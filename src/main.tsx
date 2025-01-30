import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from 'react-router'
import "./App.css";
import Dashboard from "./app/dashboard";
import DocumentList from "./app/document-list";
import DocumentPage from "./app/document";



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Dashboard />} >
          <Route path="/" element={
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                  <div className="aspect-video rounded-xl bg-muted/50" />
                  <div className="aspect-video rounded-xl bg-muted/50" />
                  <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
              </div>
          } />
          <Route path="/:category" element={<DocumentList/>} />
          <Route path="/:category/:document" element={<DocumentPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
