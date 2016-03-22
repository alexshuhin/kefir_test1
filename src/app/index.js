import K from 'kefir';
import color from 'color-js';

function toColor(num) {
  const b = num & 0xff,
        g = (num & 0xff00) >> 8,
        r = (num & 0xff0000) >> 16;
  return `rgb(${r}, ${g}, ${b})`;
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM bindings
  const redButton = document.querySelector('#red-button');
  const blueButton = document.querySelector('#blue-button');
  const greenButton = document.querySelector('#green-button');
  const messages = document.querySelector('#message');

  // Streams creation
  const redClicks$ = K.fromEvents(redButton, 'click');
  const blueClicks$ = K.fromEvents(blueButton, 'click');
  const greenClicks$ = K.fromEvents(greenButton, 'click');

  // Streams modifications
  const redClicksToggle$ = redClicks$
    .scan((a, b) => { return a ^ true }, true);
  const greenClicksToggle$ = greenClicks$
    .scan((a, b) => { return a ^ true }, true);
  const blueClicksToggle$ = blueClicks$
    .scan((a, b) => { return a ^ true }, true);

  const combineClicks = [
    redClicksToggle$,
    greenClicksToggle$,
    blueClicksToggle$
  ];

  const colorsCompose$ = K.combine(combineClicks, (r, g, b) => {
    const resultColor = r * 0xff0000 | g * 0x00ff00 | b * 0x0000ff;
    return color(toColor(resultColor));
  });

  // Side effect
  redClicksToggle$.onValue((value) => {
    if (value) redButton.classList.add('btn-danger');
    else redButton.classList.remove('btn-danger');
  });
  greenClicksToggle$.onValue((value) => {
    if (value) greenButton.classList.add('btn-success')
    else greenButton.classList.remove('btn-success')
  });
  blueClicksToggle$.onValue((value) => {
    if (value) blueButton.classList.add('btn-primary')
    else blueButton.classList.remove('btn-primary')
  });
  colorsCompose$.onValue((v) => {
    console.log(v.toString());
    messages.style.backgroundColor = v.toString();
  });
});
