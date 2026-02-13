// {{PROJECT_TITLE}} - Main entry point

const APP_CONTAINER_ID = 'app';

function main(): void {
  const app = document.getElementById(APP_CONTAINER_ID);
  
  if (!app) {
    throw new Error(`Container element #${APP_CONTAINER_ID} not found`);
  }
  
  app.innerHTML = `
    <div>
      <h1>{{PROJECT_TITLE}}</h1>
      <p>Welcome to your TypeScript project!</p>
    </div>
  `;
}

main();
