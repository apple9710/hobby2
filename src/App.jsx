import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const bodiesRef = useRef([]); // HTML 요소와 Matter.js body 매핑

  // Matter.js 초기화
  useEffect(() => {
    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = window.innerWidth > 480 ? 480 : window.innerWidth;
    const height = 500;

    // 바닥, 벽 (보이지 않는 물리 경계)
    const ground = Bodies.rectangle(width / 2, height - 20, width, 40, {
      isStatic: true,
    });
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, {
      isStatic: true,
    });
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
      isStatic: true,
    });
    World.add(engine.world, [ground, leftWall, rightWall]);

    Engine.run(engine);

    engineRef.current.width = width;
    engineRef.current.height = height;

    return () => {
      Engine.clear(engine);
      bodiesRef.current = [];
    };
  }, []);

  // 새로운 박스만 추가하는 함수
  const addNewBox = (hobbyText) => {
    if (!engineRef.current) return;

    const World = Matter.World,
      Bodies = Matter.Bodies;

    // 8개 제한 - 가장 오래된 공 제거
    if (bodiesRef.current.length >= 8) {
      const oldest = bodiesRef.current.shift();
      Matter.World.remove(engineRef.current.world, oldest.body);
      oldest.element.remove();
    }

    // 텍스트 길이에 따른 크기 계산
    const textLength = hobbyText.length;
    const minWidth = 80;
    const charWidth = 12; // 글자 하나당 대략적인 픽셀 너비
    const elementWidth = Math.max(minWidth, textLength * charWidth + 40); // 패딩 포함
    const radius = elementWidth / 2; // 반지름은 너비의 절반

    // 새로운 공 생성 (동적 크기)
    const randomX =
      Math.random() * (engineRef.current.width - elementWidth) + radius;
    const body = Bodies.rectangle(randomX, 60, elementWidth, 80, {
      label: 'hobby',
      restitution: 0.8,
      chamfer: {
        radius: 40, // 모서리 반지름 설정
      },
    });

    // HTML 요소 생성
    const element = document.createElement('div');
    element.className = 'hobby-ball';
    element.textContent = hobbyText;
    element.style.cssText = `
    position: absolute;
    width: ${elementWidth}px;
    height: 80px;
    border-radius: 40px;
    background: #6c47ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(108, 71, 255, 0.3);
    border: 2px solid #fff;
    text-align: center;
    user-select: none;
    pointer-events: none;
    transform-origin: center;
  `;

    sceneRef.current.appendChild(element);

    // body와 element 매핑 저장 (크기 정보도 포함)
    bodiesRef.current.push({ body, element, hobbyText, width: elementWidth });
    World.add(engineRef.current.world, body);
  };

  // 물리 엔진 업데이트 및 HTML 요소 위치 동기화
  useEffect(() => {
    if (!engineRef.current) return;

    const engine = engineRef.current;

    function updatePositions() {
      // Matter.js 엔진 업데이트
      Matter.Engine.update(engine, 1000 / 60);

      // HTML 요소 위치 업데이트
      bodiesRef.current.forEach(({ body, element, width }) => {
        const x = body.position.x - width / 2; // 중심점 조정 (동적 너비 반영)
        const elementHeight = 80;
        const y = body.position.y - elementHeight / 2; // 높이는 고정
        const rotation = body.angle;

        element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}rad)`;
      });
    }

    const runner = setInterval(updatePositions, 1000 / 60);
    return () => clearInterval(runner);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addNewBox(input.trim());
    setInput('');
  };

  return (
    <div className="hobby-page">
      <h2 className="hobby-title">GAME</h2>
      <form className="hobby-form" onSubmit={handleAdd}>
        <input
          className="hobby-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="취미를 입력하세요"
        />
        <button className="hobby-btn" type="submit">
          추가
        </button>
      </form>
      <div
        ref={sceneRef}
        className="hobby-canvas"
        style={{
          width: '100%',
          height: 500,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      />
    </div>
  );
}

export default App;
