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
  const [added, confirm] = useAddedFlash();

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

      <span className={`badge badge-${stockClass(part.stock)} pcard-stock`}>
        {stockLabel(part.stock)}
      </span>
      {part.promo && <span className="badge badge-sale pcard-sale">Sale</span>}

      {/* Spec plate. The data rows collapse on hover so the photo can be seen;
          the name and buy row stay, because a collapsed card you cannot
          identify or add from is worse than one you cannot fully see. */}
      <div className="pcard-plate">
        <div className="pcard-collapse">
          <div className="pcard-collapse-inner">
            <div className="mono pcard-origin">
              {part.brand}
              <span className="pcard-sep">·</span>
              {part.sku}
              {/* Says "on request" rather than hiding the row. A buyer matching
                  a part looks for this line; silence reads as "not genuine",
                  and inventing a number would fail at the counter instead of
                  on the website. */}
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
              // Strikethrough reads as "was" visually but means nothing aloud.
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
              /* The card is a real <a href>. stopPropagation alone only stops
                 React's handler — the native click still reaches the anchor and
                 the browser follows the link, which is why adding used to throw
                 you onto the part page. preventDefault is the half that stops
                 the navigation; clickableCard checks defaultPrevented and bows
                 out on its own. */
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
                Added <Check size={14} strokeWidth={3} />
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
