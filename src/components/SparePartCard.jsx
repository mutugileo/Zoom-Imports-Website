import React from "react";
import { Img } from "./Img";
import { clickableCard } from "../lib/clickable";
import { pathFor } from "../lib/router";
import { useAddedFlash } from "../lib/useAddedFlash";
import { stockLabel, stockClass } from "@shared/lib/format";
import { Plus, Check } from "lucide-react";

/**
 * Spare part card — same family as VehicleCard, inverted.
 *
 * The vehicle card anchors a portrait ring panel to the top right. This one
 * runs a full-width ringed plate along the bottom, like the spec plate riveted
 * to a component. Same photo-fills-the-card treatment, clearly its own object.
 *
 * Plate fill and scrim are measured against every part photo, worst pixel,
 * WCAG AA — see the .pcard-* block in index.css.
 */
export const SparePartCard = ({
  part,
  parts = [],
  formatKES,
  onOpen,
  onAdd,
  fitment,
  style,
  height = 320,
}) => {
  const out = part.stock === 0;
  const price = part.promo || part.price;
  const savings = part.promo ? part.price - part.promo : 0;
  const [added, confirm] = useAddedFlash();

  // Compatibility badge system determination
  const fitmentType = fitment
    ? 'exact'
    : part.compat?.toLowerCase().includes('universal')
    ? 'universal'
    : 'check';

  return (
    <a
      className="pcard hover-card"
      {...clickableCard(
        onOpen,
        `${part.name} by ${part.brand}, ${formatKES(price)}`,
        pathFor('part-detail', { id: part.id, parts }),
      )}
      style={{ minHeight: `${height}px`, ...style }}
    >
      <div className="zoom-frame pcard-photo">
        <Img
          src={part.img}
          alt={part.name}
          sizes="(max-width: 900px) 100vw, 32vw"
        />
      </div>
      <div className="pcard-scrim" aria-hidden="true" />

      {/* Stock & Fitment Badges at top left */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 10 }}>
        <span className={`badge badge-${stockClass(part.stock)} pcard-stock`}>
          {stockLabel(part.stock)}
        </span>
        {fitmentType === 'exact' && (
          <span className="badge-fitment badge-exact-fit">
            <Check size={11} /> Exact Fit
          </span>
        )}
        {fitmentType === 'universal' && (
          <span className="badge-fitment badge-universal">
            Universal
          </span>
        )}
        {fitmentType === 'check' && (
          <span className="badge-fitment badge-check-fit">
            Check Fitment
          </span>
        )}
      </div>

      {part.promo && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', zIndex: 10 }}>
          <span className="badge badge-sale pcard-sale">Sale</span>
          {savings > 0 && (
            <span className="mono" style={{ fontSize: '10px', padding: '3px 7px', borderRadius: '4px', background: 'var(--accent)', color: '#fff', fontWeight: 700 }}>
              Save {formatKES(savings)}
            </span>
          )}
        </div>
      )}

      {/* Spec plate */}
      <div className="pcard-plate">
        <div className="pcard-collapse">
          <div className="pcard-collapse-inner">
            <div className="mono pcard-origin">
              {part.brand}
              <span className="pcard-sep">·</span>
              {part.sku}
              <span className="pcard-sep">·</span>
              {part.partNumber ? `OEM ${part.partNumber}` : 'OEM no. on request'}
            </div>
          </div>
        </div>

        <h3 className="pcard-name">{part.name}</h3>

        <div className="pcard-collapse">
          <div className="pcard-collapse-inner">
            <div className="pcard-fit">
              <Check size={11} strokeWidth={2.5} className="pcard-fit-icon" />
              {fitment ? (
                <span>
                  {fitment.make} {fitment.model}{" "}
                  <span className="pcard-years">{fitment.years}</span>
                </span>
              ) : (
                <span>
                  Fits {part.compat}{" "}
                  <span className="pcard-years">— confirm your chassis</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pcard-buy">
          <span className="pcard-price">
            {formatKES(price)}
            {part.promo && (
              <span
                className="mono pcard-was"
                aria-label={`was ${formatKES(part.price)}`}
              >
                {formatKES(part.price)}
              </span>
            )}
          </span>

          <button
            type="button"
            className={`pcard-add${added ? ' is-added' : ''}`}
            disabled={out}
            aria-label={
              out ? `${part.name} is out of stock` : `Add ${part.name} to cart`
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
              confirm();
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {out ? (
              "Out of stock"
            ) : added ? (
              <>
                Added! <Check size={14} strokeWidth={3} />
              </>
            ) : (
              <>
                Add <Plus size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </a>
  );
};


