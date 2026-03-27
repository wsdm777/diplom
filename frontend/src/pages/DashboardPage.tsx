import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import WeightForm from "../components/WeightForm";
import WeightChart from "../components/WeightChart";
import api from "../api/client";
import type { WeightEntry } from "../types";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<WeightEntry[]>([]);

  const loadWeight = useCallback(() => {
    if (!user) return;
    api
      .get<WeightEntry[]>(`/users/${user.id}/weight`)
      .then((res) => setEntries(res.data));
  }, [user]);

  useEffect(() => {
    loadWeight();
  }, [loadWeight]);

  if (!user) return null;

  const age = Math.floor(
    (Date.now() - new Date(user.birth_date).getTime()) / 31557600000
  );

  const lastWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Diet Planner</h1>
        <div className="user-info">
          <span>{user.name}</span>
          <button onClick={logout} className="btn-logout">
            Выйти
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="profile-card">
          <h3>Профиль</h3>
          <ul>
            <li>
              <strong>Имя:</strong> {user.name}
            </li>
            <li>
              <strong>Пол:</strong>{" "}
              {user.gender === "male" ? "Мужской" : "Женский"}
            </li>
            <li>
              <strong>Рост:</strong> {user.height} см
            </li>
            <li>
              <strong>Возраст:</strong> {age} лет
            </li>
            {lastWeight && (
              <li>
                <strong>Текущий вес:</strong> {lastWeight} кг
              </li>
            )}
          </ul>
        </section>

        <section className="weight-section">
          <WeightForm onAdded={loadWeight} />
          <WeightChart entries={entries} />
        </section>
      </main>
    </div>
  );
}
