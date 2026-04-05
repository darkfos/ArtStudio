import { useState, useEffect } from 'react';
import './ProfilePage.css';
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
      let response = await fetch(url, { ...options, headers });
      
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Токен невалидный, пробуем обновить...');
        const newToken = await tokenUtils.refreshTokens();
        
        if (newToken) {
          console.log('✅ Токен обновлен, повторяем запрос');
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
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

const ProfilePage = ({ onLogout, navigateTo }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  
  const [skills, setSkills] = useState({
    Рисунок: { level: 0, courses: 0, icon: '✏️', name: 'Рисунок' },
    Живопись: { level: 0, courses: 0, icon: '🎨', name: 'Живопись' },
    Акварель: { level: 0, courses: 0, icon: '💧', name: 'Акварель' },
    Масло: { level: 0, courses: 0, icon: '🖼️', name: 'Масло' },
    Пастель: { level: 0, courses: 0, icon: '🖍️', name: 'Пастель' },
    Графика: { level: 0, courses: 0, icon: '🖋️', name: 'Графика' },
    Скетчинг: { level: 0, courses: 0, icon: '✒️', name: 'Скетчинг' }
  });

  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    videoLessons: 0,
    totalProgress: 0
  });
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const savedUser = tokenUtils.getUser();
      const accessToken = tokenUtils.getAccessToken();
      
      console.log('📊 Загрузка профиля:', { 
        hasSavedUser: !!savedUser, 
        hasToken: !!accessToken 
      });
      
      if (!savedUser || !accessToken) {
        console.log('🚫 Нет данных авторизации, перенаправление на вход');
        navigateTo('auth');
        return;
      }

      setUser(savedUser);

      if (accessToken) {
        try {
          const userResponse = await tokenUtils.fetchWithAuth(`${api}/auth/me`, {}, navigateTo);
          if (userResponse) {
            const userData = await userResponse.json();
            
            if (userData.success) {
              const updatedUser = userData.data;
              console.log('✅ Получены актуальные данные пользователя:', updatedUser);
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              await fetchUserData(updatedUser.id);
            } else {
              console.log('⚠️ Не удалось получить данные с сервера, используем сохраненные');
              await fetchUserData(savedUser.id);
            }
          }
        } catch (error) {
          console.error('❌ Ошибка получения данных с сервера:', error);
          await fetchUserData(savedUser.id);
        }
      } else {
        console.log('⚠️ Есть пользователь, но нет токена');
        await fetchUserData(savedUser.id);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      setError('Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      if (tokenUtils.getAccessToken()) {
        // Загружаем уроки пользователя
        const lessonsResponse = await tokenUtils.fetchWithAuth(`${api}/auth/my-lessons`, {}, navigateTo);
        if (lessonsResponse) {
          const lessonsData = await lessonsResponse.json();
          
          if (lessonsData.success) {
            const lessons = lessonsData.data.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              category: lesson.category,
              level: lesson.level,
              duration: lesson.duration,
              price: lesson.price,
              type: lesson.type,
              image_color: lesson.image_color,
              progress: lesson.progress || 0,
              status: lesson.status,
              isVideo: lesson.type === 'video',
              enrolled_at: lesson.enrolled_at,
              completed: lesson.completed || false
            }));
            
            setPurchasedLessons(lessons);
            calculateSkills(lessons.filter(l => l.completed));

            const completedLessons = lessons.filter(l => l.completed);
            const videoLessons = lessons.filter(l => l.type === 'video');
            const totalProgress = lessons.length > 0 
              ? Math.round(lessons.reduce((sum, l) => sum + (l.completed ? 100 : l.progress || 0), 0) / lessons.length)
              : 0;

            setStats({
              totalLessons: lessons.length,
              completedLessons: completedLessons.length,
              videoLessons: videoLessons.length,
              totalProgress: totalProgress
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных профиля:', error);
      setError('Не удалось загрузить данные профиля');
    }
  };

  const calculateSkills = (completedCourses) => {
    const newSkills = { ...skills };
    let total = 0;

    completedCourses.forEach(course => {
      const category = course.category;
      if (newSkills[category]) {
        newSkills[category].courses += 1;
        total++;
      }
    });

    Object.keys(newSkills).forEach(key => {
      newSkills[key].level = Math.min(newSkills[key].courses, 5);
    });

    setSkills(newSkills);
    setTotalCompleted(total);

    const newAchievements = [];
    if (total >= 1) newAchievements.push({ id: 1, name: 'Первый шаг', icon: '🌟', earned: true });
    if (total >= 3) newAchievements.push({ id: 2, name: 'Начинающий художник', icon: '🎨', earned: true });
    if (total >= 5) newAchievements.push({ id: 3, name: 'Опытный творец', icon: '🏆', earned: true });
    if (total >= 10) newAchievements.push({ id: 4, name: 'Мастер кисти', icon: '👑', earned: true });
    
    setAchievements(newAchievements);
  };

  const handleLogout = () => {
    console.log('🚪 Выход из профиля');
    tokenUtils.logout(navigateTo);
    if (onLogout) onLogout();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Новая дата';
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch {
      return 'Новая дата';
    }
  };

  const sortedLessons = [...purchasedLessons].sort((a, b) => b.progress - a.progress);
  const activeLessons = sortedLessons.filter(l => l.progress > 0 && l.progress < 100);
  const completedLessons = sortedLessons.filter(l => l.completed);
  const newLessons = sortedLessons.filter(l => l.progress === 0 && !l.completed);

  const formatUserDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'недавно';
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'недавно';
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-title-typography">
          <div className="base-word">ПРОФИЛЬ</div>
          <div className="shadow-word">ПРОФИЛЬ</div>
          <div className="blur-word">ПРОФИЛЬ</div>
        </div>
        <div className="profile-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-bg-decor">
          <div className="bg-stroke purple"></div>
          <div className="bg-stroke gold"></div>
          <div className="bg-stroke teal"></div>
        </div>
        <div className="profile-empty">
          <div className="profile-empty-letter">👤</div>
          <h2 className="profile-empty-title">Вход не выполнен</h2>
          <p className="profile-empty-text">Войдите в аккаунт, чтобы получить доступ к профилю</p>
          <button className="profile-button primary" onClick={() => navigateTo('auth')}>
            Войти в аккаунт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-bg-decor">
        <div className="bg-stroke purple"></div>
        <div className="bg-stroke gold"></div>
        <div className="bg-stroke teal"></div>
        <div className="bg-stroke pink"></div>
      </div>

      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="profile-title-typography">
            <div className="base-word">ПРОФИЛЬ</div>
            <div className="shadow-word">ПРОФИЛЬ</div>
            <div className="gradient-word">ПРОФИЛЬ</div>
            <div className="blur-word">ПРОФИЛЬ</div>
            <div className="highlighted-letters">
              {['П','Р','О','Ф','И','Л','Ь'].map((letter, index) => (
                <span key={index} className={index === 0 || index === 4 ? 'accent' : ''}>
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-user-card">
          <div className="profile-user-visual">
            <div className="profile-user-letter">
              {user.name ? user.name.charAt(0).toUpperCase() : 'П'}
            </div>
            <div className="profile-user-dimensions">
              <span>{user.role || 'Ученик'}</span>
              <span className="dimension-separator">•</span>
              <span>с {formatUserDate(user.created_at || user.joinedDate || new Date().toISOString())}</span>
            </div>
          </div>

          <div className="profile-user-info">
            <h1 className="profile-user-name">{user.name || 'Новый пользователь'}</h1>
            <p className="profile-user-email">{user.email || 'Не указан'}</p>
            <p className="profile-user-bio">
              {user.bio || 'Добро пожаловать в творческую мастерскую! Здесь вы можете отслеживать свой прогресс и управлять обучением.'}
            </p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.totalLessons}</div>
                <div className="stat-label">уроков</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.completedLessons}</div>
                <div className="stat-label">готово</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalProgress}%</div>
                <div className="stat-label">прогресс</div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-button outline" onClick={() => navigateTo('profile-edit')}>
                Редактировать
              </button>
              <button className="profile-button logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Секция навыков */}
        <div className="profile-skills-section">
          <div className="section-header">
            <div className="section-title-container">
              <div className="section-title-main">НАВЫКИ</div>
              <div className="section-title-shadow">НАВЫКИ</div>
              <div className="section-subtitle-line">
                {totalCompleted} {totalCompleted === 1 ? 'КУРС' : totalCompleted < 5 ? 'КУРСА' : 'КУРСОВ'} ПРОЙДЕНО
              </div>
            </div>
          </div>

          <div className="skills-grid">
            {Object.entries(skills).map(([key, skill]) => (
              <div key={key} className="skill-card" style={{ opacity: skill.courses > 0 ? 1 : 0.5 }}>
                <div className="skill-icon">{skill.icon}</div>
                <div className="skill-info">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-count">{skill.courses} курс(ов)</span>
                  </div>
                  <div className="skill-level">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div 
                        key={level}
                        className={`skill-dot ${level <= skill.level ? 'active' : ''}`}
                        style={{ backgroundColor: level <= skill.level ? '#8a2be2' : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Секция достижений */}
        {achievements.length > 0 && (
          <div className="profile-achievements-section">
            <div className="section-header">
              <div className="section-title-container">
                <div className="section-title-main">ДОСТИЖЕНИЯ</div>
                <div className="section-title-shadow">ДОСТИЖЕНИЯ</div>
                <div className="section-subtitle-line">
                  {achievements.length} ПОЛУЧЕНО
                </div>
              </div>
            </div>

            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4 className="achievement-name">{achievement.name}</h4>
                    <span className="achievement-status">Получено</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            Мои уроки ({purchasedLessons.length})
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'lessons' && (
            <div className="profile-lessons">
              <div className="section-header">
                <div className="section-title-container">
                  <div className="section-title-main">МОИ УРОКИ</div>
                  <div className="section-title-shadow">МОИ УРОКИ</div>
                  <div className="section-subtitle-line">
                    {stats.totalLessons} {stats.totalLessons === 1 ? 'УРОК' : stats.totalLessons < 5 ? 'УРОКА' : 'УРОКОВ'}
                  </div>
                </div>
              </div>

              {/* Завершённые уроки - теперь сверху и с улучшенными стилями */}
              {completedLessons.length > 0 && (
                <>
                  <h3 className="profile-subtitle">🏆 Завершённые</h3>
                  <div className="profile-completed-grid">
                    {completedLessons.map(lesson => (
                      <div key={lesson.id} className="completed-card">
                        <div className="completed-icon-wrapper">
                          <span className="completed-check">✓</span>
                        </div>
                        <div className="completed-content">
                          <h4 className="completed-title">{lesson.title}</h4>
                          <span className="completed-category">{lesson.category}</span>
                          <div className="completed-badge">Пройдено</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeLessons.length > 0 && (
                <>
                  <h3 className="profile-subtitle">📚 В процессе</h3>
                  <div className="profile-lessons-grid">
                    {activeLessons.map(lesson => (
                      <div key={lesson.id} className="profile-lesson-card">
                        <div className="lesson-progress">
                          <svg width="60" height="60" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none"/>
                            <circle 
                              cx="30" cy="30" r="26" 
                              stroke={lesson.image_color || '#8a2be2'} 
                              strokeWidth="4" 
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 26}`}
                              strokeDashoffset={`${2 * Math.PI * 26 * (1 - lesson.progress / 100)}`}
                              transform="rotate(-90 30 30)"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="progress-text">{lesson.progress}%</span>
                        </div>
                        <div className="lesson-info">
                          <span className="lesson-category">{lesson.category}</span>
                          <h4 className="lesson-title">{lesson.title}</h4>
                          <span className="lesson-duration">{lesson.duration}</span>
                          <button 
                            className="lesson-button"
                            onClick={() => navigateTo(lesson.isVideo ? 'video-lesson' : 'lesson', { id: lesson.id })}
                          >
                            Продолжить →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {newLessons.length > 0 && (
                <>
                  <h3 className="profile-subtitle">✨ Новые уроки</h3>
                  <div className="profile-lessons-grid">
                    {newLessons.slice(0, 3).map(lesson => (
                      <div key={lesson.id} className="profile-lesson-card new">
                        <div className="lesson-badge">Новый</div>
                        <div className="lesson-info">
                          <span className="lesson-category">{lesson.category}</span>
                          <h4 className="lesson-title">{lesson.title}</h4>
                          <span className="lesson-duration">{lesson.duration}</span>
                          <button 
                            className="lesson-button"
                            onClick={() => navigateTo(lesson.isVideo ? 'video-lesson' : 'lesson', { id: lesson.id })}
                          >
                            Начать →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {newLessons.length > 3 && (
                    <button className="profile-show-more" onClick={() => navigateTo('lessons')}>
                      Все новые уроки →
                    </button>
                  )}
                </>
              )}

              {purchasedLessons.length === 0 && (
                <div className="profile-empty-section">
                  <div className="empty-icon">🎨</div>
                  <p>У вас пока нет уроков</p>
                  <button className="profile-button primary" onClick={() => navigateTo('lessons')}>
                    Выбрать урок
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;