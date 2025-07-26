document.addEventListener('DOMContentLoaded', function() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const container = document.querySelector('.container');
  if (container) {
    container.style.paddingTop = '60px';
  }

  if (isMobile) {

    const experienceTitle = document.querySelector('.experience-title');
    const experienceTopic = document.querySelector('.experience-topic');
    const experienceText = document.querySelector('.experience-text');

    if (experienceTitle && experienceTopic && experienceText) {
      const experienceWrapper = document.createElement('div');
      experienceWrapper.className = 'experience-wrapper';

      const topics = experienceTopic.textContent.split('\n').filter(item => item.trim() !== '');
      const years = experienceText.textContent.split('\n').filter(item => item.trim() !== '');

      if (topics.length === years.length) {
        for (let i = 0; i < topics.length; i++) {
          const experienceItem = document.createElement('div');
          experienceItem.className = 'experience-item';

          const topicSpan = document.createElement('span');
          topicSpan.textContent = topics[i].trim();

          const yearSpan = document.createElement('span');
          yearSpan.textContent = years[i].trim();

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