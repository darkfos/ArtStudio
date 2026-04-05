import { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard/CourseCard';
import lessonService from '../../services/lessonService';
import './LessonsPage.css';
import { api } from '../../utils/apiConfig';

const tokenUtils = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },
  logout: (navigateTo) => {
    console.log('🚪 Выход из системы');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (navigateTo) {
      navigateTo('auth');
    } else {
      window.location.href = '/auth';
    }
  },
  refreshTokens: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('❌ Нет refresh токена');
      return null;
    }

    try {
      console.log('🔄 Попытка обновления токенов...');
      const response = await fetch(`${api}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      console.log('📥 Ответ от refresh:', data);
      
      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        console.log('✅ Токены успешно обновлены');
        return data.data.accessToken;
      } else {
        console.log('❌ Не удалось обновить токены');
        tokenUtils.logout();
        return null;
      }
    } catch (error) {
      console.error('❌ Ошибка при обновлении токенов:', error);
      tokenUtils.logout();
      return null;
    }
  },
  fetchWithAuth: async (url, options = {}, navigateTo) => {
    let accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.log('❌ Нет токена доступа');
      if (navigateTo) {
        navigateTo('auth');
      }
      throw new Error('Нет токена доступа');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      console.log('📤 Запрос с токеном:', url);
      let response = await fetch(api, { ...options, headers });
      
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Токен невалидный, пробуем обновить...');
        const newToken = await tokenUtils.refreshTokens();
        
        if (newToken) {
          console.log('✅ Токен обновлен, повторяем запрос');
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(api, { ...options, headers });
        } else {
          console.log('❌ Не удалось обновить токен, перенаправляем на вход');
          tokenUtils.logout(navigateTo);
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ Fetch with auth error:', error);
      throw error;
    }
  }
};

const Lessons = ({ onLessonSelect, isLoggedIn, navigateTo }) => {
  const [allLessons, setAllLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [userLessons, setUserLessons] = useState([]);
  
  const [activeLayers, setActiveLayers] = useState({
    shadow: true,
    gradient: true,
    blur: true,
    highlighted: true,
    trail: false
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await lessonService.getAllLessons();
        const formattedLessons = data.map(lesson => 
          lessonService.formatLessonForCard(lesson)
        );
        setAllLessons(formattedLessons);
        setFilteredLessons(formattedLessons);

        if (isLoggedIn) {
          await fetchCompletedLessons();
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Не удалось загрузить уроки');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [isLoggedIn]);

  const fetchCompletedLessons = async () => {
    try {
      const token = tokenUtils.getAccessToken();
      if (!token) return;

      const response = await tokenUtils.fetchWithAuth(`${api}/auth/my-lessons`, {}, navigateTo);
      if (!response) return;
      
      const data = await response.json();
      
      if (data.success) {
        setUserLessons(data.data);
        const completedIds = data.data
          .filter(lesson => lesson.completed)
          .map(lesson => lesson.id);
        setCompletedLessons(completedIds);
      }
    } catch (error) {
      console.error('Ошибка загрузки пройденных уроков:', error);
    }
  };

  useEffect(() => {
    let filtered = [...allLessons];

    if (activeTab !== 'all') {
      filtered = filtered.filter(lesson => lesson.type === activeTab);
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'beginner') {
        filtered = filtered.filter(lesson => lesson.level === 'Начинающий');
      } else if (activeFilter === 'advanced') {
        filtered = filtered.filter(lesson => lesson.level === 'Продвинутый');
      } else if (activeFilter === 'painting') {
        filtered = filtered.filter(lesson => 
          lesson.category === 'Живопись' || 
          lesson.category === 'Акварель' || 
          lesson.category === 'Масло' || 
          lesson.category === 'Пастель'
        );
      } else if (activeFilter === 'drawing') {
        filtered = filtered.filter(lesson => 
          lesson.category === 'Рисунок' || 
          lesson.category === 'Графика' || 
          lesson.category === 'Скетчинг'
        );
      }
    }

    setFilteredLessons(filtered);
  }, [activeTab, activeFilter, allLessons]);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const tabs = [
    { id: 'all', label: `Все уроки (${allLessons.length})` },
    { id: 'online', label: `Онлайн-занятия (${allLessons.filter(l => l.type === 'online').length})` },
    { id: 'video', label: `Видеоуроки (${allLessons.filter(l => l.type === 'video').length})` }
  ];

  const filters = [
    { id: 'all', label: 'Все категории' },
    { id: 'beginner', label: 'Для начинающих' },
    { id: 'advanced', label: 'Продвинутые' },
    { id: 'painting', label: 'Живопись' },
    { id: 'drawing', label: 'Рисунок' }
  ];

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleModalAction = () => {
    if (!isLoggedIn) {
      navigateTo('auth');
      return;
    }

    if (selectedLesson) {
      if (selectedLesson.type === 'video') {
        navigateTo('purchase');
      } else if (selectedLesson.type === 'online') {
        navigateTo('booking');
      }
    }
    setSelectedLesson(null);
  };

  const handleMarkAsCompleted = async (lesson) => {
    if (!isLoggedIn) {
      navigateTo('auth');
      return;
    }

    setCompletingLesson(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        navigateTo('auth');
        return;
      }

      console.log('📤 Отправка запроса на отметку курса:', {
        lessonId: lesson.id,
        progress: 100
      });

      const response = await tokenUtils.fetchWithAuth(
        `${api}/auth/update-progress`,
        {
          method: 'POST',
          body: JSON.stringify({
            lessonId: lesson.id,
            progress: 100
          })
        },
        navigateTo
      );

      if (!response) return;

      const data = await response.json();
      console.log('📥 Ответ сервера:', data);
      
      setCompletedLessons([...completedLessons, lesson.id]);
      
      const updatedUserLessons = userLessons.map(l => 
        l.id === lesson.id ? { ...l, completed: true, progress: 100 } : l
      );
      setUserLessons(updatedUserLessons);
      
      setSelectedLesson(null);
      
      if (data.success) {
        alert(data.message || '✅ Курс отмечен как пройденный!');
      } else {
        alert('✅ Курс отмечен как пройденный (проверьте профиль)');
      }
      
      if (onLessonSelect) {
        onLessonSelect({ type: 'refresh-profile' });
      }
    } catch (error) {
      console.error('❌ Ошибка отметки курса:', error);
      
      setCompletedLessons([...completedLessons, lesson.id]);
      setSelectedLesson(null);
      
      alert('✅ Курс отмечен как пройденный (локально)');
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleEnrollInLesson = async (lesson) => {
    if (!isLoggedIn) {
      navigateTo('auth');
      return;
    }

    try {
      const response = await tokenUtils.fetchWithAuth(
        `${api}/auth/enroll`,
        {
          method: 'POST',
          body: JSON.stringify({ lessonId: lesson.id })
        },
        navigateTo
      );

      if (!response) return;

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Вы успешно записались на урок!');
        await fetchCompletedLessons();
      } else {
        alert(data.message || '❌ Не удалось записаться на урок');
      }
    } catch (error) {
      console.error('Ошибка записи на урок:', error);
      alert('Произошла ошибка при записи на урок');
    }
  };

  const word = "УРОКИ";
  const letters = word.split('');

  if (loading) {
    return (
      <section className="lessons-page">
        <div className="lessons-container">
          <div className="loading-spinner">Загрузка уроков...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="lessons-page">
        <div className="lessons-container">
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="lessons-page" id="lessons">
      <div className="lessons-bg-decor">
        <div className="lessons-stroke purple"></div>
        <div className="lessons-stroke gold"></div>
        <div className="lessons-stroke teal"></div>
      </div>

      <div className="lessons-container">
        <div className="lessons-header">
          <div className="lessons-title-typography">
            <div className="base-word">УРОКИ</div>
            {activeLayers.shadow && <div className="shadow-word">УРОКИ</div>}
            {activeLayers.gradient && <div className="gradient-word">УРОКИ</div>}
            {activeLayers.blur && <div className="blur-word">УРОКИ</div>}
            {activeLayers.highlighted && (
              <div className="highlighted-letters">
                {letters.map((letter, index) => (
                  <span key={index}>{letter}</span>
                ))}
              </div>
            )}
            {activeLayers.trail && (
              <div className="trail-words">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="trail-word">УРОКИ</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="typography-controls">
            <span className="control-label">Слои:</span>
            <button 
              className={`control-button ${activeLayers.shadow ? 'active' : ''}`}
              onClick={() => toggleLayer('shadow')}
            >
              Тень
            </button>
            <button 
              className={`control-button ${activeLayers.gradient ? 'active' : ''}`}
              onClick={() => toggleLayer('gradient')}
            >
              Градиент
            </button>
            <button 
              className={`control-button ${activeLayers.blur ? 'active' : ''}`}
              onClick={() => toggleLayer('blur')}
            >
              Блюр
            </button>
            <button 
              className={`control-button ${activeLayers.highlighted ? 'active' : ''}`}
              onClick={() => toggleLayer('highlighted')}
            >
              Буквы
            </button>
            <button 
              className={`control-button ${activeLayers.trail ? 'active' : ''}`}
              onClick={() => toggleLayer('trail')}
            >
              След
            </button>
          </div>
          
          <p className="lessons-subtitle">
            Традиционные техники рисования: акварель, масло, пастель, академический рисунок.
            Для начинающих и продолжающих.
          </p>
        </div>

        <div className="lessons-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`lesson-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveFilter('all');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lessons-filters">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="lessons-grid">
          {filteredLessons.map(lesson => (
            <CourseCard 
              key={lesson.id}
              course={lesson}
              variant="default"
              onClick={handleLessonClick}
              isLoggedIn={isLoggedIn}
              isCompleted={completedLessons.includes(lesson.id)}
            />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="no-results">
            <p>По вашему запросу ничего не найдено</p>
          </div>
        )}

        <div className="lessons-quote">
          <p className="lessons-quote-text">
            "В каждой картине — частица души. Учитесь видеть прекрасное в простом."
          </p>
          <div className="lessons-quote-author">— Елена Годионенко</div>
        </div>
      </div>

      {/* Модальное окно */}
      {selectedLesson && (
        <div className="lesson-modal-overlay" onClick={() => setSelectedLesson(null)}>
          <div className="lesson-modal-container" onClick={e => e.stopPropagation()}>
            <button className="lesson-modal-close" onClick={() => setSelectedLesson(null)}>×</button>
            
            <div className="lesson-modal-content">
              <div className="lesson-modal-icon-wrapper">
                <div className="lesson-modal-icon-large">{selectedLesson.icon}</div>
                <div className="lesson-modal-color-dot" style={{ background: selectedLesson.gradient?.split(' ')[1] || '#8a2be2' }}></div>
              </div>
              
              <div className="lesson-modal-details">
                <span className="lesson-modal-type">{selectedLesson.type === 'online' ? 'ОНЛАЙН-КУРС' : 'ВИДЕОУРОК'}</span>
                <h3 className="lesson-modal-title">{selectedLesson.title}</h3>
                <p className="lesson-modal-description">{selectedLesson.description}</p>
                
                <div className="lesson-modal-stats">
                  <div className="lesson-modal-stat-item">
                    <span className="stat-label">Уровень</span>
                    <span className="stat-value">{selectedLesson.level}</span>
                  </div>
                  <div className="lesson-modal-stat-item">
                    <span className="stat-label">Длительность</span>
                    <span className="stat-value">{selectedLesson.duration}</span>
                  </div>
                  <div className="lesson-modal-stat-item">
                    <span className="stat-label">Учеников</span>
                    <span className="stat-value">{selectedLesson.students}</span>
                  </div>
                </div>

                <div className="lesson-modal-features">
                  <h4 className="features-title">В программе:</h4>
                  <ul className="features-list">
                    {selectedLesson.features?.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <span className="feature-bullet">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lesson-modal-actions">
                  <div className="lesson-modal-price-block">
                    <span className="price-label">Стоимость</span>
                    <span className="lesson-modal-price">{selectedLesson.price}</span>
                  </div>
                  <div className="lesson-modal-buttons">
                    <button 
                      className="lesson-modal-action-btn"
                      onClick={handleModalAction}
                    >
                      {!isLoggedIn && 'Войти'}
                      {isLoggedIn && selectedLesson.type === 'online' && 'Записаться'}
                      {isLoggedIn && selectedLesson.type === 'video' && 'Купить'}
                    </button>
                    <button 
                      className={`lesson-modal-complete-btn ${completingLesson ? 'loading' : ''}`}
                      onClick={() => handleMarkAsCompleted(selectedLesson)}
                      disabled={completingLesson || completedLessons.includes(selectedLesson.id)}
                    >
                      {completingLesson ? '⏳ Отметка...' : 
                       completedLessons.includes(selectedLesson.id) ? '✓ Уже пройден' : '✓ Отметить пройденным'}
                    </button>
                    {isLoggedIn && !userLessons.find(l => l.id === selectedLesson.id) && (
                      <button 
                        className="lesson-modal-enroll-btn"
                        onClick={() => handleEnrollInLesson(selectedLesson)}
                      >
                        📝 Записаться
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Lessons;