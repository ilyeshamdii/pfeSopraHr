import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptStyleLoaderService {

  loadScripts(scripts: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const promises: Promise<void>[] = [];
      scripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.src = script;
        scriptElement.type = 'text/javascript';
        scriptElement.async = true;
        scriptElement.onload = () => resolve();
        scriptElement.onerror = (error) => reject(error);
        document.head.appendChild(scriptElement);
      });
    });
  }

  loadStyles(styles: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const promises: Promise<void>[] = [];
      styles.forEach(style => {
        const linkElement = document.createElement('link');
        linkElement.href = style;
        linkElement.rel = 'stylesheet';
        linkElement.onload = () => resolve();
        linkElement.onerror = (error) => reject(error);
        document.head.appendChild(linkElement);
      });
    });
  }
}