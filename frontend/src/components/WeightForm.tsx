import { useState } from "react";
import api from "../api/client";

interface Props {
  onAdded: () => void;
}

export default function WeightForm({ onAdded }: Props) {
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = parseFloat(weight);
    if (!value || value <= 0 || value > 500) {
      setError("Введите корректный вес (0.1 — 500 кг)");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/users/me/weight", { weight: value });
      setWeight("");
      onAdded();
    } catch {
      setError("Не удалось сохранить вес");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="weight-form">
      <h3>Добавить вес</h3>
      <div className="form-row">
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="500"
          placeholder="Вес (кг)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "..." : "Сохранить"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
