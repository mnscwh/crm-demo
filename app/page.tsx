export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-indigo-800">
        Вітаємо в Law Firm AI CRM
      </h1>
      <p className="text-gray-600 max-w-2xl">
        Система для юридичних фірм із підтримкою AI-аналітики документів та справ.
        Перейдіть до клієнтів, справ або документів для початку роботи.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition-all">
          <h3 className="font-semibold text-indigo-700">Клієнти</h3>
          <p className="text-sm text-gray-600">
            Перегляньте активних клієнтів та AI-оцінку ризиків.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition-all">
          <h3 className="font-semibold text-indigo-700">Справи</h3>
          <p className="text-sm text-gray-600">
            Аналіз справ, ймовірність успіху та AI-рекомендації.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition-all">
          <h3 className="font-semibold text-indigo-700">Документи</h3>
          <p className="text-sm text-gray-600">
            Завантажуйте та аналізуйте договори, акти й рахунки.
          </p>
        </div>
      </div>
    </div>
  );
}