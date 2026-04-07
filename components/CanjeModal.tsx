"use client";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "./Button";
import NumericInput from "./NumericInput";
import type { CanjeData } from "@/contexts/CartContext";

type UsedPhonePrice = {
  _id: string;
  modelName: string;
  storage: string;
  basePrice: number;
  changedPartsPrice: number;
  active: boolean;
};

type Props = {
  readonly productId: string;
  readonly productTitle: string;
  readonly productPrice: number;
  readonly onClose: () => void;
};

function QuestionRow({
  title,
  value,
  onChange,
  light,
}: {
  readonly title: string;
  readonly value: boolean | null;
  readonly onChange: (v: boolean) => void;
  readonly light: boolean;
}) {
  const active = light ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-blue-500/30 border-blue-400/40";
  const inactive = light ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200" : "bg-white/5 border-white/10 hover:bg-white/10";
  return (
    <div>
      <p className={`text-sm font-medium mb-2 ${light ? "text-gray-700" : "text-white/70"}`}>{title}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => onChange(true)} className={`btn text-sm ${value === true ? active : inactive}`}>Sí</button>
        <button type="button" onClick={() => onChange(false)} className={`btn text-sm ${value === false ? active : inactive}`}>No</button>
      </div>
    </div>
  );
}

export default function CanjeModal({ productId, productTitle, productPrice, onClose }: Props) {
  const { applyCanje } = useCart();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [rows, setRows] = useState<UsedPhonePrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedModel, setSelectedModel] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [batteryPercent, setBatteryPercent] = useState("");
  const [hasAestheticDetail, setHasAestheticDetail] = useState<boolean | null>(null);
  const [hasChangedParts, setHasChangedParts] = useState<boolean | null>(null);
  const [worksPerfectly, setWorksPerfectly] = useState<boolean | null>(null);

  const light = theme === "light";

  useEffect(() => {
    fetch("/api/used-phone-prices")
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Solo mostrar modelos cuyo precio base sea menor al precio del producto
  const affordableRows = useMemo(
    () => rows.filter((r) => r.basePrice < productPrice),
    [rows, productPrice],
  );

  const modelOptions = useMemo(
    () => Array.from(new Set(affordableRows.map((r) => r.modelName))).sort((a, b) => a.localeCompare(b)),
    [affordableRows],
  );

  const storageOptions = useMemo(
    () => affordableRows.filter((r) => r.modelName === selectedModel).map((r) => r.storage).sort((a, b) => a.localeCompare(b)),
    [affordableRows, selectedModel],
  );

  const selectedRow = useMemo(
    () => affordableRows.find((r) => r.modelName === selectedModel && r.storage === selectedStorage) || null,
    [affordableRows, selectedModel, selectedStorage],
  );

  const batteryValue = Number(batteryPercent);
  const hasValidBattery = batteryPercent !== "" && batteryValue >= 0 && batteryValue <= 100;

  const isFormComplete =
    Boolean(selectedRow) && hasValidBattery &&
    hasAestheticDetail !== null && hasChangedParts !== null && worksPerfectly !== null;

  let tradeInValue: number | null = null;
  if (selectedRow && hasChangedParts !== null && isFormComplete && worksPerfectly === true) {
    tradeInValue = hasChangedParts ? selectedRow.changedPartsPrice : selectedRow.basePrice;
  }

  const finalPrice = tradeInValue !== null ? Math.max(0, productPrice - tradeInValue) : null;

  const handleApply = () => {
    if (tradeInValue === null) return;
    const canje: CanjeData = {
      model: selectedModel,
      storage: selectedStorage,
      battery: batteryPercent,
      aestheticDetail: hasAestheticDetail!,
      changedParts: hasChangedParts!,
      worksPerfectly: worksPerfectly!,
      discount: tradeInValue,
    };
    applyCanje(productId, canje);
    showToast("Plan canje aplicado", "success");
    onClose();
  };

  const resetField = () => {
    setSelectedStorage("");
    setBatteryPercent("");
    setHasAestheticDetail(null);
    setHasChangedParts(null);
    setWorksPerfectly(null);
  };

  // Theme classes
  const modalBg = light ? "bg-white" : "bg-gray-950";
  const headerBg = light ? "bg-white" : "bg-gray-950";
  const footerBg = light ? "bg-white" : "bg-gray-950";
  const borderCls = light ? "border-gray-200" : "border-white/10";
  const textCls = light ? "text-gray-900" : "text-white";
  const mutedCls = light ? "text-gray-500" : "text-white/50";
  const labelCls = light ? "text-gray-700" : "text-white/70";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 ${light ? "bg-black/40" : "bg-black/70"} backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`${modalBg} border ${borderCls} rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto pointer-events-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con producto destacado */}
          <div className={`sticky top-0 ${headerBg} border-b ${borderCls} px-6 py-4 z-10`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium uppercase tracking-wider ${mutedCls}`}>
                  Plan canje para
                </p>
                <h2 className={`text-lg font-bold mt-0.5 ${textCls}`}>{productTitle}</h2>
                <p className={`text-sm font-semibold mt-0.5 ${light ? "text-blue-600" : "text-blue-400"}`}>
                  USD ${formatPrice(productPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`${mutedCls} hover:${textCls} transition-colors p-1 shrink-0`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto" />
                <p className={`mt-3 text-sm ${mutedCls}`}>Cargando modelos...</p>
              </div>
            ) : rows.length === 0 ? (
              <p className={`text-center py-8 ${mutedCls}`}>No hay modelos cargados todavía.</p>
            ) : (
              <>
                {/* Paso 1: Modelo */}
                <div>
                  <label htmlFor="canje-model" className={`text-sm font-medium mb-1 block ${labelCls}`}>
                    ¿Qué iPhone tenés?
                  </label>
                  <select
                    id="canje-model"
                    className="input"
                    value={selectedModel}
                    onChange={(e) => { setSelectedModel(e.target.value); resetField(); }}
                  >
                    <option value="">Seleccioná un modelo</option>
                    {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Paso 2: Storage */}
                {selectedModel && (
                  <div>
                    <label htmlFor="canje-storage" className={`text-sm font-medium mb-1 block ${labelCls}`}>
                      ¿Qué memoria tiene?
                    </label>
                    <select
                      id="canje-storage"
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
                      {storageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Paso 3: Detalles */}
                {selectedStorage && (
                  <>
                    <div>
                      <label htmlFor="canje-battery" className={`text-sm font-medium mb-1 block ${labelCls}`}>
                        Porcentaje de batería
                      </label>
                      <NumericInput
                        id="canje-battery"
                        className="input"
                        value={batteryPercent}
                        onChange={(e) => setBatteryPercent(e.target.value)}
                        placeholder="Ej: 87"
                      />
                    </div>

                    <QuestionRow light={light} title="¿Tiene detalle estético?" value={hasAestheticDetail} onChange={setHasAestheticDetail} />
                    <QuestionRow light={light} title="¿Tiene piezas cambiadas?" value={hasChangedParts} onChange={setHasChangedParts} />
                    <QuestionRow light={light} title="¿Funciona perfectamente?" value={worksPerfectly} onChange={setWorksPerfectly} />

                    {isFormComplete && worksPerfectly === false && (
                      <div className={`rounded-xl border p-4 ${
                        light ? "border-yellow-300 bg-yellow-50" : "border-yellow-400/30 bg-yellow-500/10"
                      }`}>
                        <p className={`text-sm font-medium ${light ? "text-yellow-700" : "text-yellow-300"}`}>
                          Para teléfonos con fallas, comunicate por WhatsApp para una cotización personalizada.
                        </p>
                      </div>
                    )}

                    {/* Resultado */}
                    {finalPrice !== null && (
                      <div className={`rounded-xl border p-5 space-y-3 ${
                        light ? "border-green-300 bg-green-50" : "border-green-400/30 bg-green-500/10"
                      }`}>
                        <p className={`text-sm ${light ? "text-green-700" : "text-green-300"}`}>
                          Con plan canje, tu {productTitle} te queda en:
                        </p>
                        <p className={`text-3xl font-bold ${light ? "text-green-600" : "text-green-400"}`}>
                          USD ${formatPrice(finalPrice)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {finalPrice !== null && (
            <div className={`sticky bottom-0 ${footerBg} border-t ${borderCls} px-6 py-4`}>
              <Button onClick={handleApply} fullWidth className="inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aplicar plan canje
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
