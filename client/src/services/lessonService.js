import { api } from "../utils/apiConfig";

class LessonService {
  // Получить все уроки
  async getAllLessons() {
    try {
      const response = await fetch(`${api}/lessons`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении уроков');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  }

  // Получить популярные уроки
  async getPopularLessons() {
    try {
      const response = await fetch(`${api}/lessons/popular`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении популярных уроков');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching popular lessons:', error);
      throw error;
    }
  }

  // Получить урок по ID
  async getLessonById(id) {
    try {
      const response = await fetch(`${api}/lessons/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении урока');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }

  // Получить уроки по типу
  async getLessonsByType(type) {
    try {
      const response = await fetch(`${api}/lessons/type/${type}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении уроков');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching lessons by type:', error);
      throw error;
    }
  }

  // Получить уроки по уровню
  async getLessonsByLevel(level) {
    try {
      const response = await fetch(`${api}/lessons/level/${level}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении уроков');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching lessons by level:', error);
      throw error;
    }
  }

  // Получить уроки по категории
  async getLessonsByCategory(category) {
    try {
      const response = await fetch(`${api}/lessons/category/${category}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении уроков');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching lessons by category:', error);
      throw error;
    }
  }

  formatLessonForCard(lesson) {
    const colors = this.getLessonColors(lesson);
    
    return {
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.category,
      description: lesson.description,
      price: `${parseInt(lesson.price).toLocaleString()} ₽`,
      lessons: parseInt(lesson.duration) || 8,
      duration: lesson.duration,
      category: lesson.category,
      level: lesson.level,
      type: lesson.type,
      students: this.getStudentsCount(lesson.id),
      gradient: colors.gradient,
      imageColor: colors.imageColor,
      icon: colors.icon,
      features: this.getFeaturesByCategory(lesson.category),
      isNew: lesson.id > 10, 
      isPopular: lesson.id <= 3, 
    };
  }

  getLessonColors(lesson) {
    const category = lesson.category;
    const level = lesson.level;
    
    const categoryColors = {
      'Рисунок': {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        imageColor: '#6B4E71',
        icon: '✏️'
      },
      'Живопись': {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        imageColor: '#588B8B',
        icon: '🎨'
      },
      'Digital': {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        imageColor: '#5F7C8A',
        icon: '💻'
      },
      'Акварель': {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        imageColor: '#588B8B',
        icon: '💧'
      },
      'Масло': {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        imageColor: '#7D6B5E',
        icon: '🖼️'
      },
      'Пастель': {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        imageColor: '#B89B7B',
        icon: '🖍️'
      },
      'Графика': {
        gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        imageColor: '#4F4F4F',
        icon: '🖋️'
      },
      'Скетчинг': {
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        imageColor: '#7A6A8F',
        icon: '✒️'
      }
    };

    const levelVariations = {
      'Начинающий': {
        opacity: 1,
        brightness: 1
      },
      'Средний': {
        opacity: 0.9,
        brightness: 0.95
      },
      'Продвинутый': {
        opacity: 0.8,
        brightness: 0.9
      }
    };

    const baseColors = categoryColors[category] || categoryColors['Рисунок'];
    
    return baseColors;
  }

  getStudentsCount(id) {
    const counts = {
      1: '120+',
      2: '85+',
      3: '70+',
      4: '50+',
      5: '45+',
      6: '60+',
      7: '55+',
      8: '40+',
      9: '35+',
      10: '30+',
      11: '25+',
      12: '20+',
      13: '15+',
      14: '45+',
      15: '50+',
      16: '65+',
      17: '40+',
      18: '35+',
      19: '30+',
      20: '25+'
    };
    return counts[id] || '45+ учеников';
  }

  getFeaturesByCategory(category) {
    const features = {
      'Рисунок': ['Основы композиции', 'Светотень', 'Перспектива', 'Построение'],
      'Живопись': ['Работа с цветом', 'Техники нанесения', 'Смешивание', 'Лессировка'],
      'Digital': ['Procreate', 'Слои', 'Кисти', 'Эффекты'],
      'Акварель': ['По-сырому', 'Лессировка', 'Заливки', 'Детали'],
      'Масло': ['Имприматура', 'Корпусная живопись', 'Лессировки', 'Мастихин'],
      'Пастель': ['Растушевка', 'Слои', 'Фактуры', 'Фиксация'],
      'Графика': ['Штриховка', 'Тон', 'Линия', 'Пятно'],
      'Скетчинг': ['Быстрые зарисовки', 'Маркеры', 'Линия', 'Пятно']
    };
    return features[category] || ['Обратная связь', 'Практика', 'Сертификат', 'Домашние задания'];
  }
}

export default new LessonService();