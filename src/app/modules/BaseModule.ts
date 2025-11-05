export abstract class BaseModule {
  protected section: HTMLElement | null = null;
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;

  constructor(id: string, title: string, subtitle: string) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
  }

  createView(): HTMLElement {
    const section = document.createElement("section");
    section.className = "module-card";
    section.id = this.id;

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.textContent = this.title;
    const subtitle = document.createElement("span");
    subtitle.className = "tag";
    subtitle.textContent = this.subtitle;
    header.append(title, subtitle);

    const content = document.createElement("div");
    content.className = "module-content";
    const maybePromise = this.render(content);
    if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
      (maybePromise as Promise<void>).catch((error) => {
        console.error(`[${this.title}] Ошибка инициализации модуля`, error);
      });
    }

    section.append(header, content);
    this.section = section;
    this.afterRender(section);
    return section;
  }

  protected abstract render(container: HTMLElement): void | Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected afterRender(_section: HTMLElement): void {}
}
