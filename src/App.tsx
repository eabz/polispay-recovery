import React from 'react';
import './App.css';
import MainNavBar from "./components/MainNavBar";
import {Container} from "reactstrap";

const App: React.FC = () => {
  return (
      <div>
          <MainNavBar/>
          <div className="app-bg">
              <Container>

              </Container>
          </div>
      </div>
  );
};

export default App;
