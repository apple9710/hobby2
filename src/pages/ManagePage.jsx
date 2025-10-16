import { useState, useEffect } from 'react';
import './ManagePage.css';

function ManagePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [editValue, setEditValue] = useState('');

  const CATEGORIES = [
    { key: 'game', label: '게임' },
    { key: 'book', label: '책' },
    { key: 'movie', label: '영화' },
    { key: 'food', label: '음식' },
    { key: 'pet', label: '반려동물' },
    { key: 'plant', label: '식물' },
    { key: 'money', label: '돈' },
    { key: 'music', label: '음악' },
    { key: 'family', label: '가족' },
    { key: 'health', label: '건강' },
    { key: 'job', label: '일' },
    { key: 'home', label: '집' },
  ];

  // 전체 데이터 가져오기
  const fetchAllData = async () => {
    try {
      const response = await fetch('https://chukapi.xyz:3000/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    }
  };

  // 비밀번호 확인
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === '97jy') {
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // 아코디언 토글
  const toggleCategory = (categoryKey) => {
    setOpenCategory(openCategory === categoryKey ? null : categoryKey);
  };

  // 단어 삭제
  const handleDeleteWord = async (categoryKey, word) => {
    if (!confirm(`"${word}"를 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(
        `https://chukapi.xyz:3000/hobby/${categoryKey}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
        }
      );

      if (!response.ok) throw new Error('Failed to delete word');

      // 데이터 다시 불러오기
      await fetchAllData();
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting word:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  // 단어 수정 시작
  const startEditing = (categoryKey, word) => {
    setEditingWord({ categoryKey, word });
    setEditValue(word);
  };

  // 단어 수정 취소
  const cancelEditing = () => {
    setEditingWord(null);
    setEditValue('');
  };

  // 단어 수정 저장
  const handleUpdateWord = async (categoryKey, oldWord) => {
    if (!editValue.trim()) {
      alert('단어를 입력해주세요.');
      return;
    }

    if (editValue === oldWord) {
      cancelEditing();
      return;
    }

    try {
      const response = await fetch(
        `https://chukapi.xyz:3000/hobby/${categoryKey}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldWord, newWord: editValue }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update word');
      }

      // 데이터 다시 불러오기
      await fetchAllData();
      cancelEditing();
      alert('수정되었습니다.');
    } catch (err) {
      console.error('Error updating word:', err);
      alert(err.message || '수정에 실패했습니다.');
    }
  };

  // 데이터 초기화
  const handleResetData = async () => {
    if (!confirm('모든 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    if (!confirm('정말로 초기화하시겠습니까?')) return;

    try {
      const response = await fetch('https://chukapi.xyz:3000/reset', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reset data');

      // 데이터 다시 불러오기
      await fetchAllData();
      alert('데이터가 초기화되었습니다.');
    } catch (err) {
      console.error('Error resetting data:', err);
      alert('초기화에 실패했습니다.');
    }
  };

  // 비밀번호 인증 화면
  if (!isAuthenticated) {
    return (
      <div className="manage-container">
        <div className="auth-box">
          <h1>관리자 인증</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="auth-input"
              autoFocus
            />
            <button type="submit" className="auth-button">
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 관리 페이지
  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>데이터 관리</h1>
        <button className="reset-button" onClick={handleResetData}>
          전체 초기화
        </button>
      </div>

      <div className="categories-list">
        {CATEGORIES.map((category) => {
          const words = data?.[category.key] || [];
          const isOpen = openCategory === category.key;

          return (
            <div key={category.key} className="category-item">
              <div
                className="category-header"
                onClick={() => toggleCategory(category.key)}
              >
                <span className="category-label">
                  {category.label} ({words.length})
                </span>
                <span className="category-arrow">{isOpen ? '▼' : '▶'}</span>
              </div>

              {isOpen && (
                <div className="category-content">
                  {words.length === 0 ? (
                    <div className="empty-message">데이터가 없습니다.</div>
                  ) : (
                    <ul className="words-list">
                      {words.map((word, index) => (
                        <li key={index} className="word-item">
                          {editingWord?.categoryKey === category.key &&
                          editingWord?.word === word ? (
                            <div className="word-edit-mode">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="word-edit-input"
                                autoFocus
                              />
                              <button
                                className="word-save-button"
                                onClick={() =>
                                  handleUpdateWord(category.key, word)
                                }
                              >
                                저장
                              </button>
                              <button
                                className="word-cancel-button"
                                onClick={cancelEditing}
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="word-view-mode">
                              <span className="word-text">{word}</span>
                              <div className="word-actions">
                                <button
                                  className="word-edit-button"
                                  onClick={() =>
                                    startEditing(category.key, word)
                                  }
                                >
                                  수정
                                </button>
                                <button
                                  className="word-delete-button"
                                  onClick={() =>
                                    handleDeleteWord(category.key, word)
                                  }
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ManagePage;
