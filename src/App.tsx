import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LevelOnePage } from './pages/LevelOnePage'
import { LevelTwoPage } from './pages/LevelTwoPage'
import { LevelThreePage } from './pages/LevelThreePage'
import  LevelCompletePage from "./pages/LevelCompletePage";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level-1" element={<LevelOnePage />} />
        <Route path="/level-2" element={<LevelTwoPage />} />
        <Route path="/level-3" element={<LevelThreePage />} />
        <Route path="/complete" element={<LevelCompletePage />} />
      </Routes>
    </Router>
  )
}

export default App

