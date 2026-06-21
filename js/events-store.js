
const EVENTS = [
    {
        id: 'podium',
        date: '24.04',
        name: 'ferma-подиум',
        description:
            'Бренд-мерч — это давно не просто логотип на футболке. Это манифест нашего комьюнити. Приглашаем вас на концептуальный подиумный показ, где мы презентуем новую лимитированную коллекцию одежды и аксессуаров от ferma.',
        poster: 'assets/img/events/podium-poster.jpg',
        panelBgClass: 'event-page__panel--podium',
        galleryColor: '#898989',
        posterFrameColor: '#494949',
        ticketUrl: '#',
    },
    {
        id: 'festival',
        date: '14.08',
        name: 'фестиваль',
        description:
            'Главное событие сезона — масштабный городской open-air фестиваль здорового образа жизни! Мы объединяем пользу, вкусную еду и классную музыку на одной площадке. Весь день драйва, общения и новых открытий.',
        poster: 'assets/img/events/festival-poster.jpg',
        panelBgClass: 'event-page__panel--festival',
        galleryColor: '#898989',
        posterFrameColor: '#494949',
        ticketUrl: '#',
    },
    {
        id: 'lecture',
        date: '18.03',
        name: 'лекция',
        description: 'Развеем мифы о диетах и разберёмся, как кормить свой организм так, чтобы он говорил «спасибо». Без жёстких ограничений, скучных подсчётов калорий и деления еды на «плохую» и «хорошую». Только доказанная медицина, тренды нутрициологии и реальные лайфхаки.',
        poster: 'assets/img/events/lecture-poster.jpg',
        panelBgClass: 'event-page__panel--lecture',
        galleryColor: '#898989',
        posterFrameColor: '#494949',
        ticketUrl: '#',
    },
    {
        id: 'masterclass',
        date: '29.05',
        name: 'мастер-класс идеального салата',
        description: 'Думаете, салат — это просто покрошенные огурцы с помидорами? Докажем обратное! Приглашаем на практический гастрономический воркшоп, где мы превратим привычную зелень в кулинарный шедевр ресторанного уровня.',
        poster: 'assets/img/events/masterclass-poster.jpg',
        panelBgClass: 'event-page__panel--masterclass',
        galleryColor: '#898989',
        posterFrameColor: '#494949',
        ticketUrl: '#',
    },
];

function getEvent(id) {
    return EVENTS.find((event) => event.id === id);
}

window.EventsStore = {
    EVENTS,
    getEvent,
};
