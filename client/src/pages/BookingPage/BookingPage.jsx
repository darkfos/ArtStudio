import React, { useState } from 'react';
import './BookingPage.css';

const BookingPage = ({ user, navigateTo }) => {
  const [selectedService, setSelectedService] = useState(null);

  const phoneNumber = '89613303737';
  const telLink = `tel:${phoneNumber}`;

  const services = [
    {
      id: 1,
      title: 'Индивидуальные мастер-классы',
      format: 'индивидуально',
      audience: 'Дети (от 4 лет) и взрослые',
      duration: '1.5–2 часа',
      price: 'от 1500 ₽',
      letter: 'И',
      description: 'Персональные занятия под ваш запрос. Выбираете технику, сюжет и время. Преподаватель работает только с вами, уделяя максимум внимания.',
      features: ['Любой уровень подготовки', 'Все материалы предоставляются', 'Гибкий график', 'Возможность выбрать технику'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    },
    {
      id: 2,
      title: 'День рождения',
      format: 'выездной',
      audience: 'Дети и взрослые',
      duration: '2–3 часа',
      price: 'от 5000 ₽',
      letter: 'Д',
      description: 'Незабываемый праздник с творчеством! Проведем мастер-класс у вас дома, в кафе или в нашей студии. Гости уйдут не только с впечатлениями, но и с готовыми картинами.',
      features: ['Выезд в любую точку города', 'Все материалы с собой', 'Сценарий под ваш формат', 'Фотосессия процесса'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    },
    {
      id: 3,
      title: 'Корпоративные мастер-классы',
      format: 'выездной',
      audience: 'Коллективы до 15 человек',
      duration: '2 часа',
      price: 'от 8000 ₽',
      letter: 'К',
      description: 'Командообразование через творчество. Отличный вариант для корпоратива, тимбилдинга или поздравления коллег. Снимаем стресс и создаем общие воспоминания.',
      features: ['Адаптация под любой бюджет', 'Возможность брендирования', 'Профессиональный фотограф', 'Сертификаты участникам'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    },
    {
      id: 4,
      title: 'Арт-свидание',
      format: 'в студии',
      audience: 'Пары',
      duration: '2 часа',
      price: '3500 ₽',
      letter: 'А',
      description: 'Живопись вдвоем — романтичный формат для двоих. Пишете одну картину вместе или каждый свою. Вино, фрукты и атмосфера творчества включены 🥂',
      features: ['Одна или две картины', 'Напитки и угощения', 'Помощь преподавателя', 'Готовая работа в подарок'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    },
    {
      id: 5,
      title: 'Семейные мастер-классы',
      format: 'выездной / в студии',
      audience: 'Родители с детьми',
      duration: '1.5–2 часа',
      price: 'от 2500 ₽',
      letter: 'С',
      description: 'Творческий выходной для всей семьи. Рисуем вместе, общаемся и создаем семейную реликвию. Доступно для детей от 4 лет с родителями.',
      features: ['Адаптированная программа', 'Безопасные материалы', 'Уютная атмосфера', 'Можно с собой угощения'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    },
    {
      id: 6,
      title: 'Мастер-классы в студии',
      format: 'групповой',
      audience: 'Дети и взрослые',
      duration: '1.5 часа',
      price: '1200–1800 ₽',
      letter: 'М',
      description: 'Регулярные занятия в уютной студии. Разные техники: акварель, масло, акрил, скетчинг. Новые темы каждую неделю.',
      features: ['Все материалы включены', 'Небольшие группы (до 6 чел)', 'Расписание на неделю', 'Пробное занятие — 900 ₽'],
      booking: 'Запись по телефону',
      contact: phoneNumber
    }
  ];

  return (
    <div className="booking-page">
      <div className="booking-bg-decor">
        <div className="booking-stroke purple"></div>
        <div className="booking-stroke gold"></div>
        <div className="booking-stroke teal"></div>
      </div>
      <div className="booking-container">
        <div className="booking-header">
          <div className="booking-title-typography">
            <div className="base-word">ЗАПИСЬ</div>
            <div className="shadow-word">ЗАПИСЬ</div>
            <div className="gradient-word">ЗАПИСЬ</div>
            <div className="blur-word">ЗАПИСЬ</div>
            <div className="highlighted-letters">
              <span>З</span>
              <span>А</span>
              <span>П</span>
              <span>И</span>
              <span>С</span>
              <span>Ь</span>
            </div>
          </div>
          <div className="booking-intro">
            <p className="booking-intro-name">Елена Годионенко</p>
            <p className="booking-intro-text">
              Провожу мастер-классы по рисованию для детей (от 4 лет) и взрослых в художественной студии «ЕлАрт».
            </p>
          </div>
        </div>

        <div className="services-header">
          <div className="services-header-line"></div>
          <div className="services-header-title">
            <span className="title-accent">✦</span> ФОРМАТЫ МАСТЕР-КЛАССОВ <span className="title-accent">✦</span>
          </div>
          <div className="services-header-line"></div>
        </div>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card" onClick={() => setSelectedService(service)}>
              <div className="service-visual">
                <div className="service-letter">{service.letter}</div>
                <div className={`service-format ${service.format.split(' ')[0]}`}>
                  {service.format === 'индивидуально' && 'ИНДИВИДУАЛЬНО'}
                  {service.format === 'выездной' && 'ВЫЕЗДНОЙ'}
                  {service.format === 'выездной / в студии' && 'ВЫЕЗД / СТУДИЯ'}
                  {service.format === 'в студии' && 'В СТУДИИ'}
                  {service.format === 'групповой' && 'ГРУППОВОЙ'}
                </div>
              </div>
              <div className="service-info">
                <div className="service-title">{service.title}</div>
                <div className="service-audience">{service.audience}</div>
                <div className="service-details">
                  <div className="detail-item">
                    <span className="detail-label">Длительность</span>
                    <span className="detail-value">{service.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Стоимость</span>
                    <span className="detail-value price">{service.price}</span>
                  </div>
                </div>
                <div className="service-booking">
                  <span className="booking-icon">📞</span>
                  <span className="booking-text">Позвонить</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-minimal">
          <div className="contact-minimal-content">
            <span className="contact-minimal-icon">📞</span>
            <span className="contact-minimal-text">Все консультации и записи — по телефону</span>
            <a href={telLink} className="contact-minimal-link">
              Позвонить {phoneNumber}
            </a>
          </div>
        </div>

        {selectedService && (
          <div className="booking-modal-overlay" onClick={() => setSelectedService(null)}>
            <div className="booking-modal" onClick={e => e.stopPropagation()}>
              <div className="booking-modal-header-fixed">
                <button className="booking-modal-close" onClick={() => setSelectedService(null)}>✕</button>
                <div className="booking-modal-header-content">
                  <h2 className="booking-modal-title">{selectedService.title}</h2>
                  <div className="booking-modal-audience">{selectedService.audience}</div>
                </div>
              </div>

              <div className="booking-modal-scroll">
                <div className="booking-modal-layout">
                  <div className="booking-modal-left">
                    <div className="booking-modal-letter-wrapper">
                      <div className="booking-modal-letter">{selectedService.letter}</div>
                      <div className={`booking-modal-format ${selectedService.format.split(' ')[0]}`}>
                        {selectedService.format}
                      </div>
                    </div>
                    <div className="booking-modal-price-block">
                      <div className="booking-modal-price-label">Стоимость</div>
                      <div className="booking-modal-price-value">{selectedService.price}</div>
                    </div>
                    <div className="booking-modal-duration">
                      <div className="booking-modal-duration-label">Длительность</div>
                      <div className="booking-modal-duration-value">{selectedService.duration}</div>
                    </div>
                    <div className="booking-modal-meet">
                      <span className="booking-modal-meet-icon">📞</span>
                      <span className="booking-modal-meet-text">Позвонить</span>
                    </div>
                  </div>

                  <div className="booking-modal-right">
                    <div className="booking-modal-description">{selectedService.description}</div>

                    <div className="booking-modal-features">
                      <div className="booking-modal-features-title">В мастер-класс входит:</div>
                      <div className="booking-modal-features-list">
                        {selectedService.features.map((feature, index) => (
                          <div key={index} className="booking-modal-feature-item">
                            <span className="booking-modal-feature-bullet">—</span>
                            <span className="booking-modal-feature-text">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="booking-modal-booking">
                      <div className="booking-modal-booking-title">Запись</div>
                      <div className="booking-modal-booking-detail">{selectedService.booking}</div>
                      <div className="booking-modal-booking-contact">{selectedService.contact}</div>
                    </div>

                    <div className="booking-modal-actions">
                      <a href={telLink}>
                        <button className="booking-modal-btn booking-modal-btn-primary">
                          Позвонить {phoneNumber}
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="booking-footer">
          <p>Художественная студия «ЕлАрт» ✦ Елена Годионенко</p>
          <small>Все материалы предоставляются ✦ Индивидуальный подход ✦ Консультации по телефону</small>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;