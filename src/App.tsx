import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsGrid } from './components/ProjectsGrid';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { ProteinFoldingPage } from './components/ProteinFoldingPage';
import { ProteinPlaygroundPage } from './components/ProteinPlaygroundPage';
import { ScrollToTop } from './components/ScrollToTop';
import { BackToTop } from './components/BackToTop';

function HomePage() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <ProjectsGrid />
        <About />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BackToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/protein-folding" element={<ProteinFoldingPage />} />
        <Route path="/protein-playground" element={<ProteinPlaygroundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

