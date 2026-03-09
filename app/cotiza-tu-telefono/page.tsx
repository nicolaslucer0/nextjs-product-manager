"use client";

import { formatPrice } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";

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
  price: number;
};

export default function CotizaTuTelefonoPage() {
  const [rows, setRows] = useState<UsedPhonePrice[]>([]);
  const [canjeProducts, setCanjeProducts] = useState<CanjeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
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

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsapp) {
          setWhatsappNumber(data.whatsapp);
        }
      })
      .catch(() => {});
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

  const generateWhatsAppMessage = () => {
    if (!selectedCanjeProduct) return "";

    let message = `¡Hola! Quiero canjear mi teléfono y comprar:\n\n`;
    message += `🎯 *${selectedCanjeProduct.title}*\n\n`;
    message += `📱 *Mi teléfono:*\n`;
    message += `• Modelo: ${selectedModel}\n`;
    message += `• Almacenamiento: ${selectedStorage}\n`;
    message += `• Batería: ${batteryPercent}%\n`;
    message += `• Detalle estético: ${hasAestheticDetail ? "Sí" : "No"}\n`;
    message += `• Piezas cambiadas: ${hasChangedParts ? "Sí" : "No"}\n`;
    message += `• Funciona perfectamente: ${worksPerfectly ? "Sí" : "No"}\n`;

    if (estimatedPrice !== null) {
      message += `\n💰 *Precio estimado de toma:* $${formatPrice(estimatedPrice)}`;
    }

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) {
      alert("No se pudo cargar el número de WhatsApp. Intenta de nuevo.");
      return;
    }

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, "_blank");
  };

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
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{product.title}</p>
                        {product.description ? (
                          <p className="text-xs text-white/60 line-clamp-2">
                            {product.description}
                          </p>
                        ) : null}
                        <p className="text-sm font-semibold text-blue-400 mt-1">
                          ${formatPrice(product.price)}
                        </p>
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
                  <Button
                    onClick={handleWhatsAppClick}
                    fullWidth
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    ¡Lo quiero!
                  </Button>
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
