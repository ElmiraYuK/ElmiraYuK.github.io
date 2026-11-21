'use strict';
function updateBound() {
  const a = Number(document.getElementById('reserve').value);
  const q = Number(document.getElementById('q').value);
  const T = Number(document.getElementById('horizon').value);
  const L = Number(document.getElementById('radius').value);
  const delta = a === 1 ? Infinity : -Math.log(1 - a) / 2;
  const c = a === 1 ? 0 : Math.exp(delta) * (1 - a);
  const D = 1 / (1 - c);
  const logFactor = Math.log(D) + q * T * (D - 1);
  const logExpm1 = logFactor > 50 ? logFactor + Math.log1p(-Math.exp(-logFactor)) : Math.log(Math.expm1(logFactor));
  const logBound = a === 1 ? -Infinity : Math.log(4 * T) + logExpm1 - delta * L;
  const bound = a === 1 ? 0 : logBound > Math.log(Number.MAX_VALUE) ? Infinity : Math.exp(logBound);
  document.getElementById('reserveOut').value = a < 0.01 ? a.toExponential(2) : a.toFixed(3);
  document.getElementById('qOut').value = q.toFixed(2);
  document.getElementById('horizonOut').value = T.toFixed(1);
  document.getElementById('radiusOut').value = L;
  document.getElementById('boundValue').textContent =
    Number.isFinite(bound) ? (a !== 1 && bound === 0 ? 'Below numerical range' : bound.toExponential(3)) : 'Above numerical range';
  document.getElementById('deltaValue').textContent = a === 1 ? 'No internal routes' : 'δ = ' + delta.toFixed(3);
}
['reserve', 'q', 'horizon', 'radius'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateBound));
updateBound();
