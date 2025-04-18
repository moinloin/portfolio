document.addEventListener('DOMContentLoaded', function() {
  const cursor = document.getElementById("cursor");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const container = document.querySelector('.container');
  if (container) {
    container.style.paddingTop = '60px';
  }

  if (!isMobile) {
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
  } else {
    if (cursor) {
      cursor.style.display = 'none';
    }

    const experienceTitle = document.querySelector('.experience-title');
    const experienceTopic = document.querySelector('.experience-topic');
    const experienceText = document.querySelector('.experience-text');

    if (experienceTitle && experienceTopic && experienceText) {
      const experienceWrapper = document.createElement('div');
      experienceWrapper.className = 'experience-wrapper';

      const topics = experienceTopic.innerHTML.split('<br>').filter(item => item.trim() !== '');
      const years = experienceText.innerHTML.split('<br>').filter(item => item.trim() !== '');

      if (topics.length === years.length) {
        for (let i = 0; i < topics.length; i++) {
          const experienceItem = document.createElement('div');
          experienceItem.className = 'experience-item';

          const topicSpan = document.createElement('span');
          topicSpan.innerHTML = topics[i].trim();

          const yearSpan = document.createElement('span');
          yearSpan.innerHTML = years[i].trim();

          experienceItem.appendChild(topicSpan);
          experienceItem.appendChild(yearSpan);

          experienceWrapper.appendChild(experienceItem);
        }

        if (experienceTitle.nextSibling) {
          experienceTitle.parentNode.insertBefore(experienceWrapper, experienceTitle.nextSibling);
        } else {
          experienceTitle.parentNode.appendChild(experienceWrapper);
        }

        experienceTopic.style.display = 'none';
        experienceText.style.display = 'none';
      }
    }

    const projectElements = document.querySelectorAll('[class^="project-topic"], [class^="project-text"]');
    projectElements.forEach(el => {
      if (el.className.includes('topic')) {
        const section = document.createElement('div');
        section.className = 'project-section';
        el.parentNode.insertBefore(section, el);
        section.appendChild(el);

        const textNumber = el.className.match(/\d+/)[0];
        const textEl = document.querySelector(`.project-text${textNumber}`);
        if (textEl) {
          section.appendChild(textEl);
        }
      }
    });
  }
});