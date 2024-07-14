// custom.js
document.addEventListener('DOMContentLoaded', function() {
    const h1 = document.createElement('h1');
    h1.textContent = 'Hello from Custom JS!';
    document.body.appendChild(h1);
  
    const customDiv = document.createElement('div');
    customDiv.className = 'custom-class';
    customDiv.textContent = 'This is a custom div created by custom.js';
    document.body.appendChild(customDiv);
  });