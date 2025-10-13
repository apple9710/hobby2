import { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Matter from 'matter-js';
import './HobbyPage.css';

function HobbyPage() {
  const [input, setInput] = useState('');
  const [searchParams] = useSearchParams();
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const bodiesRef = useRef([]); // HTML 요소와 Matter.js body 매핑

  // URL 파라미터에서 subject 값 가져오기
  const getSubjectFromParams = useCallback(() => {
    const subject = searchParams.get('subject');
    return subject ? subject.toUpperCase() : 'GAME';
  }, [searchParams]);

  const [currentSubject, setCurrentSubject] = useState(getSubjectFromParams());

  // URL 파라미터 변경 감지
  useEffect(() => {
    setCurrentSubject(getSubjectFromParams());
  }, [getSubjectFromParams]);

  // 카테고리별 그라디언트 색상 설정
  const getGradientColor = useCallback(() => {
    const subject = searchParams.get('subject')?.toLowerCase() || 'game';

    if (['game', 'book', 'movie', 'food'].includes(subject)) {
      return '7D5BFF'; // 보라색
    } else if (['pet', 'plant', 'money', 'music'].includes(subject)) {
      return '00E0C7'; // 청록색
    } else if (['family', 'health', 'work', 'home'].includes(subject)) {
      return 'FF6633'; // 주황색
    }
    return '7D5BFF'; // 기본값
  }, [searchParams]);

  const [gradientColor, setGradientColor] = useState(getGradientColor());
  const [apiData, setApiData] = useState(null);
  const processingRef = useRef(false); // 현재 처리 중인지 확인

  // API 요청 함수
  const fetchHobbyData = useCallback(async (subject) => {
    try {
      const response = await fetch(
        `https://chukapi.xyz:3000/hobby/${subject.toLowerCase()}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      setApiData(data);
    } catch (err) {
      console.error('API Error:', err);
    }
  }, []);

  // URL 파라미터 변경시 그라디언트 색상과 API 요청 업데이트
  useEffect(() => {
    setGradientColor(getGradientColor());

    // 현재 subject 파라미터로 API 요청
    const currentSubjectParam = searchParams.get('subject') || 'game';
    fetchHobbyData(currentSubjectParam);
  }, [getGradientColor, searchParams, fetchHobbyData]);

  // Matter.js 초기화
  useEffect(() => {
    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = Math.min(window.innerWidth, 480);
    const height = window.innerHeight;

    // 바닥, 벽 (보이지 않는 물리 경계)
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      height - 20,
      width,
      40,
      {
        isStatic: true,
      },
    );
    const leftWall = Bodies.rectangle(
      window.innerWidth / 2 - width / 2 + 20,
      height / 2,
      40,
      height,
      {
        isStatic: true,
      },
    );
    const rightWall = Bodies.rectangle(
      window.innerWidth / 2 + width / 2 - 20,
      height / 2,
      40,
      height,
      {
        isStatic: true,
      },
    );
    World.add(engine.world, [ground, leftWall, rightWall]);

    Engine.run(engine);

    engineRef.current.width = width;
    engineRef.current.height = height;

    return () => {
      Engine.clear(engine);
      bodiesRef.current = [];
    };
  }, []);

  // 새로운 아이콘 추가하는 함수
  const addNewIcon = useCallback(async () => {
    if (!engineRef.current) return;

    const World = Matter.World,
      Bodies = Matter.Bodies;

    // 10개 제한 - 가장 오래된 공 제거
    if (bodiesRef.current.length >= 10) {
      const oldest = bodiesRef.current.shift();
      Matter.World.remove(engineRef.current.world, oldest.body);
      oldest.element.remove();
    }

    // 랜덤 크기 (지름 40-80px)
    const elementWidth = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
    const radius = elementWidth / 2;

    // 랜덤 색상 선택 (3가지 중 하나)
    const colors = ['#7D5BFF', '#00E0C7', '#FF6633'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // 현재 subject에 해당하는 SVG 아이콘 가져오기
    const subject = searchParams.get('subject')?.toLowerCase() || 'game';
    const svgPath = `${import.meta.env.BASE_URL}${subject}.svg`;

    // 새로운 공 생성 (동적 크기)
    const centerX = 240;
    const minX = centerX - (480 - elementWidth) / 2 + radius;
    const maxX = centerX + (480 - elementWidth) / 2 - radius;
    const randomX = Math.random() * (maxX - minX) + minX;
    const body = Bodies.circle(
      window.innerWidth / 2 + (randomX - 240),
      elementWidth / 2,
      radius,
      {
        label: 'hobby',
        restitution: 0.8,
      },
    );

    // HTML 요소 생성
    const element = document.createElement('div');
    element.className = 'hobby-icon';

    // SVG를 fetch하여 색상 변경
    try {
      const response = await fetch(svgPath);
      const svgText = await response.text();
      // fill="black" 또는 fill 속성을 랜덤 색상으로 변경
      const coloredSvg = svgText.replace(
        /fill="[^"]*"/g,
        `fill="${randomColor}"`,
      );
      element.innerHTML = coloredSvg;
    } catch (error) {
      console.error('SVG 로드 실패:', error);
      // 폴백: 기본 아이콘
      element.innerHTML = `<div style="width: 60%; height: 60%; background: ${randomColor};"></div>`;
    }

    element.style.cssText = `
    position: absolute;
    width: ${elementWidth}px;
    height: ${elementWidth}px;
    border-radius: 9999px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: none;
    transform-origin: center;
  `;

    // SVG 크기 조정
    const svg = element.querySelector('svg');
    if (svg) {
      svg.style.width = '60%';
      svg.style.height = '60%';
    }

    sceneRef.current.appendChild(element);

    // body와 element 매핑 저장 (크기 정보도 포함)
    bodiesRef.current.push({ body, element, width: elementWidth });
    World.add(engineRef.current.world, body);
  }, [searchParams]);

  // 새로운 박스만 추가하는 함수
  const addNewBox = useCallback(
    (hobbyText) => {
      if (!engineRef.current) return;

      const World = Matter.World,
        Bodies = Matter.Bodies;

      // 8개 제한 - 가장 오래된 공 제거
      if (bodiesRef.current.length >= 10) {
        const oldest = bodiesRef.current.shift();
        Matter.World.remove(engineRef.current.world, oldest.body);
        oldest.element.remove();
      }

      // 텍스트 길이에 따른 크기 계산
      const textLength = hobbyText.length;
      const minWidth = 80;
      const charWidth = 24; // 글자 하나당 대략적인 픽셀 너비
      const elementWidth = Math.max(minWidth, textLength * charWidth + 40); // 패딩 포함
      const radius = elementWidth / 2; // 반지름은 너비의 절반

      // 새로운 공 생성 (동적 크기)
      const centerX = 240;
      const minX = centerX - (480 - elementWidth) / 2 + radius;
      const maxX = centerX + (480 - elementWidth) / 2 - radius;
      const randomX = Math.random() * (maxX - minX) + minX;
      const body = Bodies.rectangle(
        window.innerWidth / 2 + (randomX - 240),
        60,
        elementWidth,
        80,
        {
          label: 'hobby',
          restitution: 0.8,
          chamfer: {
            radius: 40, // 모서리 반지름 설정
          },
        },
      );

      // HTML 요소 생성
      const element = document.createElement('div');
      element.className = 'hobby-ball';
      element.textContent = hobbyText;
      element.style.cssText = `
    position: absolute;
    width: ${elementWidth}px;
    height: 80px;
    border-radius: 40px;
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
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

      setTimeout(() => {
        addNewIcon();
      }, 500);
    },
    [addNewIcon],
  );

  // API 데이터를 순차적으로 처리하는 함수
  const processApiDataSequentially = useCallback(
    async (data) => {
      if (!data || processingRef.current) return;

      processingRef.current = true;

      // API 응답에서 words 배열 추출
      const words = data.words || [];

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word) {
          addNewBox(word);
          // 각 박스 추가 사이에 딜레이 (1초)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      processingRef.current = false;
    },
    [addNewBox],
  );

  // API 데이터가 변경될 때마다 순차 처리 실행
  useEffect(() => {
    if (apiData) {
      processApiDataSequentially(apiData);
    }
  }, [apiData, processApiDataSequentially]);

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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const word = input.trim();
    const subject = searchParams.get('subject')?.toLowerCase() || 'game';

    // 화면에 먼저 표시
    addNewBox(word);
    setInput('');

    // 서버에 POST 요청
    try {
      const response = await fetch(
        `https://chukapi.xyz:3000/hobby/${subject}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Word added:', data);
    } catch (err) {
      console.error('POST Error:', err);
    }
  };

  return (
    <div
      className="hobby_container"
      style={{ '--gradient-color': `#${gradientColor}` }}
    >
      <div className="blur-overlay"></div>
      <div className="hobby-page">
        <h2 className="hobby-title">{currentSubject}</h2>

        <form className="hobby-form" onSubmit={handleAdd}>
          <input
            className="hobby-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="취미를 입력하세요"
          />
          <button className="hobby-btn" type="submit">
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.29381 12.2871L5.57839 7.00016L0.29381 1.71322C-0.0979368 1.3213 -0.0979368 0.685864 0.29381 0.293942C0.685557 -0.0979806 1.3207 -0.0979806 1.71245 0.293942L7.70635 6.29052C8.09778 6.68247 8.09799 7.31799 7.70635 7.7098L1.71245 13.7064C1.32079 14.0979 0.685476 14.0979 0.29381 13.7064C-0.0978291 13.3146 -0.097614 12.6791 0.29381 12.2871Z"
                fill="white"
              />
            </svg>
          </button>
        </form>
      </div>
      <div ref={sceneRef} className="hobby-canvas" />
    </div>
  );
}

export default HobbyPage;
