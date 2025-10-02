import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const hobbies = [
    { name: 'game', icon: '🎮', color: '#7D5BFF' },
    { name: 'book', icon: '📚', color: '#00E0C7' },
    { name: 'movie', icon: '🎬', color: '#FF6633' },
    { name: 'food', icon: '🍕', color: '#FF4757' },
    { name: 'pet', icon: '🐕', color: '#FFA502' },
    { name: 'plant', icon: '🌱', color: '#2ED573' },
    { name: 'money', icon: '💰', color: '#FFD700' },
    { name: 'music', icon: '🎵', color: '#A55EEA' },
    { name: 'family', icon: '👨‍👩‍👧‍👦', color: '#FF6B9D' },
    { name: 'health', icon: '💪', color: '#26D0CE' },
    { name: 'work', icon: '💼', color: '#778CA3' },
    { name: 'home', icon: '🏠', color: '#4834D4' },
  ];

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">취미 볼 게임</h1>
        <p className="home-subtitle">원하는 카테고리를 선택해보세요!</p>
      </div>

      <div className="hobby-grid">
        {hobbies.map((hobby) => (
          <Link
            key={hobby.name}
            to={`/hobby?subject=${hobby.name}`}
            className="hobby-card"
            style={{ '--card-color': hobby.color }}
          >
            <div className="hobby-icon">{hobby.icon}</div>
            <div className="hobby-name">{hobby.name.toUpperCase()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
