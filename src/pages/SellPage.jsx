import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ImagePicker } from '../components/ImagePicker';
import { MAZDA_MODEL_GROUPS, labelForModel } from '@shared/data/mazdaModels';
import {
  ArrowLeft, CheckCircle2, MessageSquare, ShieldCheck, Camera, Banknote, Clock,
} from 'lucide-react';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => THIS_YEAR - i);

const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

/**
 * "List your car with us" — a real page, not a modal.
 *
 * A modal was the other option and it is the wrong one here: this is a
 * fourteen-field form that people fill in on a phone, and a dialog that traps
 * focus, cannot be linked to, cannot be returned to after a mis-tap and has to
 * scroll inside itself makes all of that worse. A page gets an address the
 * dealership can put on a poster, and the browser's own back button.
 *
 * `mode` is set by which route you arrived on, so the same form serves the
 * button on the lot and the button on the parts shelf.
 */
export const SellPage = ({ mode = 'car' }) => {
  const { navigateTo, submitVehicleListing, submitPartListing, settings, waNumber } = useApp();
  const isCar = mode === 'car';

  /* Closed from the admin. Hiding the link is not enough — the address is
     shareable, so the page has to turn people away itself. */
  const sellerListingsOpen = settings?.seller_listings !== false;

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    model: '', year: '', mileage: '', trans: '', fuel: '', colour: '',
    regNumber: '', price: '', notes: '',
    partName: '', partBrand: '', partQty: '',
  });
  const [photos, setPhotos] = useState([]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    // Clear the complaint as soon as they act on it.
    setError((err) => (err?.key === key ? null : err));
  };

  /**
   * Every field is required.
   *
   * A half-filled offer costs the yard a phone call to complete, and the call
   * happens anyway — so it is cheaper to ask once, here, than to chase it. The
   * order below is the order the fields appear, so the message always points
   * at the first gap going down the page rather than an arbitrary one.
   */
  const REQUIRED = isCar
    ? [
        ['name', 'your name'],
        ['phone', 'a phone number we can reach you on'],
        ['email', 'your email address'],
        ['model', 'which Mazda model it is'],
        ['year', 'the year'],
        ['mileage', 'the odometer reading'],
        ['trans', 'the transmission'],
        ['fuel', 'the fuel type'],
        ['colour', 'the colour'],
        ['regNumber', 'the registration number'],
        ['price', 'your asking price'],
        ['notes', 'a note on the condition'],
      ]
    : [
        ['name', 'your name'],
        ['phone', 'a phone number we can reach you on'],
        ['email', 'your email address'],
        ['partName', 'what the part is'],
        ['partBrand', 'the brand'],
        ['partQty', 'how many you hold'],
        ['model', 'which Mazda model it fits'],
        ['price', 'your asking price'],
        ['notes', 'a note on the parts'],
      ];

  const missing = () => REQUIRED.find(([key]) => !String(form[key] ?? '').trim()) ?? null;

  const summary = isCar
    ? [
        `Mazda ${labelForModel(form.model)}`,
        form.year && `${form.year}`,
        form.mileage && `${Number(form.mileage).toLocaleString()} km`,
        form.trans, form.fuel, form.colour,
        form.regNumber && `reg ${form.regNumber}`,
        form.price && `asking KES ${Number(form.price).toLocaleString()}`,
      ].filter(Boolean).join(' · ')
    : [
        form.partName,
        form.partBrand && `brand ${form.partBrand}`,
        form.partQty && `${form.partQty} unit(s)`,
        form.model && `fits ${labelForModel(form.model)}`,
        form.price && `asking KES ${Number(form.price).toLocaleString()}`,
      ].filter(Boolean).join(' · ');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gap = missing();
    if (gap) {
      const [key, label] = gap;
      setError({ key, text: `We still need ${label}.` });
      document.getElementById(`sell-${key}`)?.focus();
      return;
    }
    if (photos.length === 0) {
      setError({ key: 'photos', text: 'Add at least one photo — nobody buys a car they cannot see.' });
      return;
    }
    setError(null);
    setSending(true);
    /* Lands in the admin Enquiries list with a type the yard can sort on —
       a listing offer is a different job from a question about stock. */
    /* A real listing, held for approval.
       `Pending` and `source: 'public'` are also enforced by the insert policy,
       so a tampered payload is refused by Postgres rather than merely by this
       object — a submission can never publish itself. */
    const result = isCar
      ? await submitVehicleListing({
          name: `Mazda ${labelForModel(form.model)}`,
          year: Number(form.year) || null,
          price: Number(form.price) || 0,
          mileage: Number(form.mileage) || null,
          trans: form.trans || null,
          fuel: form.fuel || null,
          color: form.colour || null,
          regNumber: form.regNumber || '',
          description: form.notes.trim(),
          images: photos,
          sellerName: form.name.trim(),
          sellerPhone: form.phone.trim(),
        })
      : await submitPartListing({
          name: form.partName.trim(),
          brand: form.partBrand.trim(),
          price: Number(form.price) || 0,
          stock: Number(form.partQty) || 1,
          compat: form.model || null,
          description: form.notes.trim(),
          images: photos,
          sellerName: form.name.trim(),
          sellerPhone: form.phone.trim(),
        });

    setSending(false);
    // The thank-you page is only honest once the offer is on file.
    if (!result.ok) { setError({ key: 'name', text: result.reason }); return; }
    setSent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    isCar
      ? `Hello Zoom Imports, I would like to list my car with you. ${summary || ''}`
      : `Hello Zoom Imports, I would like to list spare parts with you. ${summary || ''}`
  )}`;

  /* ── Thank-you state ─────────────────────────────────────────────── */
  if (!sellerListingsOpen) {
    return (
      <div className="animate-fade-in" style={{ padding: '80px var(--gutter)', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-lg)', color: 'var(--text-dark)', marginBottom: '12px' }}>
          We are not taking listings right now
        </h1>
        <p style={{ fontSize: 'var(--text-md)', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '24px' }}>
          The yard has paused seller submissions. Talk to us directly and we will tell you
          when it reopens.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageSquare size={16} /> Message us
          </a>
          <button onClick={() => navigateTo('vehicles')} className="btn-secondary">Back to the lot</button>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div style={{ padding: '48px var(--gutter) 80px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <CheckCircle2 size={46} color="var(--verify)" style={{ marginBottom: '18px' }} />
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-lg)', color: 'var(--text-dark)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Got it — we will call you
        </h1>
        <p style={{ fontSize: 'var(--text-md)', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '10px' }}>
          Thank you, {form.name.trim()}. Our team will ring {form.phone.trim()} within one
          working day to talk through {isCar ? 'the car' : 'the parts'} and agree a price.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '26px' }}>
          Your photos came through with it. Someone checks the listing before it goes on
          the site, so it will not appear straight away.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageSquare size={16} /> Ask us a question
          </a>
          <button onClick={() => navigateTo(isCar ? 'vehicles' : 'parts')} className="btn-secondary">
            Back to the {isCar ? 'lot' : 'catalogue'}
          </button>
        </div>
      </div>
    );
  }

  /* ── The form ────────────────────────────────────────────────────── */
  return (
    <div>
      <section style={{ background: 'transparent', borderBottom: '1px solid var(--band-line)', padding: '26px var(--gutter) 40px' }}>
        <button
          onClick={() => navigateTo(isCar ? 'vehicles' : 'parts')}
          className="mono link-draw"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center',
            gap: '8px', marginBottom: '24px',
          }}
        >
          <ArrowLeft size={14} /> {isCar ? 'All vehicles' : 'Spare parts'}
        </button>

        <div className="mono" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
          {/* "Supply the shelf" was in-house language. Someone arriving with
              a boot full of parts has to recognise the page as theirs in the
              first two words. */}
          {isCar ? 'Sell your Mazda' : 'Sell spare parts'}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 600,
            fontSize: 'var(--text-fluid-xl)', letterSpacing: '-0.025em',
            color: 'var(--text-dark)', lineHeight: 1.05, marginBottom: '14px', maxWidth: '20ch',
          }}
        >
          {isCar ? 'List your Mazda on our lot' : 'List your Mazda spare parts with us'}
        </h1>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', maxWidth: '58ch', lineHeight: 1.65 }}>
          {isCar
            ? 'Tell us what you have and we will come back with what we think it will fetch. Cars listed through us carry a seller badge, so buyers know whose figures they are reading.'
            : 'New or used, genuine or aftermarket — tell us what you hold and which models it fits. We confirm what it fits before it is listed.'}
        </p>
      </section>

      <section style={{ background: 'var(--bg-app)', padding: '34px var(--gutter) 80px' }}>
        <div className="sell-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '34px', alignItems: 'start' }}>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: '12px', padding: '26px', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Fieldset title="Your details">
              <Row>
                <Field label="Your name" required>
                  <input className="field" id="sell-name" aria-invalid={error?.key === 'name' || undefined} value={form.name} onChange={set('name')} placeholder="Faith Njeri" />
                </Field>
                <Field label="Phone / WhatsApp" required>
                  <input className="field" id="sell-phone" aria-invalid={error?.key === 'phone' || undefined} value={form.phone} onChange={set('phone')} placeholder="07xx xxx xxx" inputMode="tel" />
                </Field>
              </Row>
              <Field label="Email" required>
                <input className="field" type="email" id="sell-email" aria-invalid={error?.key === 'email' || undefined} value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </Field>
            </Fieldset>

            {isCar ? (
              <Fieldset title="The car">
                {/* The whole range, grouped — the same list the lot filters by,
                    so what a seller picks is a value the catalogue already
                    understands rather than free text someone has to re-key. */}
                <Field label="Mazda model" required>
                  <select className="field" id="sell-model" aria-invalid={error?.key === 'model' || undefined} value={form.model} onChange={set('model')} style={{ cursor: 'pointer' }}>
                    <option value="">Select your model…</option>
                    {MAZDA_MODEL_GROUPS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.models.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>

                <Row>
                  <Field label="Year" required>
                    <select className="field" id="sell-year" aria-invalid={error?.key === 'year' || undefined} value={form.year} onChange={set('year')} style={{ cursor: 'pointer' }}>
                      <option value="">Select…</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </Field>
                  <Field label="Odometer (km)" required>
                    <input className="field" id="sell-mileage" aria-invalid={error?.key === 'mileage' || undefined} value={form.mileage} onChange={set('mileage')} placeholder="68000" inputMode="numeric" />
                  </Field>
                </Row>

                <Row>
                  <Field label="Transmission" required>
                    <select className="field" id="sell-trans" aria-invalid={error?.key === 'trans' || undefined} value={form.trans} onChange={set('trans')} style={{ cursor: 'pointer' }}>
                      <option value="">Select…</option>
                      {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Fuel" required>
                    <select className="field" id="sell-fuel" aria-invalid={error?.key === 'fuel' || undefined} value={form.fuel} onChange={set('fuel')} style={{ cursor: 'pointer' }}>
                      <option value="">Select…</option>
                      {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                </Row>

                <Row>
                  <Field label="Colour" required>
                    <input className="field" id="sell-colour" aria-invalid={error?.key === 'colour' || undefined} value={form.colour} onChange={set('colour')} placeholder="Pearl White" />
                  </Field>
                  <Field label="Registration number" required>
                    <input className="field" id="sell-regNumber" aria-invalid={error?.key === 'regNumber' || undefined} value={form.regNumber} onChange={set('regNumber')} placeholder="KDN 412A" />
                  </Field>
                </Row>
              </Fieldset>
            ) : (
              <Fieldset title="The parts">
                <Field label="What is the part?" required>
                  <input className="field" id="sell-partName" aria-invalid={error?.key === 'partName' || undefined} value={form.partName} onChange={set('partName')} placeholder="Front brake pad set" />
                </Field>
                <Row>
                  <Field label="Brand" required>
                    <input className="field" id="sell-partBrand" aria-invalid={error?.key === 'partBrand' || undefined} value={form.partBrand} onChange={set('partBrand')} placeholder="Mazda Genuine, KYB" />
                  </Field>
                  <Field label="Quantity held" required>
                    <input className="field" id="sell-partQty" aria-invalid={error?.key === 'partQty' || undefined} value={form.partQty} onChange={set('partQty')} placeholder="12" inputMode="numeric" />
                  </Field>
                </Row>
                <Field label="Which Mazda model does it fit?" required>
                  <select className="field" id="sell-model" aria-invalid={error?.key === 'model' || undefined} value={form.model} onChange={set('model')} style={{ cursor: 'pointer' }}>
                    <option value="">Select a model…</option>
                    {MAZDA_MODEL_GROUPS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.models.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
              </Fieldset>
            )}

            <Fieldset title={isCar ? 'Price and condition' : 'Price and notes'}>
              <Field label={isCar ? 'Asking price (KES)' : 'Asking price per unit (KES)'} required>
                <input className="field" id="sell-price" aria-invalid={error?.key === 'price' || undefined} value={form.price} onChange={set('price')} placeholder={isCar ? '1450000' : '4500'} inputMode="numeric" />
              </Field>
              <Field label="Photos" required>
                {/* Compressed in the browser before upload, so a seller on a
                    phone is not sending 12MB per shot over mobile data. */}
                <ImagePicker
                  bucket="listing-submissions"
                  value={photos}
                  onChange={setPhotos}
                  max={8}
                />
                {error?.key === 'photos' && (
                  <div role="alert" style={{ fontSize: 'var(--text-sm)', color: '#a13f3f', marginTop: '6px' }}>
                    {error.text}
                  </div>
                )}
              </Field>

              <Field label={isCar ? 'Condition and history' : 'Condition and notes'} required>
                <textarea
                  className="field"
                  id="sell-notes"
                  aria-invalid={error?.key === 'notes' || undefined}
                  rows={4}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder={isCar
                    ? 'Service history, accident history, what needs doing, where the car is now.'
                    : 'New or used, packaging, where the stock is held.'}
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </Field>
            </Fieldset>

            {error && (
              <div
                role="alert"
                style={{
                  background: '#f6e6e6', color: '#8a3232', border: '1px solid #e3c4c4',
                  borderRadius: '8px', padding: '11px 14px', fontSize: 'var(--text-sm)', marginBottom: '16px',
                }}
              >
                {error.text}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 'var(--text-base)' }}>
              {isCar ? 'Send it to the yard' : 'Send it to the parts counter'}
            </button>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: '11px', lineHeight: 1.6, textAlign: 'center' }}>
              No obligation. We will call you back with a figure before anything is listed.
            </p>
          </form>

          {/* What happens next — the questions people ask before filling this in */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Aside icon={Clock} title="We call within a day">
              {isCar
                ? 'One of our buyers rings you, usually the same afternoon, to go through the details and book a look.'
                : 'One of our parts buyers rings you, usually the same afternoon, to check the part numbers and agree a price.'}
            </Aside>
            <Aside icon={Camera} title="What to photograph">
              {isCar
                ? 'Four corners, the interior and the dash reading. Add them above — the clearer the pictures, the quicker we can price it.'
                : 'The part number stamped on it, any box or label, and the wear surfaces. Add them above — a readable part number is what lets us price it without guessing.'}
            </Aside>
            <Aside icon={ShieldCheck} title={isCar ? 'Your figures, marked as yours' : 'We check the fitment first'}>
              {isCar
                ? 'Cars we have not inspected carry a seller badge on the listing, and the dossier says the numbers are yours. We do not present them as our own findings.'
                : 'Nothing is listed until we have confirmed which models it actually fits. That check is ours, so a buyer is never relying on a guess.'}
            </Aside>
            <Aside icon={Banknote} title="No listing fee">
              Nothing to pay to be listed. We agree the split when there is a sale to split.
            </Aside>

            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '13px', fontSize: 'var(--text-sm)' }}>
              <MessageSquare size={16} /> Rather just WhatsApp us
            </a>
          </aside>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .sell-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .sell-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const Fieldset = ({ title, children }) => (
  <fieldset style={{ border: 'none', marginBottom: '22px' }}>
    <legend className="mono" style={{ color: 'var(--accent)', marginBottom: '13px', padding: 0 }}>
      {title}
    </legend>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>{children}</div>
  </fieldset>
);

const Row = ({ children }) => (
  <div className="sell-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '13px' }}>
    {children}
  </div>
);

const Field = ({ label, required = false, children }) => (
  <label style={{ display: 'block' }}>
    <span
      style={{
        display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600,
        color: 'var(--text-body)', marginBottom: '5px',
      }}
    >
      {label}
      {required && <span style={{ color: 'var(--accent)', marginLeft: '3px' }} aria-hidden="true">*</span>}
    </span>
    {children}
  </label>
);

const Aside = ({ icon: Icon, title, children }) => (
  <div
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
      borderRadius: '10px', padding: '16px 18px', display: 'flex', gap: '12px',
      alignItems: 'flex-start',
    }}
  >
    <Icon size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
    <div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)' }}>{children}</div>
    </div>
  </div>
);
