import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import Home from './pages/Home';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';

function App() {
  return (
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <CustomCursor />
        <Navbar />
        <main>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/blog"       element={<Blog />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
