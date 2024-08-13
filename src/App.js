import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import Post from './pages/Post';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/postarticle' element={<Post />}/>
          <Route path='/articles' element={<Articles />}/>
          <Route path='/articleview/:id' element={<ArticleView />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
