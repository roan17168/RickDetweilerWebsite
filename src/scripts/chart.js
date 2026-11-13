'use strict';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function radius(value, max) {
  if (value === null) return 3.5;
  return Math.max(14, Math.sqrt(value / max) * 26);
}

function build(data) {
  const W = 1080;
  const H = 528;
  const labelX = 28;
  const dataX = 300;
  const dataW = 760;
  const colW = dataW / 6;
  const centers = Array.from({ length: 6 }, (_, i) => dataX + colW * (i + 0.5));
  const outcomes = data.groups.flatMap((g) => g.outcomes);
  const max = Math.max(
    ...data.bands.flatMap((b) => b.rows.flatMap((r) => r.values.filter((v) => v !== null)))
  );

  let svg = '';
  svg += `<svg class="big-picture-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="bp-chart-title bp-chart-desc" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<title id="bp-chart-title">The big picture: college experiences linked to six long-term outcomes</title>`;
  svg += `<desc id="bp-chart-desc">A grid of six outcomes grouped under Life of Consequence, Life of Inquiry and Life of Accomplishment. Rows list college experiences under Content and Context. Each navy circle contains the percentage by which graduates with more of that experience were more likely to report the outcome. A small grey dot means no substantial link.</desc>`;

  // Group pills.
  data.groups.forEach((group, i) => {
    const x = dataX + i * colW * 2 + 2;
    const w = colW * 2 - 4;
    svg += `<rect x="${x}" y="18" width="${w}" height="30" rx="6" fill="#1b365d"/>`;
    svg += `<text x="${x + w / 2}" y="38" font-size="13.5" font-weight="600" fill="#ffffff" text-anchor="middle">${esc(group.label)}</text>`;
    group.outcomes.forEach((outcome, j) => {
      const cx = centers[i * 2 + j];
      const words = outcome.split(' ');
      if (words.length > 2 || (words.length === 2 && outcome.length > 16)) {
        const split = outcome.lastIndexOf(' ', outcome.length - 7) > 0 ? outcome.lastIndexOf(' ', outcome.length - 7) : outcome.indexOf(' ');
        svg += `<text x="${cx}" y="68" font-size="13.5" font-weight="600" fill="#1f2937" text-anchor="middle">${esc(outcome.slice(0, split))}</text>`;
        svg += `<text x="${cx}" y="85" font-size="13.5" font-weight="600" fill="#1f2937" text-anchor="middle">${esc(outcome.slice(split + 1))}</text>`;
      } else {
        svg += `<text x="${cx}" y="72" font-size="13.5" font-weight="600" fill="#1f2937" text-anchor="middle">${esc(outcome)}</text>`;
      }
    });
  });

  svg += `<line x1="20" x2="${W - 20}" y1="102" y2="102" stroke="#1b365d" stroke-width="1.5"/>`;
  svg += `<line x1="${dataX + colW * 2}" x2="${dataX + colW * 2}" y1="108" y2="508" stroke="#cbd5e1" stroke-dasharray="3 3"/>`;
  svg += `<line x1="${dataX + colW * 4}" x2="${dataX + colW * 4}" y1="108" y2="508" stroke="#cbd5e1" stroke-dasharray="3 3"/>`;

  let y = 176;
  data.bands.forEach((band, bandIndex) => {
    if (bandIndex === 0) {
      svg += `<rect x="20" y="112" width="${W - 40}" height="28" rx="4" fill="#faf5e4"/>`;
      svg += `<text x="32" y="131" font-size="12.5" font-weight="700" fill="#866a14" letter-spacing="0.6">${esc(band.label.toUpperCase())}</text>`;
    } else {
      svg += `<line x1="20" x2="${W - 20}" y1="304" y2="304" stroke="#e2e8f0"/>`;
      svg += `<rect x="20" y="316" width="${W - 40}" height="28" rx="4" fill="#faf5e4"/>`;
      svg += `<text x="32" y="335" font-size="12.5" font-weight="700" fill="#866a14" letter-spacing="0.6">${esc(band.label.toUpperCase())}</text>`;
      y = 380;
    }

    band.rows.forEach((row) => {
      svg += `<line x1="20" x2="${W - 20}" y1="${y + 25}" y2="${y + 25}" stroke="#e2e8f0"/>`;
      svg += `<text x="${labelX}" y="${y + 5}" font-size="13.5" font-weight="500" fill="#2e4053">${esc(row.label)}</text>`;
      row.values.forEach((value, i) => {
        const cx = centers[i];
        if (value === null) {
          svg += `<circle cx="${cx}" cy="${y}" r="3.5" fill="#cbd5e1"/>`;
        } else {
          const r = radius(value, max);
          svg += `<circle cx="${cx}" cy="${y}" r="${r.toFixed(1)}" fill="#1b365d"/>`;
          svg += `<text x="${cx}" y="${y + 4.5}" font-size="12.5" font-weight="700" fill="#ffffff" text-anchor="middle">${value}%</text>`;
        }
      });
      y += 50;
    });
  });

  svg += `<line x1="20" x2="${W - 20}" y1="508" y2="508" stroke="#1b365d" stroke-width="1.5"/>`;
  svg += `</svg>`;

  let table = '<div class="chart-table-wrap">';
  table += '<table class="chart-table">';
  table += `<caption>${esc(data.title)}: the numbers behind the chart</caption>`;
  table += '<thead><tr><th scope="col">College experience</th>';
  outcomes.forEach((o) => {
    table += `<th scope="col">${esc(o)}</th>`;
  });
  table += '</tr></thead><tbody>';
  data.bands.forEach((band) => {
    table += `<tr class="chart-table-band"><th colspan="${outcomes.length + 1}" scope="colgroup">${esc(band.label)}</th></tr>`;
    band.rows.forEach((row) => {
      table += `<tr><th scope="row">${esc(row.label)}</th>`;
      row.values.forEach((value) => {
        table += value === null
          ? '<td class="is-empty"><span aria-label="No substantial link">—</span></td>'
          : `<td>${value}%</td>`;
      });
      table += '</tr>';
    });
  });
  table += '</tbody></table></div>';

  let cards = '<div class="chart-cards">';
  data.bands.forEach((band) => {
    cards += `<section class="chart-card-group"><h3 class="chart-card-band">${esc(band.label)}</h3>`;
    band.rows.forEach((row) => {
      const found = [];
      const missing = [];
      row.values.forEach((value, i) => {
        if (value === null) missing.push(outcomes[i]);
        else found.push({ outcome: outcomes[i], value: value });
      });
      cards += `<article class="chart-card"><h4>${esc(row.label)}</h4><dl>`;
      found.forEach((item) => {
        cards += `<div><dt>${esc(item.outcome)}</dt><dd>${item.value}%</dd></div>`;
      });
      cards += '</dl>';
      if (missing.length) {
        cards += `<p class="chart-card-null">No substantial link: ${esc(missing.join(', '))}.</p>`;
      }
      cards += '</article>';
    });
    cards += '</section>';
  });
  cards += '</div>';

  return `<figure class="chart-figure" id="big-picture">
  <figcaption class="chart-caption">
    <span class="section-label">The chart</span>
    <h2>${esc(data.title)}</h2>
    <p class="chart-subtitle">${esc(data.subtitle)}</p>
  </figcaption>
  <div class="chart-legend" aria-hidden="true">
    <span><span class="legend-dot legend-dot-navy"></span> Percent more likely</span>
    <span><span class="legend-dot legend-dot-grey"></span> No substantial link</span>
  </div>
  <div class="chart-visual">${svg}</div>
  ${table}
  ${cards}
  <p class="chart-note">${esc(data.note)}</p>
</figure>`;
}

module.exports = { build };
