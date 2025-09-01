
import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import './App.css';

function App() {
  const [hobbies, setHobbies] = useState([]);
  const [input, setInput] = useState('');
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [boxes, setBoxes] = useState([]);

  // Matter.js 초기화
  useEffect(() => {
    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = window.innerWidth > 480 ? 480 : window.innerWidth;
    const height = 500;

    // 바닥, 벽
    const ground = Bodies.rectangle(width / 2, height, width, 40, { isStatic: true });
    const leftWall = Bodies.rectangle(0, height / 2, 40, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width, height / 2, 40, height, { isStatic: true });
    World.add(engine.world, [ground, leftWall, rightWall]);

    Engine.run(engine);

    // 커스텀 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    sceneRef.current.innerHTML = '';
    sceneRef.current.appendChild(canvas);

    engineRef.current.canvas = canvas;
    engineRef.current.width = width;
    engineRef.current.height = height;

    return () => {
      Engine.clear(engine);
      if (canvas) canvas.remove();
    };
  }, []);


  // 박스 추가 및 물리 엔진에 연결
  useEffect(() => {
    if (!engineRef.current) return;
    const World = Matter.World,
      Bodies = Matter.Bodies;

    // 기존 박스 제거
    engineRef.current.world.bodies
      .filter(b => b.label === 'hobby')
      .forEach(b => Matter.World.remove(engineRef.current.world, b));

    // 박스 생성 (입력된 취미 텍스트와 연결)
    boxes.forEach((box, i) => {
      const body = Bodies.circle(60 + i * 50 + 60, 60, 40, {
        label: 'hobby',
        restitution: 0.8,
      });
      body.hobbyText = box;
      World.add(engineRef.current.world, body);
    });
  }, [boxes]);


  // 커스텀 캔버스에 박스와 텍스트 직접 그리기
  useEffect(() => {
    if (!engineRef.current || !engineRef.current.canvas) return;
    const engine = engineRef.current;
    const canvas = engine.canvas;
    const ctx = canvas.getContext('2d');

    function draw() {
      // Matter.js 엔진 업데이트 (물리 시뮬레이션)
      Matter.Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 박스 그리기
      const bodies = engine.world.bodies.filter(b => b.label === 'hobby');
      bodies.forEach((body) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#6c47ff';
        ctx.shadowColor = '#6c47ff44';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(body.hobbyText, body.position.x, body.position.y);
        ctx.restore();
      });
    }

    // Matter.js 엔진 tick마다 draw 호출
    const runner = setInterval(() => {
      draw();
    }, 1000 / 60);
    return () => clearInterval(runner);
  }, [boxes]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    let newBoxes = [...boxes, input.trim()];
    if (newBoxes.length > 8) newBoxes = newBoxes.slice(1);
    setBoxes(newBoxes);
    setInput('');
  };

  return (
    <div className="hobby-page">
      <h2 className="hobby-title">게임</h2>
      <form className="hobby-form" onSubmit={handleAdd}>
        <input
          className="hobby-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="취미를 입력하세요"
        />
        <button className="hobby-btn" type="submit">추가</button>
      </form>
      <div ref={sceneRef} className="hobby-canvas" style={{ width: '100%', height: 500, margin: '0 auto' }} />
    </div>
  );
}

export default App;
