import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

const TABS = [
  { id: 'terms', label: 'Пользовательское соглашение' },
  { id: 'privacy', label: 'Политика обработки ПД' },
];

function TermsContent() {
  return (
    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
      <p className="text-xs text-gray-400">Редакция от 21 апреля 2026 г.</p>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">1. Общие положения</h3>
        <p>
          Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
          физическим лицом Семашиным Иваном Олеговичем (далее — «Администрация») и пользователем
          интернет-сервиса NutriPlan (далее — «Сервис»).
        </p>
        <p className="mt-2">
          Использование Сервиса означает полное и безоговорочное принятие условий настоящего
          Соглашения. Если вы не согласны с условиями, пожалуйста, прекратите использование Сервиса.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">2. Предмет соглашения</h3>
        <p>
          Администрация предоставляет Пользователю доступ к инструментам автоматизированного расчёта
          калорийности рациона, формирования индивидуального меню и отслеживания динамики веса.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">3. Условия использования</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Минимальный возраст Пользователя — 16 лет.</li>
          <li>
            Пользователь обязуется предоставлять достоверные данные при регистрации и использовании
            Сервиса.
          </li>
          <li>
            Запрещается использовать Сервис в целях, противоречащих законодательству Российской
            Федерации.
          </li>
          <li>
            Пользователь несёт самостоятельную ответственность за корректность введённых параметров
            и за решения, принятые на основе рекомендаций Сервиса.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">4. Ограничение ответственности</h3>
        <p>
          Рекомендации Сервиса носят исключительно информационный характер и <strong>не являются
          медицинским советом</strong>. Перед изменением рациона питания рекомендуется
          проконсультироваться с врачом или квалифицированным специалистом по питанию.
        </p>
        <p className="mt-2">
          Администрация не несёт ответственности за последствия для здоровья, возникшие в результате
          самостоятельного применения рекомендаций Сервиса.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">5. Интеллектуальная собственность</h3>
        <p>
          Все материалы, алгоритмы и программный код Сервиса являются интеллектуальной
          собственностью Администрации. Копирование, воспроизведение или распространение без
          письменного разрешения запрещены.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">6. Изменение условий</h3>
        <p>
          Администрация вправе изменять условия Соглашения в одностороннем порядке. Продолжение
          использования Сервиса после публикации изменений означает согласие с новой редакцией.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">7. Применимое право</h3>
        <p>
          Настоящее Соглашение регулируется и толкуется в соответствии с законодательством
          Российской Федерации.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">8. Контакты</h3>
        <p>
          По всем вопросам, связанным с Соглашением:{' '}
          <a href="mailto:ivansemashin@mail.ru" className="text-emerald-600 hover:underline">
            ivansemashin@mail.ru
          </a>
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
      <p className="text-xs text-gray-400">Редакция от 21 апреля 2026 г.</p>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">1. Оператор персональных данных</h3>
        <p>
          Семашин Иван Олегович (далее — «Оператор»).
          <br />
          Контактный адрес электронной почты:{' '}
          <a href="mailto:ivansemashin@mail.ru" className="text-emerald-600 hover:underline">
            ivansemashin@mail.ru
          </a>
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">2. Правовое основание</h3>
        <p>
          Обработка персональных данных осуществляется в соответствии с Федеральным законом от
          27.07.2006 № 152-ФЗ «О персональных данных» на основании свободного, конкретного,
          информированного и сознательного согласия субъекта персональных данных (ст. 6 ч. 1 п. 1
          ФЗ-152).
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">3. Состав обрабатываемых данных</h3>
        <p>Оператор обрабатывает следующие персональные данные Пользователя:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Имя (псевдоним);</li>
          <li>Адрес электронной почты;</li>
          <li>Пол;</li>
          <li>Рост;</li>
          <li>Вес;</li>
          <li>Дата рождения.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">4. Цели обработки</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Идентификация Пользователя в Сервисе;</li>
          <li>Персонализация расчётов калорийности и формирования меню;</li>
          <li>Ведение трекинга веса и динамики показателей здоровья;</li>
          <li>Обеспечение функционирования Сервиса и технической поддержки.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">5. Способы обработки</h3>
        <p>
          Обработка персональных данных осуществляется с использованием средств автоматизации:
          хранение в защищённой базе данных, обработка запросов через защищённое соединение (HTTPS).
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">6. Передача третьим лицам</h3>
        <p>
          Персональные данные Пользователей <strong>не передаются</strong> третьим лицам, не
          продаются и не обмениваются в коммерческих целях. Передача возможна исключительно по
          требованию уполномоченных государственных органов в случаях, предусмотренных
          законодательством РФ.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">7. Срок хранения</h3>
        <p>
          Персональные данные хранятся до момента удаления учётной записи Пользователем либо до
          отзыва согласия на обработку персональных данных.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">8. Права субъекта персональных данных</h3>
        <p>В соответствии с ФЗ-152 Пользователь вправе:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>получить сведения об обрабатываемых данных;</li>
          <li>потребовать исправления неточных данных;</li>
          <li>потребовать удаления своих данных;</li>
          <li>отозвать согласие на обработку персональных данных.</li>
        </ul>
        <p className="mt-2">
          Для реализации прав направьте запрос на{' '}
          <a href="mailto:ivansemashin@mail.ru" className="text-emerald-600 hover:underline">
            ivansemashin@mail.ru
          </a>
          . Оператор обязуется рассмотреть обращение в срок, не превышающий 30 дней.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">9. Безопасность данных</h3>
        <p>
          Оператор принимает необходимые организационные и технические меры для защиты персональных
          данных от несанкционированного доступа, изменения, раскрытия или уничтожения, включая
          хеширование паролей и шифрование соединений.
        </p>
      </section>

      <section>
        <h3 className="font-bold text-gray-800 mb-1">10. Изменение политики</h3>
        <p>
          Оператор вправе вносить изменения в настоящую Политику. Актуальная версия публикуется на
          сайте. При существенных изменениях Пользователи будут уведомлены.
        </p>
      </section>
    </div>
  );
}

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // sync tab when modal opens with a specific tab
  if (isOpen && activeTab !== initialTab && initialTab) {
    // only on first open — handled via key prop in parent
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="legal-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            key="legal-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div className="flex gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-emerald-500/20"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
