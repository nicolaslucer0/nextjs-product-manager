"use client";

import { formatPrice } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type UsedPhonePrice = {
  _id: string;
  modelName: string;
  storage: string;
  basePrice: number;
  changedPartsPrice: number;
  active: boolean;
};

export default function CotizaTuTelefonoPage() {
  const [rows, setRows] = useState<UsedPhonePrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedModel, setSelectedModel] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");

  const [batteryPercent, setBatteryPercent] = useState("");
  const [hasAestheticDetail, setHasAestheticDetail] = useState<boolean | null>(
    null,
  );
  const [hasChangedParts, setHasChangedParts] = useState<boolean | null>(null);
  const [worksPerfectly, setWorksPerfectly] = useState<boolean | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/used-phone-prices");
        const data = await response.json().catch(() => []);
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading used phone prices:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const modelOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.modelName))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows],
  );

  const storageOptions = useMemo(
    () =>
      rows
        .filter((row) => row.modelName === selectedModel)
        .map((row) => row.storage)
        .sort((a, b) => a.localeCompare(b)),
    [rows, selectedModel],
  );

  const selectedRow = useMemo(
    () =>
      rows.find(
        (row) =>
          row.modelName === selectedModel && row.storage === selectedStorage,
      ) || null,
    [rows, selectedModel, selectedStorage],
  );

  const batteryValue = Number(batteryPercent);
  const hasValidBattery =
    batteryPercent !== "" && batteryValue >= 0 && batteryValue <= 100;

  const isFormComplete =
    Boolean(selectedRow) &&
    hasValidBattery &&
    hasAestheticDetail !== null &&
    hasChangedParts !== null &&
    worksPerfectly !== null;

  let estimatedPrice: number | null = null;
  if (
    selectedRow &&
    hasChangedParts !== null &&
    isFormComplete &&
    worksPerfectly === true
  ) {
    estimatedPrice = hasChangedParts
      ? selectedRow.changedPartsPrice
      : selectedRow.basePrice;
  }

  let pageContent: React.ReactNode = null;

  if (loading) {
    pageContent = <p className="text-white/60">Cargando modelos...</p>;
  } else if (rows.length === 0) {
    pageContent = (
      <p className="text-white/60">
        No hay modelos cargados todavía. Volvé más tarde.
      </p>
    );
  } else {
    pageContent = (
      <>
        <div>
          <label htmlFor="quote-model" className="label">
            1) ¿Qué iPhone tenés?
          </label>
          <select
            id="quote-model"
            className="input"
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setSelectedStorage("");
              setBatteryPercent("");
              setHasAestheticDetail(null);
              setHasChangedParts(null);
              setWorksPerfectly(null);
            }}
          >
            <option value="">Seleccioná un modelo</option>
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {selectedModel && (
          <div>
            <label htmlFor="quote-storage" className="label">
              2) ¿Qué memoria tiene?
            </label>
            <select
              id="quote-storage"
              className="input"
              value={selectedStorage}
              onChange={(e) => {
                setSelectedStorage(e.target.value);
                setBatteryPercent("");
                setHasAestheticDetail(null);
                setHasChangedParts(null);
                setWorksPerfectly(null);
              }}
            >
              <option value="">Seleccioná memoria</option>
              {storageOptions.map((storage) => (
                <option key={storage} value={storage}>
                  {storage}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedStorage && (
          <>
            <div>
              <label htmlFor="quote-battery" className="label">
                3) Porcentaje de batería
              </label>
              <input
                id="quote-battery"
                type="number"
                min="0"
                max="100"
                className="input"
                value={batteryPercent}
                onChange={(e) => setBatteryPercent(e.target.value)}
                placeholder="Ej: 87"
              />
            </div>

            <QuestionRow
              title="4) ¿Tiene detalle estético?"
              value={hasAestheticDetail}
              onChange={setHasAestheticDetail}
            />

            <QuestionRow
              title="5) ¿Tiene piezas cambiadas?"
              value={hasChangedParts}
              onChange={setHasChangedParts}
            />

            <QuestionRow
              title="6) ¿Funciona perfectamente?"
              value={worksPerfectly}
              onChange={setWorksPerfectly}
            />

            {estimatedPrice !== null && (
              <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4 space-y-2">
                <p className="text-sm text-green-300">Precio estimado</p>
                <p className="text-3xl font-bold text-green-400">
                  ${formatPrice(estimatedPrice)}
                </p>
                <p className="text-xs text-white/60">
                  Para esta tabla solo se considera si tiene piezas cambiadas.
                  Batería, estética y funcionamiento quedan como datos de
                  referencia.
                </p>
              </div>
            )}

            {isFormComplete && worksPerfectly === false && (
              <div className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-300 font-medium">
                  Para brindar más detalles del teléfono, comunicate por
                  WhatsApp.
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen py-12 container">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Cotizá tu teléfono</h1>
          <p className="text-white/60">
            Elegí tu iPhone y completá los datos para ver el precio de toma.
          </p>
        </div>

        <div className="card space-y-6">{pageContent}</div>
      </div>
    </div>
  );
}

type QuestionRowProps = {
  readonly title: string;
  readonly value: boolean | null;
  readonly onChange: (value: boolean) => void;
};

function QuestionRow({ title, value, onChange }: QuestionRowProps) {
  return (
    <div>
      <p className="label">{title}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`btn ${
            value === true
              ? "bg-blue-500/30 border-blue-400/40"
              : "bg-white/5 border-white/10"
          }`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`btn ${
            value === false
              ? "bg-blue-500/30 border-blue-400/40"
              : "bg-white/5 border-white/10"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
