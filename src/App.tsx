import React from 'react';
import './App.css';
import MainNavBar from "./components/MainNavBar";
import MainContent from "./components/MainContent";

const App: React.FC = () => {
  return (
      <div>
          <MainNavBar/>
          <div className="app-bg">
              <br/>
              <MainContent/>
          </div>
      </div>
  );
};

export default App;
