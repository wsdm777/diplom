import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    gender: "male" as "male" | "female",
    height: "",
    birth_date: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        gender: form.gender,
        height: parseFloat(form.height),
        birth_date: form.birth_date,
      });
      navigate("/login");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 409
      ) {
        setError("Пользователь с таким email уже существует");
      } else {
        setError("Ошибка регистрации. Проверьте данные.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Регистрация</h2>
        <input
          type="text"
          placeholder="Имя"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          minLength={1}
          maxLength={100}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль (мин. 6 символов)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          minLength={6}
        />
        <select
          value={form.gender}
          onChange={(e) => update("gender", e.target.value)}
        >
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
        </select>
        <input
          type="number"
          placeholder="Рост (см)"
          value={form.height}
          onChange={(e) => update("height", e.target.value)}
          required
          min={1}
          max={300}
          step="0.1"
        />
        <label className="date-label">
          Дата рождения
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => update("birth_date", e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
        <p className="link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
