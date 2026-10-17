import { useEffect } from "react";

const DESCRIPTION_SELECTOR = 'meta[name="description"]';

export function usePageMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;

    let element = document.querySelector<HTMLMetaElement>(DESCRIPTION_SELECTOR);
    if (!element) {
      element = document.createElement("meta");
      element.name = "description";
      document.head.appendChild(element);
    }
    element.content = description;
  }, [title, description]);
}
