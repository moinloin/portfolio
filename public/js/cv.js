document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.getElementById("cursor");
    
    document.addEventListener("mousemove", function(event) {
      requestAnimationFrame(() => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      });
    });
  
    const interactiveElements = document.querySelectorAll('a');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '60px';
        cursor.style.height = '60px';
      });
      
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
      });
    });
  });