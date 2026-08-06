import React from "react";
import { useApp } from "../context/AppContext";
import { Img } from "./Img";
import { clickableCard } from "../lib/clickable";
import { pathFor } from "../lib/router";
import { useAddedFlash } from "../lib/useAddedFlash";
import { stockLabel, stockClass } from "@shared/lib/format";
import { modelOf } from "@shared/data/mazdaModels";
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
  const { returningPartId } = useApp();
  const isSelectedTarget = String(returningPartId) === String(part.id);
  const out = part.stock === 0;
  const price = part.promo || part.price;
  const savings = part.promo ? part.price - part.promo : 0;
  const [added, confirm] = useAddedFlash();

  /**
   * Which fitment badge this part carries.
   *
   * A confirmed fit is EITHER a compatibility rule or the part's own `compat`
   * field naming a real model — the same test partsForVehicle applies, where
   * `namedByRule || namedByField` both rank 0.
   *
   * Reading only the rule made this card disagree with every other surface:
   * with the rules table empty, a part whose compat field says "CX-5" was
   * listed under "Spares we stock for the CX-5" on the vehicle page and read
   * "Fits CX-5" on its own detail page, while its card said "Check Fitment" —
   * three answers to one question, and the card's was the wrong one.
   */
  const namedModel = modelOf(part.compat);
  const fitmentType = fitment || namedModel
    ? 'exact'
    : part.compat?.toLowerCase().includes('universal')
    ? 'universal'
    : 'check';

  return (
    <a
      data-part-id={part.id}
      className={`pcard hover-card ${isSelectedTarget ? 'part-selected-target' : ''}`}
      {...clickableCard(
        onOpen,
        `${part.name} by ${part.brand}, ${formatKES(price)}`,
        pathFor('part-detail', { id: part.id, parts }),
      )}
      style={{
        minHeight: `${height}px`,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: '0 12px 30px -12px rgba(13,25,38,0.15)',
        ...style
      }}
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
        <span className={`badge badge-${stockClass(part.stock)} pcard-stock`} style={{ borderRadius: '9999px' }}>
          {stockLabel(part.stock)}
        </span>
        {fitmentType === 'exact' && (
          <span className="badge-fitment badge-exact-fit" style={{ borderRadius: '9999px' }}>
            <Check size={11} /> Exact Fit
          </span>
        )}
        {fitmentType === 'universal' && (
          <span className="badge-fitment badge-universal" style={{ borderRadius: '9999px' }}>
            Universal
          </span>
        )}
        {fitmentType === 'check' && (
          <span className="badge-fitment badge-check-fit" style={{ borderRadius: '9999px' }}>
            Check Fitment
          </span>
        )}
      </div>

      {part.promo && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', zIndex: 10 }}>
          <span className="badge badge-sale pcard-sale" style={{ borderRadius: '9999px' }}>Sale</span>
          {savings > 0 && (
            <span className="mono" style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '9999px', background: 'var(--accent)', color: '#fff', fontWeight: 700 }}>
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

        <h3 className="pcard-name" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>{part.name}</h3>

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
          <span className="pcard-price" style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
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
            style={{ borderRadius: '9999px', padding: '7px 16px', fontWeight: 700 }}
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


