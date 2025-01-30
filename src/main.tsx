import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from 'react-router'
import "./App.css";
import Dashboard from "./app/dashboard";
import DocumentList from "./app/document-list";
import DocumentPage from "./app/document";
import { CommandHome } from "./components/command/home";



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Dashboard />} >
          <Route path="/" element={
            <CommandHome />
          } />
          <Route path="/:category" element={<DocumentList />} />
          <Route path="/:category/:document" element={<DocumentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
