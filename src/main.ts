import "./styles.css";
import { App } from "./app/ui/App";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Корневой контейнер #app не найден");
}

const app = new App(root);
app.init();
