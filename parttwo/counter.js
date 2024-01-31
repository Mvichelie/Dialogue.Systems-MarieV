
export function setupCounter(element) {
  
  renderCounter(0, element);
  const incrementButton = element.querySelector("#counter");
  let count = 0;
  incrementButton.addEventListener('click', () => {
    
    count++;
    renderCounter(count, element);
  });
  function renderCounter(count, element) {
    element.innerHTML = `
      <div>
        <p>Count is ${count}</p>
        <button id="counter">Count</button>
      </div>
    `;
    const incrementButton = element.querySelector("#counter");
    incrementButton.addEventListener('click', () => {
      count++;
      renderCounter(count, element);
    });
  }
}
