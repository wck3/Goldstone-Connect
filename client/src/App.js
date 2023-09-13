import logo from './logo.svg';
import './App.css';
import Navbar from './Components/nav';
import {Route, Routes} from 'react-router-dom';
import Tools from './Pages/Tools';
import Home from './Pages/Home';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/Tools"  element={<Tools/>} />
      </Routes>
    </div>
  );
}

export default App;
