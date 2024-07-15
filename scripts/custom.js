// scripts/custom.js

function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

async function loadResources() {
  const deviceType = detectDeviceType();
  const response = await fetch('/custom');
  
  if (!response.ok) {
    console.error('Failed to fetch resources from /custom');
    return;
  }

  const jsonResponse = await response.json();

  const resources = {
    mobile: {
      preload: jsonResponse.M_PRELOAD,
      postload: jsonResponse.M_POST_LOAD
    },
    desktop: {
      preload: jsonResponse.PRELOAD,
      postload: jsonResponse.POST_LOAD
    }
  };

  const deviceResources = resources[deviceType] || resources.desktop;

  loadResourceGroup(deviceResources.preload, document.head);
  document.addEventListener('DOMContentLoaded', () => {
    loadResourceGroup(deviceResources.postload, document.body);
  });
}

function loadResourceGroup(resourceGroup, targetElement) {
  if (resourceGroup.css) {
    const preloadStyle = document.createElement('style');
    preloadStyle.innerHTML = resourceGroup.css;
    targetElement.appendChild(preloadStyle);
  }

  if (resourceGroup.js) {
    console.log('Preload JS:', resourceGroup.js);
    const scriptElement = document.createElement('div');
    scriptElement.innerHTML = resourceGroup.js;
    targetElement.appendChild(scriptElement);
  }

  if (resourceGroup.other) {
    console.log('Preload Other:', resourceGroup.other);
    const otherElement = document.createElement('div');
    otherElement.innerHTML = resourceGroup.other;
    targetElement.appendChild(otherElement);
  }
}

document.addEventListener('DOMContentLoaded', loadResources);
