import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsGrid } from './components/ProjectsGrid';
import { About } from './components/About';
import { Footer } from './components/Footer';

function App() {
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

export default App;
