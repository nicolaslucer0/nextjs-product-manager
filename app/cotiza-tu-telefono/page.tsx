"use client";

import { formatPrice } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/components/Button";

type UsedPhonePrice = {
  _id: string;
  modelName: string;
  storage: string;
  basePrice: number;
  changedPartsPrice: number;
  active: boolean;
};

type CanjeProduct = {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  planCanje?: boolean;
};

export default function CotizaTuTelefonoPage() {
  const [rows, setRows] = useState<UsedPhonePrice[]>([]);
  const [canjeProducts, setCanjeProducts] = useState<CanjeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const [productSearch, setProductSearch] = useState("");
  const [selectedCanjeProductId, setSelectedCanjeProductId] = useState("");

  const [selectedModel, setSelectedModel] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");

  const [batteryPercent, setBatteryPercent] = useState("");
  const [hasAestheticDetail, setHasAestheticDetail] = useState<boolean | null>(
    null,
  );
  const [hasChangedParts, setHasChangedParts] = useState<boolean | null>(null);
  const [worksPerfectly, setWorksPerfectly] = useState<boolean | null>(null);

  const selectedTargetProductId = (searchParams.get("productoId") || "").trim();
  const selectedTargetProduct = (searchParams.get("producto") || "").trim();
  const initialModelHint = (searchParams.get("modelo") || "").trim();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pricesResponse, productsResponse] = await Promise.all([
          fetch("/api/used-phone-prices"),
          fetch("/api/products?planCanje=true&limit=200&sortBy=name-asc"),
        ]);

        const pricesData = await pricesResponse.json().catch(() => []);
        const productsData = await productsResponse
          .json()
          .catch(() => ({ products: [] }));

        setRows(Array.isArray(pricesData) ? pricesData : []);
        setCanjeProducts(
          Array.isArray(productsData?.products) ? productsData.products : [],
        );
      } catch (error) {
        console.error("Error loading used phone prices:", error);
        setRows([]);
        setCanjeProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCanjeProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) {
      return canjeProducts;
    }

    return canjeProducts.filter((product) => {
      const title = product.title.toLowerCase();
      const description = (product.description || "").toLowerCase();
      return title.includes(term) || description.includes(term);
    });
  }, [canjeProducts, productSearch]);

  const selectedCanjeProduct = useMemo(
    () =>
      canjeProducts.find((product) => product._id === selectedCanjeProductId) ||
      null,
    [canjeProducts, selectedCanjeProductId],
  );

  useEffect(() => {
    if (selectedCanjeProductId || canjeProducts.length === 0) {
      return;
    }

    if (selectedTargetProductId) {
      const byId = canjeProducts.find(
        (product) => product._id === selectedTargetProductId,
      );
      if (byId) {
        setSelectedCanjeProductId(byId._id);
        return;
      }
    }

    if (selectedTargetProduct) {
      const normalizedTarget = selectedTargetProduct.toLowerCase();
      const byTitle = canjeProducts.find(
        (product) => product.title.toLowerCase() === normalizedTarget,
      );
      if (byTitle) {
        setSelectedCanjeProductId(byTitle._id);
      }
    }
  }, [
    selectedCanjeProductId,
    canjeProducts,
    selectedTargetProductId,
    selectedTargetProduct,
  ]);

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

  useEffect(() => {
    if (!initialModelHint || selectedModel || modelOptions.length === 0) {
      return;
    }

    const normalizedHint = initialModelHint.toLowerCase();
    const exactMatch = modelOptions.find(
      (option) => option.toLowerCase() === normalizedHint,
    );

    if (exactMatch) {
      setSelectedModel(exactMatch);
      return;
    }

    const fuzzyMatch = modelOptions.find((option) => {
      const normalizedOption = option.toLowerCase();
      return (
        normalizedHint.includes(normalizedOption) ||
        normalizedOption.includes(normalizedHint)
      );
    });

    if (fuzzyMatch) {
      setSelectedModel(fuzzyMatch);
    }
  }, [initialModelHint, modelOptions, selectedModel]);

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
    pageContent = <p className="text-white/60">Cargando opciones...</p>;
  } else if (canjeProducts.length === 0) {
    pageContent = (
      <p className="text-white/60">
        No hay productos con plan canje activo por ahora.
      </p>
    );
  } else if (rows.length === 0) {
    pageContent = (
      <p className="text-white/60">
        No hay modelos cargados todavía. Volvé más tarde.
      </p>
    );
  } else {
    pageContent = (
      <>
        <div className="space-y-3">
          <label htmlFor="trade-product-search" className="label">
            1) Seleccioná un producto a canjear
          </label>
          <input
            id="trade-product-search"
            className="input"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Buscar producto..."
          />

          {filteredCanjeProducts.length === 0 ? (
            <p className="text-sm text-white/60">
              No hay resultados para tu búsqueda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[28rem] overflow-y-auto pr-1">
              {filteredCanjeProducts.map((product) => {
                const isSelected = product._id === selectedCanjeProductId;
                const image = product.images?.[0] || "";

                return (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => setSelectedCanjeProductId(product._id)}
                    className={`text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-white/40">
                            Sin foto
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{product.title}</p>
                        {product.description ? (
                          <p className="text-xs text-white/60 line-clamp-2">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedCanjeProduct && (
          <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-300">Producto a canjear</p>
            <p className="font-semibold text-blue-200">
              {selectedCanjeProduct.title}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="quote-model" className="label">
            2) ¿Qué iPhone tenés?
          </label>
          <select
            id="quote-model"
            className="input"
            value={selectedModel}
            disabled={!selectedCanjeProductId}
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
              3) ¿Qué memoria tiene?
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
                4) Porcentaje de batería
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
              title="5) ¿Tiene detalle estético?"
              value={hasAestheticDetail}
              onChange={setHasAestheticDetail}
            />

            <QuestionRow
              title="6) ¿Tiene piezas cambiadas?"
              value={hasChangedParts}
              onChange={setHasChangedParts}
            />

            <QuestionRow
              title="7) ¿Funciona perfectamente?"
              value={worksPerfectly}
              onChange={setWorksPerfectly}
            />

            {estimatedPrice !== null && (
              <>
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

                {selectedCanjeProduct && (
                  <ButtonLink
                    href={`/products/${selectedCanjeProductId}?canjeModelo=${encodeURIComponent(selectedModel)}&canjeAlmacenamiento=${encodeURIComponent(selectedStorage)}&canjeBateria=${batteryPercent}&canjeEstetica=${hasAestheticDetail}&canjePiezas=${hasChangedParts}&canjeFunciona=${worksPerfectly}&canjePrecio=${estimatedPrice}`}
                    fullWidth
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    Continuar con la compra
                  </ButtonLink>
                )}
              </>
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
